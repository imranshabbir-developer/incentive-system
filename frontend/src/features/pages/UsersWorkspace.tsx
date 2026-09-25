import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { makeUser, useFims, type AppUser } from '@/features/data/fims-store'
import { ROLE_LABEL } from '@/shared/constants/roles'
import type { Role } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { Modal } from '@/shared/ui/Modal'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Select } from '@/shared/ui/Select'
import { departmentOptions } from '@/shared/data/seed'
import { downloadCsv } from '@/shared/utils/csv'

const roles: Role[] = ['SUPER_ADMIN', 'HR', 'HOD', 'FINANCE_USER', 'FINANCE_MANAGER', 'EXECUTIVE']

export function UsersWorkspace() {
  const { user } = useAuth()
  const { users, departments, upsertUser } = useFims()
  const canWrite = user?.role === 'SUPER_ADMIN'
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<AppUser>(makeUser({ name: '', email: '', role: 'HOD' }))

  return (
    <div className="page-grid">
      <PageHeader
        title="Users & roles"
        subtitle="Login accounts mapped to Super Admin, HR, HOD, Finance User, Finance Manager and Executive. HOD must have a department."
        actions={
          <div className="filter-row">
            {canWrite ? <Button onClick={() => { setForm(makeUser({ name: '', email: '', role: 'HOD' })); setOpen(true) }}>Add user</Button> : null}
            <Button variant="ghost" onClick={() => downloadCsv('users.csv', users.map((row) => ({ name: row.name, email: row.email, role: ROLE_LABEL[row.role], departments: row.departmentNames.join(', ') || 'All' })))}>Export to Excel</Button>
          </div>
        }
      />
      <Card>
        <DataTable
          rows={users}
          rowKey={(row) => row.id}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'title', label: 'Role' },
            { key: 'departmentNames', label: 'Departments', render: (row) => row.departmentNames.join(', ') || 'All' },
            { key: 'open', label: '', render: (row) => <Button variant="ghost" onClick={() => { setForm(row); setOpen(true) }}>{canWrite ? 'Edit' : 'View'}</Button> },
          ]}
        />
      </Card>
      {open ? (
        <Modal title="User account" onClose={() => setOpen(false)} actions={canWrite ? <Button onClick={() => { if (!form.name.trim() || !form.email.trim()) return; upsertUser(makeUser(form), user!.name); setOpen(false) }}>Save</Button> : null}>
          <div className="form-grid">
            <label className="ui-field"><span>Name</span><input value={form.name} disabled={!canWrite} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="ui-field"><span>Email</span><input value={form.email} disabled={!canWrite} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <Select label="Role" value={form.role} disabled={!canWrite} options={roles.map((role) => ({ value: role, label: ROLE_LABEL[role] }))} onChange={(role) => setForm({ ...form, role: role as Role, title: ROLE_LABEL[role as Role] })} />
            <Select
              label="Department scope"
              value={form.departmentNames[0] ?? ''}
              disabled={!canWrite || form.role !== 'HOD'}
              options={[{ value: '', label: form.role === 'HOD' ? 'Select department' : 'All departments' }, ...departmentOptions(departments)]}
              onChange={(name) => {
                const dept = departments.find((row) => row.name === name)
                setForm({ ...form, departmentIds: dept ? [dept.id] : [], departmentNames: name ? [name] : [] })
              }}
            />
          </div>
          <p className="tiny">Demo login passwords stay on the six seed accounts. A new row here is a master record until backend auth is live.</p>
        </Modal>
      ) : null}
    </div>
  )
}
