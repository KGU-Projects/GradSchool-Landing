import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useSite } from '../SiteContext.jsx'

const ROLES = { PROFESSOR: '교수', PHD: '박사과정', MASTER: '석사과정', ALUMNI: '졸업생' }
const EMPTY = { name: '', role: 'MASTER', title: '', field: '', email: '', phone: '', office: '', photoUrl: '', bio: '', homepage: '', sortOrder: 0, visible: true }

export default function MembersAdmin() {
  const { reload } = useSite()
  const [list, setList] = useState([])
  const [edit, setEdit] = useState(null)
  const [err, setErr] = useState('')

  const load = () => api('/admin/members').then(setList).catch((e) => setErr(e.message))
  useEffect(() => { load() }, [])

  const set = (k) => (e) => setEdit({ ...edit, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const save = async (e) => {
    e.preventDefault(); setErr('')
    try {
      const body = { ...edit, sortOrder: Number(edit.sortOrder) || 0 }
      edit.id ? await api(`/admin/members/${edit.id}`, { method: 'PUT', body }) : await api('/admin/members', { method: 'POST', body })
      setEdit(null); load(); reload()
    } catch (e2) { setErr(e2.message) }
  }
  const remove = async (m) => {
    if (!window.confirm(`${m.name} 님을 삭제할까요?`)) return
    await api(`/admin/members/${m.id}`, { method: 'DELETE' }); load(); reload()
  }
  const upload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const form = new FormData(); form.append('file', file)
    try { const r = await api('/admin/uploads', { method: 'POST', form }); setEdit((p) => ({ ...p, photoUrl: r.url })) }
    catch (e2) { setErr(e2.message) }
  }

  if (edit) {
    return (
      <form className="form" onSubmit={save}>
        <h3>{edit.id ? '구성원 수정' : '구성원 추가'}</h3>
        <div className="form__row">
          <input required placeholder="이름" value={edit.name} onChange={set('name')} />
          <select value={edit.role} onChange={set('role')}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </div>
        <div className="form__row">
          <input placeholder="직위 (예: 교수, 부교수)" value={edit.title || ''} onChange={set('title')} />
          <input placeholder="연구 분야" value={edit.field || ''} onChange={set('field')} />
        </div>
        <div className="form__row">
          <input type="email" placeholder="이메일" value={edit.email || ''} onChange={set('email')} />
          <input placeholder="전화" value={edit.phone || ''} onChange={set('phone')} />
        </div>
        <div className="form__row">
          <input placeholder="연구실 위치" value={edit.office || ''} onChange={set('office')} />
          <input placeholder="홈페이지 URL (https://...)" value={edit.homepage || ''} onChange={set('homepage')} />
        </div>
        <textarea rows={4} maxLength={2000} placeholder="소개" value={edit.bio || ''} onChange={set('bio')} />
        <div className="form__row">
          <input type="file" accept="image/*" onChange={upload} />
          <input type="number" placeholder="정렬 순서 (작을수록 앞)" value={edit.sortOrder} onChange={set('sortOrder')} />
        </div>
        {edit.photoUrl && <img className="thumb" src={edit.photoUrl} alt="미리보기" />}
        <label className="check"><input type="checkbox" checked={edit.visible} onChange={set('visible')} /> 공개</label>
        {err && <p className="err">{err}</p>}
        <div className="post__actions">
          <button type="button" className="btn btn--line" onClick={() => setEdit(null)}>취소</button>
          <button className="btn btn--primary">저장</button>
        </div>
      </form>
    )
  }
  return (
    <div>
      <button className="btn btn--primary" onClick={() => setEdit({ ...EMPTY })}>+ 구성원 추가</button>
      {err && <p className="err">{err}</p>}
      <table className="table">
        <thead><tr><th>이름</th><th>구분</th><th>연구 분야</th><th>공개</th><th /></tr></thead>
        <tbody>
          {list.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td><td>{ROLES[m.role]}</td><td>{m.field}</td><td>{m.visible ? 'O' : '-'}</td>
              <td className="table__act"><button onClick={() => setEdit(m)}>수정</button><button onClick={() => remove(m)}>삭제</button></td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={5} className="empty">구성원이 없습니다.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
