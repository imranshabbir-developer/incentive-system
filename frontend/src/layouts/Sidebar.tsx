import { NavLink } from 'react-router-dom'
import {
  BadgeCheck,
  ClipboardCheck,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  Lock,
  LogOut,
  ScrollText,
  Settings,
  Shield,
  Users,
  UserCog,
  Wallet,
} from 'lucide-react'
import type { NavItem, NavKey } from '@/shared/constants/nav'
import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'

const icons: Record<NavKey, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  employees: Users,
  departments: FolderKanban,
  designations: BadgeCheck,
  users: UserCog,
  plans: Shield,
  sales: Wallet,
  incentives: ClipboardCheck,
  approvals: ClipboardCheck,
  'extra-approvals': Shield,
  payroll: Wallet,
  reports: FileBarChart,
  settings: Settings,
  audit: ScrollText,
}

type Props = {
  items: NavItem[]
  onLogout: () => void
}

export function Sidebar({ items, onLogout }: Props) {
  const [security, setSecurity] = useState(false)
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">F</span>
        <div>
          <div>FIMS</div>
          <div className="tiny">IPS-USA</div>
        </div>
      </div>
      <div className="nav-label">Menu</div>
      <nav>
        {items.map((item) => {
          const Icon = icons[item.key]
          return (
            <NavLink key={item.key} to={item.path} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <button type="button" className="nav-link" onClick={onLogout}>
        <LogOut />
        <span>Logout</span>
      </button>
      <div className="sidebar-promo">
        <div className="sidebar-promo-head">
          <Lock size={13} />
          <strong>Secure by design</strong>
        </div>
        <p>No card number, CVV, expiry, or billing ZIP.</p>
        <Button variant="soft" type="button" onClick={() => setSecurity(true)}>No card data</Button>
      </div>
      {security ? (
        <Modal title="Secure by design" onClose={() => setSecurity(false)}>
          <p className="muted">FIMS does not collect, store, process or display credit/debit card number, CVV, expiry date or billing ZIP. Only payment method, status, date and transaction reference are kept.</p>
        </Modal>
      ) : null}
    </aside>
  )
}
