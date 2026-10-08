export const CATEGORIES = [
  ['', '전체'],
  ['NOTICE', '공지사항'],
  ['FREE', '자유게시판'],
  ['QNA', '질문/답변'],
  ['ARCHIVE', '자료실'],
]
export const catLabel = (c) => CATEGORIES.find(([k]) => k === c)?.[1] ?? c
export const fmtDate = (s) => (s ? s.slice(0, 10) : '')
export const isAdminNow = () => {
  try { return !!localStorage.getItem('admin_token') } catch { return false }
}
