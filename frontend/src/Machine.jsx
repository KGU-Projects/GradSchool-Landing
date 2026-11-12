import { useEffect, useRef } from 'react'

// three.js 는 무거우므로 히어로 글자가 먼저 보인 뒤에 불러온다.
export default function Machine() {
  const ref = useRef(null)
  useEffect(() => {
    let dead = false
    let dispose
    import('./machine3d.js').then((m) => { if (!dead) dispose = m.mountMachine(ref.current) })
    return () => { dead = true; if (dispose) dispose() }
  }, [])
  return <div className="machine__stage" ref={ref} />
}
