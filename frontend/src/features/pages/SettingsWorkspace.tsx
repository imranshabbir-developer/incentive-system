import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { useFims } from '@/features/data/fims-store'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Modal } from '@/shared/ui/Modal'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'

export function SettingsWorkspace() {
  const { user } = useAuth()
  const { monthLocked, setMonthLock } = useFims()
  const canLock = user?.role === 'FINANCE_MANAGER' || user?.role === 'SUPER_ADMIN'
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const next = !monthLocked

  return (
    <div className="page-grid">
      <PageHeader title="Settings" subtitle="Month lock, security flags and demo options. Incentive percentages stay configurable and are not hardcoded." />
      <Card title="Period control">
        <div className="readonly-grid">
          <div><span>September 2026</span><StatusBadge value={monthLocked ? 'Locked' : 'Unlocked'} /></div>
          <div><span>Role quick-fill</span><strong>{import.meta.env.VITE_ENABLE_ROLE_QUICKFILL === 'true' ? 'On (demo)' : 'Off'}</strong></div>
          <div><span>Card data fields</span><strong>Forbidden</strong></div>
        </div>
        {canLock ? (
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => setOpen(true)}>{monthLocked ? 'Reopen month' : 'Lock month'}</Button>
          </div>
        ) : null}
      </Card>
      <Card title="Approval routing">
        <p className="muted">Extra approval by amount or department is off. Do not invent a threshold here. The extra-approval queue stays empty until a later configuration value is provided.</p>
      </Card>
      {open ? (
        <Modal
          title={next ? 'Lock September 2026' : 'Reopen September 2026'}
          onClose={() => setOpen(false)}
          actions={<Button onClick={() => { if (!reason.trim()) return; setMonthLock(next, user!.name, reason); setOpen(false); setReason('') }}>{next ? 'Lock' : 'Reopen'}</Button>}
        >
          <label className="ui-field">
            <span>Reason (required)</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        </Modal>
      ) : null}
    </div>
  )
}
