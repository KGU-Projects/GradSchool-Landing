import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useSite } from '../SiteContext.jsx'

const SECTIONS = {
  site: '기본 정보 (학교명, 연락처, 주소)',
  hero: '메인 배너',
  intro: '소개 / 수치',
  research: '연구 분야',
  programs: '교육 과정',
  admission: '입학 안내',
}

export default function ContentAdmin() {
  const site = useSite()
  const [key, setKey] = useState('site')
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')

  // 현재 적용 중인 값(서버 저장값 또는 기본값)을 편집 시작점으로 사용
  useEffect(() => { setText(JSON.stringify(site[key], null, 2)); setMsg('') }, [key, site])

  const save = async () => {
    let body
    try { body = JSON.parse(text) } catch { return setMsg('JSON 형식이 올바르지 않습니다.') }
    try { await api(`/admin/content/${key}`, { method: 'PUT', body }); site.reload(); setMsg('저장되었습니다.') }
    catch (e) { setMsg(e.message) }
  }
  const reset = async () => {
    if (!window.confirm('이 섹션을 기본값으로 되돌릴까요?')) return
    await api(`/admin/content/${key}`, { method: 'DELETE' }); site.reload(); setMsg('기본값으로 되돌렸습니다.')
  }

  return (
    <div className="form">
      <select value={key} onChange={(e) => setKey(e.target.value)}>
        {Object.entries(SECTIONS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <p className="note">JSON 형식으로 수정합니다. 키 이름은 바꾸지 말고 값만 수정하세요.</p>
      <textarea className="code" rows={22} spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} />
      {msg && <p className="note">{msg}</p>}
      <div className="post__actions">
        <button className="btn btn--line" onClick={reset}>기본값으로</button>
        <button className="btn btn--primary" onClick={save}>저장</button>
      </div>
    </div>
  )
}
