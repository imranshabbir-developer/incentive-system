import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { Sidebar } from '@/layouts/Sidebar'
import { Topbar } from '@/layouts/Topbar'
import { navFor } from '@/shared/constants/nav'
import { ROLE_PREFIX } from '@/shared/constants/roles'

const titles: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  departments: 'Departments',
  users: 'Users',
  sales: 'Sales / Collections',
  incentives: 'Incentive Requests',
  approvals: 'Approvals',
  payroll: 'Payroll',
  reports: 'Reports',
  settings: 'Settings',
  audit: 'Audit',
  profile: 'Profile',
  'change-password': 'Change Password',
}

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const items = useMemo(() => (user ? navFor(user.role, ROLE_PREFIX[user.role]) : []), [user])
  const leaf = location.pathname.split('/').filter(Boolean)[1] ?? 'dashboard'
  const title = titles[leaf] ?? 'Dashboard'

  if (!user) return null

  function onLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <Sidebar items={items} onLogout={onLogout} />
      <div className="app-main">
        <Topbar title={title} user={user} onMenu={() => setOpen((v) => !v)} onLogout={onLogout} />
        <div className={`mobile-nav${open ? ' open' : ''}`}>
          {items.map((item) => (
            <NavLink key={item.key} to={item.path} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
