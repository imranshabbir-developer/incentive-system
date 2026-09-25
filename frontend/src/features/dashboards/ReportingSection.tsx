import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { useFims } from '@/features/data/fims-store'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import { departmentOptions, periodOptions } from '@/shared/data/seed'
import { downloadCsv } from '@/shared/utils/csv'
import { money } from '@/shared/utils/money'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Select'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'

const moneyReports = [
  { id: 'incentive-register', label: 'Incentive Register' },
  { id: 'employee-history', label: 'Employee Incentive History' },
  { id: 'department-summary', label: 'Department Summary' },
  { id: 'hod-submissions', label: 'HOD Submission Report' },
  { id: 'payment-report', label: 'Payment Report' },
]

const hrReports = [
  { id: 'employees-by-department', label: 'Employees by Department' },
  { id: 'employees-by-status', label: 'Employees by Status' },
  { id: 'eligibility-list', label: 'Incentive Eligibility' },
  { id: 'joining-list', label: 'Joining Date List' },
]

export function ReportingSection({ extra = [] }: { extra?: Array<{ id: string; label: string }> }) {
  const { user } = useAuth()
  const { items, employees, departments } = useFims()
  const [month, setMonth] = useState('September 2026')
  const [department, setDepartment] = useState(user?.role === 'HOD' ? (user.departmentNames[0] ?? 'All') : 'All')
  const prefix = user ? ROLE_PREFIX[user.role] : 'admin'
  const reports = user?.role === 'HR' ? hrReports : [...moneyReports, ...extra]
  const people = useMemo(() => {
    return employees.filter((row) => department === 'All' || row.department === department)
  }, [department, employees])
  const rows = useMemo(() => {
    return items.filter((row) => {
      if (department !== 'All') {
        const code = departments.find((item) => item.name === department)?.code
        if (row.department !== code && row.department !== department) return false
      }
      if (month && !row.month.startsWith(month.split(' ')[0])) return false
      return true
    })
  }, [department, departments, items, month, user])

  return (
    <Card
      title="Reporting"
      action={
        <Button
          variant="ghost"
          onClick={() =>
            downloadCsv(
              `fims-report-${month}.csv`,
              user?.role === 'HR'
                ? people.map((row) => ({ id: row.id, name: row.name, department: row.department, status: row.status, eligible: row.eligible, joining: row.joiningDate }))
                : rows.map((row) => ({
                    Month: row.month,
                    Department: row.department,
                    Employee: row.employee,
                    HOD: row.hod,
                    Status: row.status,
                    Type: row.type,
                    Amount: row.amount,
                  })),
            )
          }
        >
          Export to Excel
        </Button>
      }
    >
      <div className="filter-row">
        <Select label="Month" value={month} options={periodOptions()} onChange={setMonth} />
        <Select
          label="Department"
          value={department}
          options={departmentOptions(departments, { value: 'All', label: 'All departments' })}
          onChange={setDepartment}
        />
      </div>
      <div className="report-grid">
        {reports.map((report) => (
          <Link key={report.id} className="shortcut" to={`/${prefix}/reports/${report.id}`}>
            <strong>{report.label}</strong>
            <span className="tiny">Open full report</span>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        {user?.role === 'HR' ? (
          <DataTable
            rows={people}
            rowKey={(row) => row.id}
            columns={[
              { key: 'name', label: 'Employee' },
              { key: 'department', label: 'Department' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
              { key: 'eligible', label: 'Eligible' },
              { key: 'joiningDate', label: 'Joining date' },
            ]}
          />
        ) : (
          <DataTable
            rows={rows}
            rowKey={(row) => row.requestId + row.employee + row.type}
            columns={[
              { key: 'employee', label: 'Employee' },
              { key: 'department', label: 'Department' },
              { key: 'hod', label: 'HOD' },
              { key: 'type', label: 'Incentive Type' },
              { key: 'amount', label: 'Amount', render: (row) => money(Number(row.amount)) },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={String(row.status)} /> },
            ]}
          />
        )}
      </div>
    </Card>
  )
}
