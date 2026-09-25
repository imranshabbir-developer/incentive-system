import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { useFims } from '@/features/data/fims-store'
import { departmentOptions } from '@/shared/data/seed'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Select'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { downloadCsv } from '@/shared/utils/csv'
import { money } from '@/shared/utils/money'

export function PayrollWorkspace() {
  const { user } = useAuth()
  const { batches, requests, departments, createBatch, finalizeBatch, markBatchPaid } = useFims()
  const [filterDept, setFilterDept] = useState('All')
  const manager = user?.role === 'FINANCE_MANAGER' || user?.role === 'SUPER_ADMIN'
  const approved = requests.filter((row) => row.status === 'Approved' && (filterDept === 'All' || row.department === filterDept))

  return (
    <div className="page-grid">
      <PageHeader
        title="Payroll / payment batches"
        subtitle="Approved incentives become Ready for Payment, then Paid. Finalized batches cannot be edited."
        actions={
          <div className="filter-row">
            {(user?.role === 'FINANCE_USER' || manager) ? <Button onClick={() => createBatch('September 2026', user!.name)}>Create September batch</Button> : null}
            <Button variant="ghost" onClick={() => downloadCsv('batches.csv', batches.map((row) => ({ ...row, requestIds: row.requestIds.join(' ') })))}>Export to Excel</Button>
          </div>
        }
      />
      <Select label="Department" value={filterDept} options={departmentOptions(departments, { value: 'All', label: 'All departments' })} onChange={setFilterDept} />
      <Card title="Approved and waiting for a batch">
        <DataTable
          rows={approved}
          rowKey={(row) => row.id}
          columns={[
            { key: 'id', label: 'Request' },
            { key: 'department', label: 'Department' },
            { key: 'total', label: 'Total', render: (row) => money(row.total) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          ]}
        />
      </Card>
      <Card title="Batches">
        <DataTable
          rows={batches}
          rowKey={(row) => row.id}
          columns={[
            { key: 'id', label: 'Batch' },
            { key: 'month', label: 'Month' },
            { key: 'total', label: 'Total', render: (row) => money(row.total) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            {
              key: 'act',
              label: '',
              render: (row) => (
                <div className="filter-row">
                  {manager && row.status === 'Open' ? <Button variant="soft" onClick={() => finalizeBatch(row.id, user!.name)}>Finalize</Button> : null}
                  {manager && row.status === 'Finalized' ? <Button onClick={() => markBatchPaid(row.id, user!.name)}>Mark paid</Button> : null}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
