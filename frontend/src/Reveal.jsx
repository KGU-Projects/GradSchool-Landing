import { useReveal } from './useReveal.js'

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, shown] = useReveal()
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}
