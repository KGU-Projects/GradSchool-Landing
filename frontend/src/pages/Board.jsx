import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { CATEGORIES, catLabel, fmtDate } from './boardUtil.js'

export default function Board() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const q = params.get('q') || ''
  const page = Number(params.get('page') || 0)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [input, setInput] = useState(q)

  useEffect(() => {
    const qs = new URLSearchParams({ page, size: 10 })
    if (category) qs.set('category', category)
    if (q) qs.set('q', q)
    setError('')
    api(`/posts?${qs}`).then(setData).catch((e) => setError(e.message))
  }, [category, q, page])

  const go = (next) => {
    const p = new URLSearchParams(params)
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)))
    setParams(p)
  }

  return (
    <div className="inner page">
      <h1 className="pageTitle font-inter">Community</h1>
      <p className="pageLead">로그인 없이 닉네임과 비밀번호만으로 글을 남길 수 있습니다.</p>
      <div className="tabs">
        {CATEGORIES.map(([k, label]) => (
          <button key={k} className={k === category ? 'on' : ''} onClick={() => go({ category: k, page: '' })}>{label}</button>
        ))}
      </div>
      <form className="searchbar" onSubmit={(e) => { e.preventDefault(); go({ q: input.trim(), page: '' }) }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="제목/내용 검색" aria-label="검색어" />
        <button className="btn btn--dark">검색</button>
        <Link to={`/board/write${category ? `?category=${category}` : ''}`} className="btn btn--primary">글쓰기</Link>
      </form>
      {error && <p className="err">{error}</p>}
      <ul className="blist">
        {data?.content.map((p) => (
          <li key={p.id} className={p.pinned ? 'pinned' : ''}>
            <Link to={`/board/${p.id}`}>
              <span className="blist__cat">{p.pinned ? '공지' : catLabel(p.category)}</span>
              <span className="blist__title">{p.title}{p.commentCount > 0 && <em>[{p.commentCount}]</em>}</span>
              <span className="blist__meta">{p.author} · {fmtDate(p.createdAt)} · 조회 {p.viewCount}</span>
            </Link>
          </li>
        ))}
        {data && !data.content.length && <li className="empty">게시글이 없습니다.</li>}
      </ul>
      {data && data.totalPages > 1 && (
        <div className="pager">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} className={i === data.number ? 'on' : ''} onClick={() => go({ page: i || '' })}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  )
}
