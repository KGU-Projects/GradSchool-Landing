export function Photo({ m }) {
  return (
    <div className="person__photo" aria-hidden={!m.photoUrl}>
      {m.photoUrl ? <img src={m.photoUrl} alt={`${m.name} 사진`} loading="lazy" /> : m.name[0]}
    </div>
  )
}
