import { useState, type FormEvent } from 'react'
import { ArrowRight, Lock, User } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FinanceLoader } from '@/features/auth/FinanceLoader'
import { RoleQuickFillBar } from '@/features/auth/RoleQuickFillBar'
import { useAuth } from '@/features/auth/auth-context'

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
      <div className="login-flare" aria-hidden />
      <svg className="login-waves" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="fimsWaveA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0" />
            <stop offset="35%" stopColor="#a7f3d0" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#34d399" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fimsWaveB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.15" />
          </linearGradient>
          <filter id="fimsGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M-80 560 C 180 410, 420 690, 720 520 C 1020 350, 1240 620, 1580 430" fill="none" stroke="url(#fimsWaveA)" strokeWidth="2.4" filter="url(#fimsGlow)" />
        <path d="M-60 610 C 240 470, 500 740, 820 560 C 1120 390, 1300 650, 1600 500" fill="none" stroke="url(#fimsWaveB)" strokeWidth="1.6" opacity="0.7" filter="url(#fimsGlow)" />
        <path d="M-40 300 C 260 180, 520 420, 820 250 C 1100 90, 1280 320, 1560 160" fill="none" stroke="url(#fimsWaveA)" strokeWidth="1.4" opacity="0.45" filter="url(#fimsGlow)" />
        <path d="M-100 760 C 220 640, 480 860, 780 700 C 1080 540, 1260 800, 1600 640" fill="none" stroke="url(#fimsWaveB)" strokeWidth="1.8" opacity="0.5" filter="url(#fimsGlow)" />
      </svg>
      <div className="login-sparkles" aria-hidden />
      <span className="login-bubble b1" aria-hidden />
      <span className="login-bubble b2" aria-hidden />
      <span className="login-bubble b3" aria-hidden />
      <span className="login-bubble b4" aria-hidden />
      <span className="login-bubble b5" aria-hidden />
      <span className="login-bubble b6" aria-hidden />
      <span className="login-bubble b7" aria-hidden />
      <span className="login-bubble b8" aria-hidden />
      <RoleQuickFillBar activeEmail={email} onPick={(nextEmail, nextPassword) => {
        setEmail(nextEmail)
        setPassword(nextPassword)
        setError('')
      }} />
      <div className="login-wrap">
        <form className="login-card" onSubmit={onSubmit}>
          <h1>LOGIN</h1>
          <p className="login-kicker">ACCESS YOUR ACCOUNT</p>
          <div className="login-fields">
            <label className="login-pill">
              <User size={16} />
              <span className="sr-only">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="login-pill">
              <Lock size={16} />
              <span className="sr-only">Password</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="login-error">{error}</p> : null}
            <button className="login-submit" type="submit" disabled={loading}>
              LOGIN
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
      {loading ? <FinanceLoader label="Verifying finance credentials and opening your dashboard" /> : null}
    </div>
  )
}
