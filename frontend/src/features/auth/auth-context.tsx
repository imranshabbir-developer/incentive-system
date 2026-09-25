import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_PASSWORDS, DEMO_USERS } from '@/shared/constants/roles'
import type { AuthUser } from '@/shared/types'

const STORAGE_KEY = 'fims.session'

type AuthContextValue = {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<AuthUser>
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
        if (!found || DEMO_PASSWORDS[found.email] !== password) {
          throw new Error('Invalid email or password')
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
        setUser(found)
        return found
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
