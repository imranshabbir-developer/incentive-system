import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Mail, Menu, Search } from 'lucide-react'
import { useFims } from '@/features/data/fims-store'
import type { AuthUser } from '@/shared/types'
import { ROLE_LABEL, ROLE_PREFIX } from '@/shared/constants/roles'

type Props = {
  title: string
  user: AuthUser
  onMenu: () => void
  onLogout: () => void
}

export function Topbar({ title, user, onMenu, onLogout }: Props) {
  const { notices, markNoticeRead, requests, employees, sales } = useFims()
  const navigate = useNavigate()
  const prefix = ROLE_PREFIX[user.role]
  const [query, setQuery] = useState('')
  const [openSearch, setOpenSearch] = useState(false)
  const [openBell, setOpenBell] = useState(false)
  const unread = notices.filter((row) => !row.read && (row.to === 'ALL' || row.to === user.role || (row.to === 'FINANCE' && user.role.includes('FINANCE')) || row.to === user.name || (row.to === 'HOD' && user.role === 'HOD')))
  const hits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return [
      ...requests.filter((row) => row.id.toLowerCase().includes(q)).map((row) => ({ href: `/${prefix}/incentives/${row.id}`, label: row.id })),
      ...employees.filter((row) => row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q)).map((row) => ({ href: `/${prefix}/employees?id=${row.id}`, label: `${row.id} · ${row.name}` })),
      ...sales.filter((row) => row.id.toLowerCase().includes(q) || row.project.toLowerCase().includes(q)).map((row) => ({ href: `/${prefix}/sales`, label: `${row.id} · ${row.project}` })),
    ].slice(0, 8)
  }, [employees, prefix, query, requests, sales])

  return (
    <header className="topbar">
      <button className="icon-chip menu-btn" type="button" onClick={onMenu} aria-label="Open menu">
        <Menu size={16} />
      </button>
      <div className="topbar-left">
        <h2>{title}</h2>
        <p className="tiny">Let’s review today’s incentive workflow</p>
      </div>
      <div className="topbar-search">
        <Search size={16} />
        <input
          placeholder="Search requests, employees, or INC- IDs"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpenSearch(true) }}
          onFocus={() => setOpenSearch(true)}
        />
        {openSearch && hits.length ? (
          <div className="search-results">
            {hits.map((hit) => (
              <Link key={hit.href + hit.label} to={hit.href} onClick={() => { setOpenSearch(false); setQuery('') }}>{hit.label}</Link>
            ))}
          </div>
        ) : null}
      </div>
      <div className="topbar-right">
        <div className="icon-wrap">
          <button className="icon-chip" type="button" onClick={() => { setOpenBell((v) => !v); setOpenSearch(false) }} aria-label="Notifications">
            <Bell size={16} />
            {unread.length ? <strong className="tiny">{unread.length}</strong> : null}
          </button>
          {openBell ? (
            <div className="panel">
              {unread.length ? unread.map((row) => (
                <button key={row.id} type="button" className="panel-item" onClick={() => { markNoticeRead(row.id); navigate(`/${prefix}/incentives`) }}>
                  <strong>{row.title}</strong>
                  <div className="tiny">{row.body}</div>
                </button>
              )) : <p className="tiny">No unread notifications</p>}
            </div>
          ) : null}
        </div>
        <Link className="icon-chip" to={`/${prefix}/reports`} aria-label="Reports mailbox">
          <Mail size={16} />
        </Link>
        <span className="user-chip">
          <span className="avatar">{user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
          <span>
            <strong>{user.name}</strong>
            <div className="tiny">{ROLE_LABEL[user.role]}</div>
          </span>
        </span>
        <button className="icon-chip" type="button" onClick={onLogout} aria-label="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
