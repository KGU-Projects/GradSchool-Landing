const TOKEN_KEY = 'admin_token'

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
}

export async function api(path, { method = 'GET', body, headers = {}, form } = {}) {
  const h = { ...headers }
  const token = getToken()
  if (token) h.Authorization = `Bearer ${token}`
  if (body !== undefined) h['Content-Type'] = 'application/json'
  const res = await fetch(`/api${path}`, {
    method,
    headers: h,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  })
  if (res.status === 401 && token && path !== '/auth/login') {
    setToken(null) // 만료된 토큰
  }
  if (!res.ok) {
    let msg = '요청을 처리하지 못했습니다.'
    try { msg = (await res.json()).message || msg } catch { /* no body */ }
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  // 본문이 없는 성공 응답(204, 빈 200)은 null 로 처리
  const text = res.status === 204 ? '' : await res.text()
  return text ? JSON.parse(text) : null
}
