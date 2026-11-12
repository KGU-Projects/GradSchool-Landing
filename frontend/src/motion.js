import { useEffect, useLayoutEffect } from 'react'
import { animate, createAnimatable, createDrawable, onScroll, scrambleText, splitText, spring, stagger } from 'animejs'

// 히어로: 제목 글자 순차 등장 + 마우스를 따라가는 스포트라이트/오브/격자 시차
export function useHeroMotion(heroRef) {
  useLayoutEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const title = hero.querySelector('h1')
    const split = splitText(title, { words: true, chars: true })
    split.chars.forEach((c) => { c.style.display = 'inline-block' })
    split.words.forEach((w) => { w.style.display = 'inline-block' })
    const intro = animate(split.chars, {
      opacity: [0, 1],
      translateY: ['0.6em', '0em'],
      delay: stagger(22, { start: 150 }),
      duration: 900,
      ease: 'outExpo',
    })
    return () => { intro.revert(); split.revert() }
  }, [heroRef])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const spot = createAnimatable(hero.querySelector('.hero__spot'), { x: 500, y: 500, ease: 'outQuad' })
    const orb = createAnimatable(hero.querySelector('.orbPos'), { x: 900, y: 900, ease: 'outQuad' })
    const grid = createAnimatable(hero.querySelectorAll('.grid'), { x: 1100, y: 1100, ease: 'outQuad' })
    // 커서 주변 격자선이 주황색으로 켜지도록 마스크 중심을 부드럽게 따라가게 한다.
    const cur = { x: -999, y: -999 }
    const goal = { x: -999, y: -999 }
    let raf = 0
    const tick = () => {
      cur.x += (goal.x - cur.x) * 0.16
      cur.y += (goal.y - cur.y) * 0.16
      hero.style.setProperty('--mx', `${cur.x}px`)
      hero.style.setProperty('--my', `${cur.y}px`)
      raf = Math.abs(goal.x - cur.x) + Math.abs(goal.y - cur.y) > 0.5 ? requestAnimationFrame(tick) : 0
    }
    const move = (e) => {
      const r = hero.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      if (cur.x < -900) { cur.x = px; cur.y = py }
      goal.x = px; goal.y = py
      if (!raf) raf = requestAnimationFrame(tick)
      const nx = px / r.width - 0.5
      const ny = py / r.height - 0.5
      spot.x(px).y(py)
      orb.x(nx * -70).y(ny * -70)
      grid.x(nx * 28).y(ny * 28)
    }
    const enter = () => hero.classList.add('is-hover')
    const leave = () => hero.classList.remove('is-hover')
    hero.addEventListener('pointermove', move)
    hero.addEventListener('pointerenter', enter)
    hero.addEventListener('pointerleave', leave)
    return () => {
      hero.removeEventListener('pointermove', move)
      hero.removeEventListener('pointerenter', enter)
      hero.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
      spot.revert(); orb.revert(); grid.revert()
    }
  }, [heroRef])
}

// 통계: 화면에 들어오면 숫자가 뒤섞였다가 제자리를 찾는다.
export function useStatScramble(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = [...root.querySelectorAll('[data-scramble]')]
    const anims = []
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        io.unobserve(e.target)
        // scrambleText 는 innerHTML 로 쓰므로, 숫자 표기(예: 12, 1,200, 85.5)만 애니메이션한다. 그 외 값은 그대로 둔다.
        if (!/^[0-9.,\s]+$/.test(e.target.textContent)) return
        const i = els.indexOf(e.target)
        anims.push(animate(e.target, {
          innerHTML: scrambleText({ chars: 'numbers', duration: 1800, settleDuration: 900, ease: 'inOutQuad' }),
          duration: 1800,
          delay: i * 120,
          ease: 'inOutQuad',
        }))
      })
    }, { threshold: 0.3 })
    els.forEach((el) => io.observe(el))
    return () => { io.disconnect(); anims.forEach((a) => a.revert()) }
  }, [rootRef])
}

// 입학 절차: 스크롤에 맞춰 주황 선이 그려지고, 지나간 단계가 켜진다.
export function useStepsLine(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = [...root.querySelectorAll('li')]
    const line = createDrawable(root.querySelector('.steps__fill'))
    const anim = animate(line, {
      draw: ['0 0', '0 1'],
      ease: 'linear',
      autoplay: onScroll({
        target: root,
        enter: 'bottom-=20% top',
        leave: 'top+=45% bottom',
        sync: 0.3,
        onUpdate: (self) => {
          const p = self.progress
          items.forEach((li, i) => li.classList.toggle('is-on', p >= (i + 0.35) / items.length))
        },
      }),
    })
    return () => anim.revert()
  }, [rootRef])
}

// 주요 버튼: 커서가 가까워지면 스프링으로 살짝 끌려온다.
export function useMagnetic() {
  useEffect(() => {
    const btns = [...document.querySelectorAll('.btn--mag')]
    const items = btns.map((el) => ({
      el,
      a: createAnimatable(el, { x: 600, y: 600, ease: spring({ stiffness: 180, damping: 12 }) }),
    }))
    const move = (e) => {
      items.forEach(({ el, a }) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * 0.9
        a.x(near ? dx * 0.3 : 0).y(near ? dy * 0.4 : 0)
      })
    }
    window.addEventListener('pointermove', move)
    return () => { window.removeEventListener('pointermove', move); items.forEach(({ a }) => a.revert()) }
  }, [])
}
