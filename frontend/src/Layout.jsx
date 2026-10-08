import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useSite } from './SiteContext.jsx'

function Header({ solidAlways }) {
  const { site, nav } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`head ${scrolled || solidAlways ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
      <div className="inner head__row">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo__mark" />
          <span>{site.name}</span>
        </Link>
        <nav className="pcNav">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
        </nav>
        <button className="burger" aria-label="메뉴" onClick={() => setOpen((v) => !v)}><i /><i /></button>
      </div>
    </header>
  )
}

function Footer() {
  const { site } = useSite()
  return (
    <footer className="foot">
      <div className="inner foot__row">
        <div>
          <strong>{site.school} {site.name}</strong>
          <p>{site.address}</p>
        </div>
        <div>
          <p>T. {site.tel}</p>
          <p>E. {site.email}</p>
          <p><Link to="/admin" className="foot__admin">관리자</Link></p>
        </div>
      </div>
      <p className="inner copy">© {new Date().getFullYear()} {site.school} {site.nameEn}. All rights reserved.</p>
    </footer>
  )
}

export default function Layout() {
  const { pathname, hash } = useLocation()
  // 해시 링크(/#about) 이동 및 페이지 전환 시 스크롤 처리
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <>
      <Header solidAlways={pathname !== '/'} />
      <main className={pathname === '/' ? '' : 'subpage'}><Outlet /></main>
      <Footer />
    </>
  )
}
