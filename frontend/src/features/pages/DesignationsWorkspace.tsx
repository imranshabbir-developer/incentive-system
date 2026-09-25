import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { useFims, type Designation } from '@/features/data/fims-store'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { Modal } from '@/shared/ui/Modal'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Select } from '@/shared/ui/Select'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { downloadCsv } from '@/shared/utils/csv'

export function DesignationsWorkspace() {
  const { user } = useAuth()
  const { designations, upsertDesignation } = useFims()
  const canWrite = user?.role === 'SUPER_ADMIN'
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Designation>({ id: '', name: '', status: 'Active' })

  return (
    <div className="page-grid">
      <PageHeader
        title="Designations"
        subtitle="Used on the employee master and on HOD incentive lines. Names are selected, not typed free-form elsewhere."
        actions={
          <div className="filter-row">
            {canWrite ? <Button onClick={() => { setForm({ id: `des-${Date.now()}`, name: '', status: 'Active' }); setOpen(true) }}>Add designation</Button> : null}
            <Button variant="ghost" onClick={() => downloadCsv('designations.csv', designations)}>Export to Excel</Button>
          </div>
        }
      />
      <Card>
        <DataTable
          rows={designations}
          rowKey={(row) => row.id}
          columns={[
            { key: 'name', label: 'Designation' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'open', label: '', render: (row) => <Button variant="ghost" onClick={() => { setForm(row); setOpen(true) }}>{canWrite ? 'Edit' : 'View'}</Button> },
          ]}
        />
      </Card>
      {open ? (
        <Modal title="Designation" onClose={() => setOpen(false)} actions={canWrite ? <Button onClick={() => { if (!form.name.trim()) return; upsertDesignation(form, user!.name); setOpen(false) }}>Save</Button> : null}>
          <div className="form-grid">
            <label className="ui-field"><span>Name</span><input value={form.name} disabled={!canWrite} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <Select label="Status" value={form.status} disabled={!canWrite} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} onChange={(status) => setForm({ ...form, status: status as Designation['status'] })} />
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
