import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_PASSWORDS, DEMO_USERS } from '@/shared/constants/roles'
import type { AuthUser } from '@/shared/types'

const STORAGE_KEY = 'fims.session'
const PASS_KEY = 'fims.passwords.v1'

function readPasswords(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(PASS_KEY) || '{}') as Record<string, string>
  } catch {
    return {}
  }
}

function passwordFor(email: string) {
  return readPasswords()[email] ?? DEMO_PASSWORDS[email]
}

type AuthContextValue = {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<AuthUser>
  changePassword: (current: string, next: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readSession(): AuthUser | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readSession)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(email, password) {
        await new Promise((resolve) => window.setTimeout(resolve, 900))
        const found = DEMO_USERS.find((item) => item.email.toLowerCase() === email.trim().toLowerCase())
        if (!found || passwordFor(found.email) !== password) {
          throw new Error('Invalid email or password')
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
        setUser(found)
        return found
      },
      changePassword(current, next) {
        if (!user) throw new Error('Sign in first')
        if (passwordFor(user.email) !== current) throw new Error('Current password is incorrect')
        if (next.length < 6) throw new Error('New password must be at least 6 characters')
        localStorage.setItem(PASS_KEY, JSON.stringify({ ...readPasswords(), [user.email]: next }))
      },
      logout() {
        sessionStorage.removeItem(STORAGE_KEY)
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
