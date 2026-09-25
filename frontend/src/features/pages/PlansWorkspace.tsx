import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { useFims, type IncentivePlan } from '@/features/data/fims-store'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { Modal } from '@/shared/ui/Modal'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Select } from '@/shared/ui/Select'
import { departmentOptions } from '@/shared/data/seed'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { downloadCsv } from '@/shared/utils/csv'

const blank = (): IncentivePlan => ({
  id: `plan-${Date.now()}`,
  name: '',
  department: 'Construction Estimation',
  saleType: 'New Client',
  employeeRole: 'Seller',
  basis: 'Net collected',
  rate: '',
  minCollection: '',
  maxIncentive: '',
  from: '2026-01-01',
  to: '',
  status: 'Draft',
})

export function PlansWorkspace() {
  const { user } = useAuth()
  const { plans, departments, upsertPlan } = useFims()
  const canWrite = user?.role === 'SUPER_ADMIN'
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<IncentivePlan>(blank())

  return (
    <div className="page-grid">
      <PageHeader
        title="Incentive plans"
        subtitle="Plan fields are stored here. Percentages and caps stay empty until Finance configures them. HOD amounts stay manual until a rate is set."
        actions={
          <div className="filter-row">
            {canWrite ? <Button onClick={() => { setForm(blank()); setOpen(true) }}>Add plan</Button> : null}
            <Button variant="ghost" onClick={() => downloadCsv('plans.csv', plans)}>Export to Excel</Button>
          </div>
        }
      />
      <Card>
        <DataTable
          rows={plans}
          rowKey={(row) => row.id}
          columns={[
            { key: 'name', label: 'Plan name' },
            { key: 'department', label: 'Department' },
            { key: 'saleType', label: 'Sale type' },
            { key: 'employeeRole', label: 'Employee role' },
            { key: 'basis', label: 'Calculation basis' },
            { key: 'rate', label: 'Rate', render: (row) => row.rate || 'Not configured' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'open', label: '', render: (row) => <Button variant="ghost" onClick={() => { setForm(row); setOpen(true) }}>{canWrite ? 'Edit' : 'View'}</Button> },
          ]}
        />
      </Card>
      {open ? (
        <Modal title="Incentive plan" onClose={() => setOpen(false)} actions={canWrite ? <Button onClick={() => { if (!form.name.trim()) return; upsertPlan(form, user!.name); setOpen(false) }}>Save</Button> : null}>
          <div className="form-grid">
            <label className="ui-field"><span>Plan name</span><input value={form.name} disabled={!canWrite} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <Select label="Department" value={form.department} disabled={!canWrite} options={departmentOptions(departments)} onChange={(department) => setForm({ ...form, department })} />
            <Select label="Sale type" value={form.saleType} disabled={!canWrite} options={['New Client', 'Existing Client', 'Manual / Special'].map((v) => ({ value: v, label: v }))} onChange={(saleType) => setForm({ ...form, saleType })} />
            <label className="ui-field"><span>Employee role</span><input value={form.employeeRole} disabled={!canWrite} onChange={(e) => setForm({ ...form, employeeRole: e.target.value })} /></label>
            <Select label="Calculation basis" value={form.basis} disabled={!canWrite} options={['Net collected', 'Qualified leads', 'Conversions', 'Project performance', 'Fixed amount'].map((v) => ({ value: v, label: v }))} onChange={(basis) => setForm({ ...form, basis })} />
            <label className="ui-field"><span>Percentage / fixed amount</span><input value={form.rate} disabled={!canWrite} placeholder="Leave blank until configured" onChange={(e) => setForm({ ...form, rate: e.target.value })} /></label>
            <label className="ui-field"><span>Minimum collection</span><input value={form.minCollection} disabled={!canWrite} onChange={(e) => setForm({ ...form, minCollection: e.target.value })} /></label>
            <label className="ui-field"><span>Maximum incentive</span><input value={form.maxIncentive} disabled={!canWrite} onChange={(e) => setForm({ ...form, maxIncentive: e.target.value })} /></label>
            <label className="ui-field"><span>Effective from</span><input type="date" value={form.from} disabled={!canWrite} onChange={(e) => setForm({ ...form, from: e.target.value })} /></label>
            <label className="ui-field"><span>Effective to</span><input type="date" value={form.to} disabled={!canWrite} onChange={(e) => setForm({ ...form, to: e.target.value })} /></label>
            <Select label="Status" value={form.status} disabled={!canWrite} options={['Draft', 'Active', 'Inactive'].map((v) => ({ value: v, label: v }))} onChange={(status) => setForm({ ...form, status: status as IncentivePlan['status'] })} />
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
