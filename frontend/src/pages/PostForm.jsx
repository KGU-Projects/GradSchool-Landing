import { useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { CATEGORIES, isAdminNow } from './boardUtil.js'

export default function PostForm() {
  const { id } = useParams()
  const { state } = useLocation()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const admin = isAdminNow()
  const editing = !!id
  const old = state?.post
  const [f, setF] = useState({
    category: old?.category || params.get('category') || 'FREE',
    title: old?.title || '', content: old?.content || '', author: old?.author || '',
    password: '', pinned: old?.pinned || false,
  })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  if (editing && !old) { // 새로고침 등으로 비밀번호 상태가 사라진 경우
    return <div className="inner page"><p className="err">잘못된 접근입니다. 게시글에서 다시 수정을 눌러 주세요.</p></div>
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      if (editing) {
        await api(`/posts/${id}`, { method: 'PUT', body: { title: f.title, content: f.content, password: state.password, pinned: f.pinned } })
        nav(`/board/${id}`)
      } else {
        const r = await api('/posts', { method: 'POST', body: { ...f, author: f.author || '관리자' } })
        nav(`/board/${r.id}`)
      }
    } catch (e2) { setErr(e2.message) }
  }

  return (
    <div className="inner page">
      <h1 className="pageTitle font-inter">{editing ? '글 수정' : '글쓰기'}</h1>
      <form className="form" onSubmit={submit}>
        {!editing && (
          <select value={f.category} onChange={set('category')}>
            {CATEGORIES.filter(([k]) => k && (admin || k !== 'NOTICE')).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        )}
        {!editing && !admin && (
          <div className="form__row">
            <input required maxLength={30} placeholder="닉네임" value={f.author} onChange={set('author')} />
            <input required minLength={4} maxLength={50} type="password" placeholder="비밀번호 (수정/삭제용, 4자 이상)" value={f.password} onChange={set('password')} />
          </div>
        )}
        <input required maxLength={150} placeholder="제목" value={f.title} onChange={set('title')} />
        <textarea required rows={14} maxLength={20000} placeholder="내용" value={f.content} onChange={set('content')} />
        {admin && <label className="check"><input type="checkbox" checked={f.pinned} onChange={set('pinned')} /> 상단 고정</label>}
        {err && <p className="err">{err}</p>}
        <div className="post__actions">
          <button type="button" className="btn btn--line" onClick={() => nav(-1)}>취소</button>
          <button className="btn btn--primary">{editing ? '수정' : '등록'}</button>
        </div>
      </form>
    </div>
  )
}
