import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { useFims, type Employee } from '@/features/data/fims-store'
import { Select } from '@/shared/ui/Select'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { Modal } from '@/shared/ui/Modal'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { departmentOptions, EMPLOYEE_STATUSES, LOCATIONS, SHIFTS } from '@/shared/data/seed'
import { downloadCsv } from '@/shared/utils/csv'

const blank = (): Employee => ({
  id: '', name: '', designation: '', department: 'Construction Estimation', departmentId: 'dept-ce',
  division: 'Operations', manager: '', hod: '', joiningDate: '', status: 'Active', location: '', shift: 'Day', eligible: 'Yes',
})

export function EmployeesWorkspace() {
  const { user } = useAuth()
  const { employees, departments, designations, upsertEmployee } = useFims()
  const [params, setParams] = useSearchParams()
  const canWrite = user?.role === 'HR' || user?.role === 'SUPER_ADMIN'
  const profile = employees.find((row) => row.id === params.get('id'))
  const [form, setForm] = useState<Employee>(profile ?? blank())
  const [open, setOpen] = useState(params.get('new') === '1' || !!profile)
  const [filterDept, setFilterDept] = useState('All')
  const rows = useMemo(
    () => (filterDept === 'All' ? employees : employees.filter((row) => row.department === filterDept)),
    [employees, filterDept],
  )

  function openForm(row?: Employee) {
    setForm(row ?? { ...blank(), id: `EMP-${1000 + employees.length + 1}` })
    setOpen(true)
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Employee Master"
        subtitle="Names used in sales and incentives come from this list. Status is changed instead of delete."
        actions={
          <div className="filter-row">
            {canWrite ? <Button onClick={() => openForm()}>Add employee</Button> : null}
            <Button variant="ghost" onClick={() => downloadCsv('employees.csv', rows.map((row) => ({ ...row })))}>Export to Excel</Button>
          </div>
        }
      />
      <Select
        label="Department"
        value={filterDept}
        options={departmentOptions(departments, { value: 'All', label: 'All departments' })}
        onChange={setFilterDept}
      />
      <Card>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            { key: 'id', label: 'Employee ID' },
            { key: 'name', label: 'Name' },
            { key: 'designation', label: 'Designation' },
            { key: 'department', label: 'Department' },
            { key: 'hod', label: 'HOD' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'eligible', label: 'Eligible' },
            { key: 'open', label: '', render: (row) => <Button variant="ghost" onClick={() => openForm(row)}>{canWrite ? 'Edit' : 'Profile'}</Button> },
          ]}
        />
      </Card>
      {open ? (
        <Modal
          title={canWrite ? 'Employee record' : 'Employee profile'}
          onClose={() => { setOpen(false); setParams({}) }}
          actions={canWrite ? <Button onClick={() => { upsertEmployee(form, user!.name); setOpen(false); setParams({}) }}>Save</Button> : null}
        >
          <div className="form-grid">
            <label className="ui-field"><span>Employee ID</span><input value={form.id} readOnly /></label>
            <label className="ui-field"><span>Name</span><input value={form.name} disabled={!canWrite} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <Select label="Designation" value={form.designation} disabled={!canWrite} options={[{ value: '', label: 'Select designation' }, ...designations.filter((row) => row.status === 'Active').map((row) => ({ value: row.name, label: row.name }))]} onChange={(designation) => setForm({ ...form, designation })} />
            <Select label="Department" value={form.department} disabled={!canWrite} options={departmentOptions(departments)} onChange={(name) => {
              const dept = departments.find((row) => row.name === name)
              setForm({ ...form, department: name, departmentId: dept?.id ?? form.departmentId, hod: dept?.hod ?? form.hod, division: dept?.division ?? form.division })
            }} />
            <label className="ui-field"><span>Division</span><input value={form.division} disabled={!canWrite} onChange={(e) => setForm({ ...form, division: e.target.value })} /></label>
            <label className="ui-field"><span>Manager</span><input value={form.manager} disabled={!canWrite} onChange={(e) => setForm({ ...form, manager: e.target.value })} /></label>
            <label className="ui-field"><span>HOD</span><input value={form.hod} disabled={!canWrite} onChange={(e) => setForm({ ...form, hod: e.target.value })} /></label>
            <label className="ui-field"><span>Joining date</span><input type="date" value={form.joiningDate} disabled={!canWrite} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></label>
            <Select label="Status" value={form.status} disabled={!canWrite} options={EMPLOYEE_STATUSES.map((v) => ({ value: v, label: v }))} onChange={(status) => setForm({ ...form, status })} />
            <Select label="Location" value={form.location} disabled={!canWrite} options={[{ value: '', label: 'Select location' }, ...LOCATIONS.map((v) => ({ value: v, label: v }))]} onChange={(location) => setForm({ ...form, location })} />
            <Select label="Shift" value={form.shift} disabled={!canWrite} options={SHIFTS.map((v) => ({ value: v, label: v }))} onChange={(shift) => setForm({ ...form, shift })} />
            <Select label="Incentive eligible" value={form.eligible} disabled={!canWrite} options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} onChange={(eligible) => setForm({ ...form, eligible })} />
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
