import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/Button'

type Props = {
  title: string
  children: ReactNode
  onClose: () => void
  actions?: ReactNode
}

export function Modal({ title, children, onClose, actions }: Props) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <h3>{title}</h3>
          <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
        </header>
        <div className="modal-body">{children}</div>
        {actions ? <footer className="modal-actions">{actions}</footer> : null}
      </div>
    </div>
  )
}
