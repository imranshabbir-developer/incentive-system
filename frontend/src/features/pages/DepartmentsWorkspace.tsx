import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { useFims, type Department } from '@/features/data/fims-store'
import { Select } from '@/shared/ui/Select'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { Modal } from '@/shared/ui/Modal'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { downloadCsv } from '@/shared/utils/csv'

export function DepartmentsWorkspace() {
  const { user } = useAuth()
  const { departments, upsertDepartment } = useFims()
  const canWrite = user?.role === 'SUPER_ADMIN'
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Department>(departments[0])

  return (
    <div className="page-grid">
      <PageHeader
        title="Departments"
        subtitle="Same schema for CE, Medical Billing, Truck Dispatch, Digital Marketing, Software, IT and Hardware."
        actions={
          <div className="filter-row">
            {canWrite ? <Button onClick={() => { setForm({ id: `dept-${departments.length + 1}`, code: 'NW', name: '', hod: '', reviewer: '', status: 'Active', division: 'Operations' }); setOpen(true) }}>Add department</Button> : null}
            <Button variant="ghost" onClick={() => downloadCsv('departments.csv', departments)}>Export to Excel</Button>
          </div>
        }
      />
      <Card>
        <DataTable
          rows={departments}
          rowKey={(row) => row.id}
          columns={[
            { key: 'code', label: 'ID' },
            { key: 'name', label: 'Department' },
            { key: 'division', label: 'Division' },
            { key: 'hod', label: 'HOD' },
            { key: 'reviewer', label: 'Finance reviewer' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'open', label: '', render: (row) => <Button variant="ghost" onClick={() => { setForm(row); setOpen(true) }}>{canWrite ? 'Edit' : 'View'}</Button> },
          ]}
        />
      </Card>
      {open ? (
        <Modal title="Department" onClose={() => setOpen(false)} actions={canWrite ? <Button onClick={() => { upsertDepartment(form, user!.name); setOpen(false) }}>Save</Button> : null}>
          <div className="form-grid">
            <label className="ui-field"><span>Department ID</span><input value={form.code} disabled={!canWrite} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
            <label className="ui-field"><span>Name</span><input value={form.name} disabled={!canWrite} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="ui-field"><span>Division</span><input value={form.division} disabled={!canWrite} onChange={(e) => setForm({ ...form, division: e.target.value })} /></label>
            <label className="ui-field"><span>HOD</span><input value={form.hod} disabled={!canWrite} onChange={(e) => setForm({ ...form, hod: e.target.value })} /></label>
            <label className="ui-field"><span>Finance reviewer</span><input value={form.reviewer} disabled={!canWrite} onChange={(e) => setForm({ ...form, reviewer: e.target.value })} /></label>
            <Select label="Status" value={form.status} disabled={!canWrite} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} onChange={(status) => setForm({ ...form, status })} />
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
