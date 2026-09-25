import type { ReactNode } from 'react'

type Props = {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, action, children, className = '' }: Props) {
  return (
    <section className={`card card-pad ${className}`}>
      {(title || action) && (
        <header className="card-head">
          {title ? <h3>{title}</h3> : <span />}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
