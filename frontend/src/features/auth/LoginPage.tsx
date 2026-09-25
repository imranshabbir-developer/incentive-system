import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FinanceLoader } from '@/features/auth/FinanceLoader'
import { RoleQuickFillBar } from '@/features/auth/RoleQuickFillBar'
import { useAuth } from '@/features/auth/auth-context'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={user.homePath} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const next = await login(email, password)
      navigate(next.homePath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-grid" />
      <div className="login-orb orb-a" />
      <div className="login-orb orb-b" />
      <div className="login-orb orb-c" />
      <RoleQuickFillBar activeEmail={email} onPick={(nextEmail, nextPassword) => {
        setEmail(nextEmail)
        setPassword(nextPassword)
        setError('')
      }} />
      <div className="login-wrap">
        <form className="login-card" onSubmit={onSubmit}>
          <p className="tiny">IPS-USA</p>
          <h1>Finance Incentive Management System</h1>
          <p className="muted">Secure sign-in. No card details are collected, stored, or displayed.</p>
          <div className="page-grid" style={{ marginTop: 20 }}>
            <Input label="Email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error ? <p className="delta-down">{error}</p> : null}
            <Button type="submit" disabled={loading}>Login</Button>
          </div>
        </form>
      </div>
      {loading ? <FinanceLoader label="Verifying finance credentials and opening your dashboard" /> : null}
    </div>
  )
}
