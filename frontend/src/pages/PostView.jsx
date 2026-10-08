import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { catLabel, fmtDate, isAdminNow } from './boardUtil.js'

export default function PostView() {
  const { id } = useParams()
  const nav = useNavigate()
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  const [c, setC] = useState({ author: '', password: '', content: '' })
  const admin = isAdminNow()

  const load = useCallback(() => {
    api(`/posts/${id}`).then(setPost).catch((e) => setError(e.message))
  }, [id])
  useEffect(load, [load])

  const askPw = () => (admin ? '' : window.prompt('작성 시 입력한 비밀번호를 입력하세요.'))

  const delPost = async () => {
    const pw = askPw()
    if (pw === null || !window.confirm('삭제하시겠습니까?')) return
    try { await api(`/posts/${id}`, { method: 'DELETE', headers: { 'X-Password': pw } }); nav('/board') }
    catch (e) { alert(e.message) }
  }
  const editPost = () => {
    const pw = askPw()
    if (pw === null) return
    nav(`/board/${id}/edit`, { state: { password: pw, post } })
  }
  const delComment = async (cid) => {
    const pw = askPw()
    if (pw === null) return
    try { await api(`/posts/${id}/comments/${cid}`, { method: 'DELETE', headers: { 'X-Password': pw } }); load() }
    catch (e) { alert(e.message) }
  }
  const addComment = async (e) => {
    e.preventDefault()
    try {
      await api(`/posts/${id}/comments`, { method: 'POST', body: c })
      setC({ author: '', password: '', content: '' }); load()
    } catch (err) { alert(err.message) }
  }

  if (error) return <div className="inner page"><p className="err">{error}</p><Link to="/board" className="more">목록으로</Link></div>
  if (!post) return <div className="inner page" />
  return (
    <div className="inner page post">
      <span className="blist__cat">{catLabel(post.category)}</span>
      <h1 className="postTitle">{post.title}</h1>
      <p className="blist__meta">{post.author} · {fmtDate(post.createdAt)} · 조회 {post.viewCount}</p>
      {/* 내용은 텍스트로만 렌더링 (XSS 방지) */}
      <div className="post__body">{post.content}</div>
      <div className="post__actions">
        <Link to="/board" className="btn btn--dark">목록</Link>
        <button className="btn btn--line" onClick={editPost}>수정</button>
        <button className="btn btn--line" onClick={delPost}>삭제</button>
      </div>
      <h2 className="font-inter cmt__h">Comments ({post.comments.length})</h2>
      <ul className="cmt">
        {post.comments.map((x) => (
          <li key={x.id}>
            <div><strong>{x.author}</strong> <span>{fmtDate(x.createdAt)}</span>
              <button onClick={() => delComment(x.id)}>삭제</button></div>
            <p>{x.content}</p>
          </li>
        ))}
      </ul>
      <form className="cmt__form" onSubmit={addComment}>
        {!admin && <>
          <input required maxLength={30} placeholder="닉네임" value={c.author} onChange={(e) => setC({ ...c, author: e.target.value })} />
          <input required minLength={4} maxLength={50} type="password" placeholder="비밀번호 (4자 이상)" value={c.password} onChange={(e) => setC({ ...c, password: e.target.value })} />
        </>}
        <textarea required maxLength={1000} placeholder="댓글을 입력하세요" value={c.content} onChange={(e) => setC({ ...c, content: e.target.value, author: admin ? '관리자' : c.author })} />
        <button className="btn btn--primary">등록</button>
      </form>
    </div>
  )
}
