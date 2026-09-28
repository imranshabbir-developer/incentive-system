import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { useFims } from '@/features/data/fims-store'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import { departmentOptions, INCENTIVE_TYPES, periodOptions, REQUEST_STATUSES } from '@/shared/data/seed'
import { downloadCsv } from '@/shared/utils/csv'
import { money } from '@/shared/utils/money'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Select } from '@/shared/ui/Select'
import { StatusBadge } from '@/shared/ui/StatusBadge'

export function IncentivesPage({ mode = 'all' }: { mode?: 'all' | 'queue' }) {
  const { user } = useAuth()
  const { requests, departments } = useFims()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const department = params.get('department') ?? 'All'
  const hod = params.get('hod') ?? 'All'
  const month = params.get('month') ?? 'All'
  const type = params.get('type') ?? 'All'
  const prefix = ROLE_PREFIX[user!.role]
  const scoped = requests.filter((row) => {
    if (department !== 'All' && row.department !== department) return false
    if (hod !== 'All' && row.hod !== hod) return false
    if (month !== 'All' && row.month !== month) return false
    if (type !== 'All' && row.type !== type) return false
    if (mode === 'queue') return ['Submitted', 'Resubmitted', 'Under Finance Review'].includes(row.status)
    if (status) return row.status === status
    return true
  })

  function setFilter(key: string, value: string, allValue = 'All') {
    const next = new URLSearchParams(params)
    if (!value || value === allValue) next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  return (
    <div className="page-grid">
      <PageHeader
        title={mode === 'queue' ? 'Finance review queue' : 'Incentive requests'}
        subtitle={mode === 'queue' ? 'Submitted requests waiting for Finance.' : 'Sale-based requests need a verified collection. Software / IT use Manual / Special.'}
        actions={
          <div className="filter-row">
            {user?.role === 'HOD' ? (
              <>
                <Link className="ui-btn ui-btn-primary" to={`/${prefix}/incentives/new-sale`}>New sale-based request</Link>
                <Link className="ui-btn ui-btn-soft" to={`/${prefix}/incentives/new-manual`}>New Manual / Special</Link>
              </>
            ) : null}
            <Button
              variant="ghost"
              onClick={() =>
                downloadCsv(
                  'incentives.csv',
                  scoped.map((row) => ({
                    id: row.id,
                    department: row.department,
                    hod: row.hod,
                    month: row.month,
                    type: row.type,
                    total: row.total,
                    status: row.status,
                  })),
                )
              }
            >
              Export to Excel
            </Button>
          </div>
        }
      />
      <Card
        title="Requests"
        action={
          <div className="filter-row">
            <Select
              label="Department"
              value={department}
              options={departmentOptions(departments, { value: 'All', label: 'All departments' })}
              onChange={(name) => setFilter('department', name)}
            />
            <Select
              label="HOD"
              value={hod}
              options={[{ value: 'All', label: 'All' }, ...[...new Set(requests.map((row) => row.hod))].map((value) => ({ value, label: value }))]}
              onChange={(value) => setFilter('hod', value)}
            />
            <Select
              label="Period"
              value={month}
              options={[{ value: 'All', label: 'All periods' }, ...periodOptions()]}
              onChange={(value) => setFilter('month', value)}
            />
            <Select
              label="Type"
              value={type}
              options={[{ value: 'All', label: 'All types' }, ...INCENTIVE_TYPES.map((value) => ({ value, label: value }))]}
              onChange={(value) => setFilter('type', value)}
            />
            {mode === 'all' ? (
              <Select
                label="Status"
                value={status}
                options={[{ value: '', label: 'All statuses' }, ...REQUEST_STATUSES.map((value) => ({ value, label: value }))]}
                onChange={(value) => setFilter('status', value, '')}
              />
            ) : null}
          </div>
        }
      >
        <DataTable
          rows={scoped}
          rowKey={(row) => row.id}
          columns={[
            { key: 'id', label: 'Request ID', render: (row) => <Link to={`/${prefix}/incentives/${row.id}`}>{row.id}</Link> },
            { key: 'department', label: 'Department' },
            { key: 'hod', label: 'HOD' },
            { key: 'month', label: 'Period' },
            { key: 'type', label: 'Type' },
            { key: 'total', label: 'Total', render: (row) => money(row.total) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          ]}
        />
      </Card>
    </div>
  )
}
