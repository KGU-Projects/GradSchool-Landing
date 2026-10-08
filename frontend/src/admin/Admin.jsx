import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken, setToken } from '../api.js'
import MembersAdmin from './MembersAdmin.jsx'
import ContentAdmin from './ContentAdmin.jsx'

function Login({ onDone }) {
  const [f, setF] = useState({ username: '', password: '' })
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    try {
      const r = await api('/auth/login', { method: 'POST', body: f })
      setToken(r.token); onDone()
    } catch (e2) { setErr(e2.message) }
  }
  return (
    <div className="inner page">
      <h1 className="pageTitle font-inter">Admin</h1>
      <form className="form form--narrow" onSubmit={submit}>
        <input required placeholder="아이디" autoComplete="username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
        <input required type="password" placeholder="비밀번호" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p className="err">{err}</p>}
        <button className="btn btn--primary">로그인</button>
      </form>
    </div>
  )
}

function Account() {
  const [f, setF] = useState({ currentPassword: '', newPassword: '' })
  const [msg, setMsg] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    try {
      await api('/auth/password', { method: 'PUT', body: f })
      setF({ currentPassword: '', newPassword: '' }); setMsg('비밀번호가 변경되었습니다.')
    } catch (e2) { setMsg(e2.message) }
  }
  return (
    <form className="form form--narrow" onSubmit={submit}>
      <h3>비밀번호 변경</h3>
      <input required type="password" placeholder="현재 비밀번호" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} />
      <input required minLength={8} type="password" placeholder="새 비밀번호 (8자 이상)" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} />
      {msg && <p className="note">{msg}</p>}
      <button className="btn btn--dark">변경</button>
    </form>
  )
}

const TABS = [['members', '구성원 관리'], ['content', '홈페이지 내용'], ['board', '게시판 관리'], ['account', '계정']]

export default function Admin() {
  const [authed, setAuthed] = useState(null) // null=확인 중
  const [tab, setTab] = useState('members')

  const check = () => {
    if (!getToken()) return setAuthed(false)
    api('/auth/me').then(() => setAuthed(true)).catch(() => { setToken(null); setAuthed(false) })
  }
  useEffect(check, [])

  if (authed === null) return <div className="inner page" />
  if (!authed) return <Login onDone={check} />
  return (
    <div className="inner page">
      <div className="admin__top">
        <h1 className="pageTitle font-inter">Admin</h1>
        <button className="btn btn--line" onClick={() => { setToken(null); setAuthed(false) }}>로그아웃</button>
      </div>
      <div className="tabs">
        {TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === 'members' && <MembersAdmin />}
      {tab === 'content' && <ContentAdmin />}
      {tab === 'board' && (
        <div className="note">
          관리자로 로그인된 상태에서는 <Link to="/board">게시판</Link>에서 모든 글/댓글을 비밀번호 없이 수정·삭제할 수 있고,
          공지사항 작성과 상단 고정이 가능합니다.
          <p><Link to="/board/write?category=NOTICE" className="btn btn--primary">공지 작성</Link></p>
        </div>
      )}
      {tab === 'account' && <Account />}
    </div>
  )
}
