import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as defaults from './content.js'
import { api } from './api.js'

const Ctx = createContext(null)
export const useSite = () => useContext(Ctx)

// 서버에 저장된 섹션이 있으면 기본값(content.js) 위에 덮어쓴다. 서버가 꺼져 있어도 기본값으로 렌더링된다.
export function SiteProvider({ children }) {
  const [remote, setRemote] = useState({})
  const [members, setMembers] = useState([])
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    api('/content').then(setRemote).catch(() => {})
    api('/members').then(setMembers).catch(() => {})
  }, [reloadKey])

  const value = useMemo(() => {
    const pick = (k) => (remote[k] ?? defaults[k])
    return {
      site: { ...defaults.site, ...remote.site },
      hero: { ...defaults.hero, ...remote.hero },
      intro: { ...defaults.intro, ...remote.intro },
      research: pick('research'),
      programs: pick('programs'),
      admission: { ...defaults.admission, ...remote.admission },
      nav: defaults.nav,
      members,
      reload: () => setReloadKey((k) => k + 1),
      defaults,
    }
  }, [remote, members])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
