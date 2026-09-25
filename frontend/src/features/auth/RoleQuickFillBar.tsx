import { Building2, Landmark, Shield, UserRound, Users, Wallet } from 'lucide-react'
import { DEMO_PASSWORDS, DEMO_USERS, isQuickFillEnabled, ROLE_LABEL } from '@/shared/constants/roles'
import type { Role } from '@/shared/types'

const icons: Record<Role, typeof Shield> = {
  SUPER_ADMIN: Shield,
  HR: Users,
  HOD: UserRound,
  FINANCE_USER: Wallet,
  FINANCE_MANAGER: Landmark,
  EXECUTIVE: Building2,
}

type Props = {
  activeEmail: string
  onPick: (email: string, password: string) => void
}

export function RoleQuickFillBar({ activeEmail, onPick }: Props) {
  if (!isQuickFillEnabled()) return null

  return (
    <aside className="role-bar" aria-label="Demo role quick fill">
      {DEMO_USERS.map((user) => {
        const Icon = icons[user.role]
        return (
          <button
            key={user.role}
            type="button"
            className={`role-chip${activeEmail === user.email ? ' active' : ''}`}
            onClick={() => onPick(user.email, DEMO_PASSWORDS[user.email])}
          >
            <Icon size={16} />
            <span>{ROLE_LABEL[user.role]}</span>
          </button>
        )
      })}
    </aside>
  )
}
