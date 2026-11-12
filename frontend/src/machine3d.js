// 히어로의 기계 부품(three.js). "면(조명 음영) + 모서리 선"으로 그려서 선화 느낌에 입체감을 더한다.
// 움직임은 Anime.js 로 만든다. (회전, 톱니바퀴, 등장, 마우스 시점 이동)
import * as THREE from 'three'
import { animate, createAnimatable, stagger } from 'animejs'

const BG = 0x0a0a0a
const ACCENT = 0xf68931
const TWO_PI = Math.PI * 2

// ── 재료 ────────────────────────────────────────────
const fillMat = new THREE.MeshLambertMaterial({ color: 0x1b1b1e, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
const fillAccent = new THREE.MeshLambertMaterial({ color: 0x2a1a0e, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
const lineMat = new THREE.LineBasicMaterial({ color: 0xe8e8ea, transparent: true, opacity: 0.8 })
const lineAccent = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.95 })

// 지오메트리 하나 → 면 + 모서리 선
function solid(geo, { edge = 30, accent = false } = {}) {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(geo, accent ? fillAccent : fillMat))
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, edge), accent ? lineAccent : lineMat))
  return g
}

const cyl = (r, h, seg = 64, edge = 30, accent = false) => solid(new THREE.CylinderGeometry(r, r, h, seg), { edge, accent })
const box = (w, h, d, accent = false) => solid(new THREE.BoxGeometry(w, h, d), { edge: 20, accent })

function gear(R, N, depth, h, hole = 0.58, accent = false) {
  const s = new THREE.Shape()
  const step = TWO_PI / N
  for (let i = 0; i < N; i++) {
    const a = i * step
    const pts = [[R - depth, a], [R, a + step * 0.14], [R, a + step * 0.46], [R - depth, a + step * 0.6]]
    pts.forEach(([r, t], k) => {
      const x = Math.cos(t) * r, y = Math.sin(t) * r
      i === 0 && k === 0 ? s.moveTo(x, y) : s.lineTo(x, y)
    })
  }
  s.closePath()
  const holePath = new THREE.Path()
  holePath.absarc(0, 0, R * hole, 0, TWO_PI, true)
  s.holes.push(holePath)
  const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 48 })
  geo.translate(0, 0, -h / 2)
  geo.rotateX(-Math.PI / 2)
  return solid(geo, { edge: 25, accent })
}

// ── 조립체 (축 = Y) ──────────────────────────────────
// 각 부품: { name, y(중심), ex(등장 시 흩어진 거리), build() }
function build() {
  const parts = []
  const add = (y, ex, obj, extra = {}) => { obj.position.y = y; parts.push(Object.assign(obj, { userData: { y, ex, ...extra } })); return obj }

  // 받침
  const base = new THREE.Group()
  base.add(cyl(2.55, 0.22, 72))
  const baseRing = cyl(2.05, 0.1, 72); baseRing.position.y = 0.15; base.add(baseRing)
  add(0, -3.2, base)

  // 아래 몸통: 코어 + 기둥 고리
  const lower = new THREE.Group()
  lower.add(cyl(1.45, 1.7, 56))
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TWO_PI
    const p = box(0.62, 1.25, 0.5)
    p.position.set(Math.cos(a) * 1.62, -0.12, Math.sin(a) * 1.62)
    p.rotation.y = -a
    lower.add(p)
    const cap = box(0.52, 0.18, 0.42, i % 5 === 0); cap.position.set(Math.cos(a) * 1.62, 0.62, Math.sin(a) * 1.62); cap.rotation.y = -a; lower.add(cap)
  }
  const lowerRing = cyl(1.85, 0.13, 64); lowerRing.position.y = 0.92; lower.add(lowerRing)
  add(0.97, -2.4, lower)

  // 가운데 몸통: 큰 원통 + 이음선 + 손잡이 + 타원 홈
  const mid = new THREE.Group()
  mid.add(cyl(2.12, 1.2, 80, 25))
  const seam = cyl(2.15, 0.035, 80); seam.position.y = -0.05; mid.add(seam)
  const knob = cyl(0.24, 0.4, 24, 30, true); knob.rotation.z = Math.PI / 2; knob.position.set(2.2, 0.28, 0.5); mid.add(knob)
  for (const z of [-0.55, 0.15]) {
    const slot = cyl(0.5, 0.06, 40); slot.rotation.z = Math.PI / 2; slot.scale.set(1, 1, 0.45); slot.position.set(2.14, -0.28, z); mid.add(slot)
  }
  add(2.57, -1.6, mid, { tiltSpin: true })

  // 톱니바퀴 2개 (서로 반대로 회전)
  const g1 = gear(2.05, 28, 0.24, 0.22, 0.6)
  add(3.34, -0.9, g1, { spin: 1 })
  const g2 = gear(1.78, 22, 0.26, 0.22, 0.52, true)
  add(3.64, -0.5, g2, { spin: -1.3 })

  // 얇은 판 스택
  for (let i = 0; i < 6; i++) {
    const r = 1.95 - i * 0.07
    const pl = cyl(r, 0.07, i % 2 ? 10 : 12, 20)
    pl.rotation.y = i * 0.3
    add(4.0 + i * 0.12, 0.8 + i * 0.15, pl)
  }

  // 원통 3개 + 코어
  const bar = new THREE.Group()
  const core = cyl(0.95, 0.8, 36); core.position.y = -0.3; bar.add(core)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TWO_PI + 0.5
    const b = cyl(0.5, 1.3, 32)
    b.position.set(Math.cos(a) * 1.12, 0.12, Math.sin(a) * 1.12)
    bar.add(b)
    const slot = box(0.07, 0.03, 0.34, i === 0); slot.position.set(Math.cos(a) * 1.12, 0.78, Math.sin(a) * 1.12); slot.rotation.y = -a; bar.add(slot)
  }
  add(5.4, 1.9, bar)

  // 캡: 톱니 무늬(세로 홈)가 있는 큰 원통
  const capG = new THREE.Group()
  capG.add(cyl(2.55, 0.55, 112, 1))
  const s1 = cyl(2.1, 0.12, 80); s1.position.y = 0.33; capG.add(s1)
  const s2 = cyl(1.65, 0.12, 80); s2.position.y = 0.45; capG.add(s2)
  const lens = solid(new THREE.TorusGeometry(1.25, 0.07, 10, 64), { edge: 20, accent: true }); lens.rotation.x = Math.PI / 2; lens.position.y = 0.52; capG.add(lens)
  add(6.5, 3.2, capG)

  return parts
}

// ── 라벨(지시선) ─────────────────────────────────────
const LABELS = [
  ['scheduling', 6.5, 2.55], ['forecasting', 5.6, 1.75], ['optimization', 4.3, 1.95],
  ['simulation', 3.5, 2.05], ['quality', 2.57, 2.15], ['logistics', 0.97, 1.9], ['delivery', 0, 2.55],
]

export function mountMachine(box) {
  const W0 = box.clientWidth || 560
  const H0 = box.clientHeight || 620
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(W0, H0)
  renderer.domElement.className = 'machine__canvas'
  box.appendChild(renderer.domElement)

  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('class', 'machine__labels')
  box.appendChild(svg)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(BG, 17, 30) // 먼 쪽은 어둠 속으로: 깊이감
  const camera = new THREE.PerspectiveCamera(34, W0 / H0, 0.1, 100)
  camera.position.set(0, 0, 18.6)

  // 조명: 오른쪽 위에서 흰 빛, 왼쪽 아래에서 주황 빛 → 면마다 명암이 달라진다.
  scene.add(new THREE.AmbientLight(0xffffff, 0.55))
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(6, 9, 8); scene.add(key)
  const rim = new THREE.DirectionalLight(ACCENT, 2.0); rim.position.set(-8, -4, -3); scene.add(rim)

  // pivot(마우스 시점) > tilt(기울기) > spinner(축 회전) > model
  const pivot = new THREE.Group()
  const tilt = new THREE.Group()
  const spinner = new THREE.Group()
  const model = new THREE.Group()
  pivot.position.x = -0.7
  tilt.rotation.z = -0.62
  tilt.rotation.x = 0.28
  model.position.y = -3.4
  pivot.add(tilt); tilt.add(spinner); spinner.add(model); scene.add(pivot)
  const parts = build()
  parts.forEach((p) => model.add(p))

  // 라벨용 기준점 (회전하지 않는 tilt 좌표계에 둔다. 부품이 축대칭이라 윤곽 반경이 항상 같다.)
  const anchors = LABELS.map(([text, y, r]) => {
    const o = new THREE.Object3D(); o.position.set(r, y - 3.4, 0); tilt.add(o)
    const line = document.createElementNS(NS, 'polyline')
    const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', '2.6')
    const t = document.createElementNS(NS, 'text'); t.textContent = text; t.setAttribute('text-anchor', 'end')
    svg.append(line, dot, t)
    return { o, line, dot, t }
  })
  const v = new THREE.Vector3()
  const place = () => {
    const w = box.clientWidth, h = box.clientHeight
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    // 라벨은 오른쪽에 세로로 고르게 배치하고, 화면상 높이 순서대로 부품과 이어 준다.
    const pts = anchors.map((a) => {
      a.o.getWorldPosition(v); v.project(camera)
      return { a, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h }
    }).sort((p, q) => p.y - q.y)
    // 라벨 높이는 부품 높이를 따르되, 겹치지 않게 최소 간격(26px)을 둔다.
    const GAP = 26
    const ly = pts.map((p) => p.y - 18)
    for (let i = 1; i < ly.length; i++) ly[i] = Math.max(ly[i], ly[i - 1] + GAP)
    const over = ly[ly.length - 1] - (h - 12)
    if (over > 0) for (let i = 0; i < ly.length; i++) ly[i] -= over
    pts.forEach(({ a, x, y }, i) => {
      a.line.setAttribute('points', `${x},${y} ${x + 26},${ly[i]} ${w - 86},${ly[i]}`)
      a.dot.setAttribute('cx', x); a.dot.setAttribute('cy', y)
      a.t.setAttribute('x', w - 2); a.t.setAttribute('y', ly[i] + 4)
    })
  }

  // ── 움직임 (Anime.js) ──
  const fx = []
  // 등장: 부품이 축을 따라 모여든다.
  const pos = parts.map((p) => p.position)
  pos.forEach((q, i) => { q.__y0 = parts[i].userData.y; q.__ex = parts[i].userData.ex })
  fx.push(animate(pos, { y: [(q) => q.__y0 + q.__ex * 2.2, (q) => q.__y0], delay: stagger(90, { from: 'center' }), duration: 2000, ease: 'outExpo' }))
  fx.push(animate(renderer.domElement, { opacity: [0, 1], duration: 900, ease: 'outQuad' }))
  // 축 회전(느리게) + 기울기 흔들림 → 계속 다른 면이 보인다.
  fx.push(animate(spinner.rotation, { y: TWO_PI, duration: 42000, ease: 'linear', loop: true }))
  fx.push(animate(tilt.rotation, { z: [-0.62, -0.5], x: [0.28, 0.4], duration: 6500, ease: 'inOutSine', alternate: true, loop: true }))
  // 톱니바퀴는 몸체보다 빠르게, 서로 반대로
  parts.filter((p) => p.userData.spin).forEach((p) => {
    fx.push(animate(p.rotation, { y: TWO_PI * Math.sign(p.userData.spin), duration: 9000 / Math.abs(p.userData.spin), ease: 'linear', loop: true }))
  })
  // 마우스 시점 이동
  const look = createAnimatable(pivot.rotation, { x: 900, y: 900, ease: 'outQuad' })
  const onMove = (e) => {
    look.y(((e.clientX / window.innerWidth) - 0.5) * 0.7).x(((e.clientY / window.innerHeight) - 0.5) * 0.4)
  }
  window.addEventListener('pointermove', onMove)

  // ── 렌더 루프: 화면에 보일 때만 ──
  let raf = 0
  let visible = true
  const frame = () => { renderer.render(scene, camera); place(); raf = visible ? requestAnimationFrame(frame) : 0 }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame) })
  io.observe(box)
  raf = requestAnimationFrame(frame)

  const ro = new ResizeObserver(() => {
    const w = box.clientWidth, h = box.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
  })
  ro.observe(box)

  return () => {
    cancelAnimationFrame(raf); raf = 0; visible = false
    io.disconnect(); ro.disconnect()
    window.removeEventListener('pointermove', onMove)
    look.revert(); fx.forEach((a) => a.revert())
    renderer.dispose(); renderer.domElement.remove(); svg.remove()
  }
}
