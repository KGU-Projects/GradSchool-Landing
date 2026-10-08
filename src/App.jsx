import { useEffect, useState } from 'react'
import { site, nav, hero, intro, research, programs, faculty, admission } from './content.js'
import { useReveal } from './useReveal.js'

function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, shown] = useReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`head ${scrolled ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
      <div className="inner head__row">
        <a href="#top" className="logo">
          <span className="logo__mark" />
          <span>{site.name}</span>
        </a>
        <nav className="pcNav">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
        <button className="burger" aria-label="메뉴" onClick={() => setOpen((v) => !v)}>
          <i /><i />
        </button>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__bg" aria-hidden="true">
        <span className="grid" />
        <span className="orb" />
      </div>
      <div className="inner hero__body">
        <p className="eyebrow hero__in" style={{ '--d': '0ms' }}>{hero.eyebrow}</p>
        <h1 className="font-inter">
          {hero.title.map((t, i) => (
            <span key={t} className="hero__line hero__in" style={{ '--d': `${150 + i * 150}ms` }}>
              {t}
            </span>
          ))}
        </h1>
        <p className="hero__sub hero__in" style={{ '--d': '500ms' }}>{hero.sub}</p>
        <div className="hero__cta hero__in" style={{ '--d': '650ms' }}>
          <a href="#admission" className="btn btn--primary">입학 안내</a>
          <a href="#research" className="btn btn--ghost">연구 분야 보기</a>
        </div>
      </div>
      <div className="scrollHint"><span>Scroll</span><i /></div>
    </section>
  )
}

function About() {
  return (
    <section className="sec" id="about">
      <div className="inner about">
        <Reveal>
          <h2 className="secTitle font-inter">
            {intro.title[0]}<br />
            <em>{intro.title[1]}</em>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="lead">{intro.text}</p>
        </Reveal>
      </div>
      <div className="inner stats">
        {intro.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 100} className="stat">
            <strong className="font-inter">{s.value}<small>{s.unit}</small></strong>
            <span>{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Research() {
  return (
    <section className="sec sec--gray" id="research">
      <div className="inner">
        <Reveal><h2 className="containerTitle font-inter">Research Areas</h2></Reveal>
        <ul className="rlist">
          {research.map((r, i) => (
            <Reveal as="li" key={r.no} delay={i * 80} className="rlist__item">
              <span className="rlist__no font-inter">{r.no}</span>
              <h3 className="font-inter">{r.title}</h3>
              <p>{r.text}</p>
              <span className="rlist__arrow" aria-hidden="true">→</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Programs() {
  return (
    <section className="sec" id="programs">
      <div className="inner">
        <Reveal><h2 className="containerTitle font-inter">Programs</h2></Reveal>
        <div className="cards">
          {programs.map((p, i) => (
            <Reveal key={p.title} delay={i * 100} className="card">
              <span className="card__tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p className="card__en font-inter">{p.en}</p>
              <p className="card__text">{p.text}</p>
              <a href="#admission" className="more">바로가기 <i>→</i></a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faculty() {
  return (
    <section className="sec sec--dark" id="faculty">
      <div className="inner">
        <Reveal><h2 className="containerTitle font-inter">Faculty</h2></Reveal>
        <div className="faculty">
          {faculty.map((f, i) => (
            <Reveal key={f.name} delay={i * 100} className="person">
              <div className="person__photo" aria-hidden="true">{f.name[0]}</div>
              <h3>{f.name} <small>{f.role}</small></h3>
              <p>{f.field}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Admission() {
  return (
    <section className="sec" id="admission">
      <div className="inner">
        <Reveal><h2 className="containerTitle font-inter">Admission</h2></Reveal>
        <ol className="steps">
          {admission.steps.map((s, i) => (
            <Reveal as="li" key={s} delay={i * 100}>
              <span className="font-inter">{String(i + 1).padStart(2, '0')}</span>
              {s}
            </Reveal>
          ))}
        </ol>
        <Reveal className="schedule">
          {admission.schedule.map((s) => (
            <div key={s.label}><b>{s.label}</b><span>{s.date}</span></div>
          ))}
        </Reveal>
        <Reveal className="cta">
          <h3 className="font-inter">Start Your Journey<br />with Us.</h3>
          <a className="btn btn--primary" href={`mailto:${site.email}`}>입학 문의하기</a>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
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
        </div>
      </div>
      <p className="inner copy">© {new Date().getFullYear()} {site.school} {site.nameEn}. All rights reserved.</p>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Research />
        <Programs />
        <Faculty />
        <Admission />
      </main>
      <Footer />
    </>
  )
}
