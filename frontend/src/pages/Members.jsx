import { useState } from 'react'
import { useSite } from '../SiteContext.jsx'
import { Photo } from '../Photo.jsx'

const GROUPS = [
  ['PROFESSOR', '교수진 Faculty'],
  ['PHD', '박사과정 Ph.D.'],
  ['MASTER', '석사과정 M.S.'],
  ['ALUMNI', '졸업생 Alumni'],
]

export default function Members() {
  const { members } = useSite()
  const [sel, setSel] = useState(null)
  return (
    <div className="inner page">
      <h1 className="pageTitle font-inter">Members</h1>
      <p className="pageLead">우리 대학원 구성원을 소개합니다.</p>
      {!members.length && <p className="empty">등록된 구성원이 없습니다.</p>}
      {GROUPS.map(([role, label]) => {
        const list = members.filter((m) => m.role === role)
        if (!list.length) return null
        return (
          <section key={role} className="mgroup">
            <h2 className="font-inter">{label}</h2>
            <div className="mgrid">
              {list.map((m) => (
                <button key={m.id} className="mcard" onClick={() => setSel(m)}>
                  <Photo m={m} />
                  <strong>{m.name} {m.title && <small>{m.title}</small>}</strong>
                  <span>{m.field}</span>
                </button>
              ))}
            </div>
          </section>
        )
      })}
      {sel && (
        <div className="modal" onClick={() => setSel(null)} role="dialog" aria-modal="true">
          <div className="modal__box" onClick={(e) => e.stopPropagation()}>
            <button className="modal__x" onClick={() => setSel(null)} aria-label="닫기">×</button>
            <Photo m={sel} />
            <h3>{sel.name} <small>{sel.title}</small></h3>
            <dl>
              {sel.field && (<><dt>연구 분야</dt><dd>{sel.field}</dd></>)}
              {sel.office && (<><dt>연구실</dt><dd>{sel.office}</dd></>)}
              {sel.email && (<><dt>이메일</dt><dd><a href={`mailto:${sel.email}`}>{sel.email}</a></dd></>)}
              {sel.phone && (<><dt>전화</dt><dd>{sel.phone}</dd></>)}
              {sel.homepage && (<><dt>홈페이지</dt><dd><a href={sel.homepage} target="_blank" rel="noreferrer noopener">{sel.homepage}</a></dd></>)}
            </dl>
            {sel.bio && <p className="modal__bio">{sel.bio}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
