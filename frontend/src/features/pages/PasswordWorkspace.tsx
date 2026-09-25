import { useState, type FormEvent } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { PageHeader } from '@/shared/ui/PageHeader'

export function PasswordWorkspace() {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaved(false)
    if (next !== confirm) {
      setError('New password and confirm password do not match')
      return
    }
    try {
      changePassword(current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password')
    }
  }

  return (
    <div className="page-grid">
      <PageHeader title="Change Password" subtitle="Update the password for this demo account. It is stored only in this browser." />
      <Card title="Password">
        <form className="form-grid" onSubmit={onSubmit}>
          <Input label="Current password" name="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          <span />
          <Input label="New password" name="next" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required />
          <Input label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <div>
            <Button type="submit">Update password</Button>
            {error ? <p className="delta-down">{error}</p> : null}
            {saved ? <p className="tiny">Password updated for this browser.</p> : null}
          </div>
        </form>
      </Card>
    </div>
  )
}
