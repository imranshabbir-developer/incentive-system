import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { useFims } from '@/features/data/fims-store'
import { ROLE_LABEL } from '@/shared/constants/roles'
import { departmentOptions } from '@/shared/data/seed'
import { Select } from '@/shared/ui/Select'
import { downloadCsv } from '@/shared/utils/csv'
import { money } from '@/shared/utils/money'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'

const titles: Record<string, string> = {
  'incentive-register': 'Incentive Register',
  'employee-history': 'Employee Incentive History',
  'department-summary': 'Department Summary',
  'hod-submissions': 'HOD Submission Report',
  'payment-report': 'Payment Report',
  'employees-by-department': 'Employees by Department',
  'employees-by-status': 'Employees by Status',
  'eligibility-list': 'Incentive Eligibility',
  'joining-list': 'Joining Date List',
  'user-access': 'User / role access',
}

export function ReportPage() {
  const { reportId = 'incentive-register' } = useParams()
  const { user } = useAuth()
  const { items, requests, employees, departments, sales, payments, users } = useFims()
  const [department, setDepartment] = useState('All')
  const moneyIds = ['incentive-register', 'employee-history', 'department-summary', 'hod-submissions', 'payment-report']
  const deptCode = departments.find((row) => row.name === department)?.code

  const { rows, columns } = useMemo(() => {
    if (reportId === 'user-access') {
      return {
        rows: users,
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (row) => ROLE_LABEL[row.role] },
          { key: 'departmentNames', label: 'Scope', render: (row) => row.departmentNames.join(', ') || 'All' },
        ] satisfies Column<(typeof users)[number]>[],
      }
    }
    if (reportId === 'employee-history') {
      const scoped = department === 'All' ? items : items.filter((row) => row.department === deptCode || row.department === department)
      return {
        rows: scoped,
        columns: [
          { key: 'employee', label: 'Employee' },
          { key: 'month', label: 'Period' },
          { key: 'type', label: 'Type' },
          { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        ] satisfies Column<(typeof scoped)[number]>[],
      }
    }
    if (reportId === 'department-summary') {
      const summaryRows = (department === 'All' ? departments : departments.filter((row) => row.name === department)).map((dept) => {
        const deptSales = sales.filter((row) => row.department === dept.name)
        const collections = payments.filter((pay) => deptSales.some((sale) => sale.id === pay.saleId) && pay.status === 'Verified').reduce((sum, row) => sum + row.net, 0)
        const incentive = items.filter((item) => item.department === dept.code).reduce((sum, item) => sum + item.amount, 0)
        return {
          id: dept.id,
          department: dept.name,
          sales: deptSales.reduce((sum, row) => sum + row.contract, 0),
          collections,
          incentive,
        }
      })
      return {
        rows: summaryRows,
        columns: [
          { key: 'department', label: 'Department' },
          { key: 'sales', label: 'Total sales', render: (row) => money(row.sales) },
          { key: 'collections', label: 'Net collections', render: (row) => money(row.collections) },
          { key: 'incentive', label: 'Total incentive', render: (row) => money(row.incentive) },
          { key: 'pct', label: 'Incentive %', render: (row) => (row.collections ? `${((row.incentive / row.collections) * 100).toFixed(1)}%` : '0%') },
        ] satisfies Column<(typeof summaryRows)[number]>[],
      }
    }
    if (reportId === 'hod-submissions') {
      const scopedRequests = department === 'All' ? requests : requests.filter((row) => row.department === department)
      const hods = [...new Set(scopedRequests.map((row) => row.hod))]
      return {
        rows: hods.map((hod) => {
          const mine = scopedRequests.filter((row) => row.hod === hod)
          return {
            id: hod,
            hod,
            requests: mine.length,
            approved: mine.filter((row) => row.status === 'Approved').length,
            returned: mine.filter((row) => row.status === 'Returned').length,
            rejected: mine.filter((row) => row.status === 'Rejected').length,
            pending: mine.filter((row) => ['Submitted', 'Resubmitted', 'Draft', 'Under Finance Review'].includes(row.status)).length,
          }
        }),
        columns: [
          { key: 'hod', label: 'HOD' },
          { key: 'requests', label: 'Requests' },
          { key: 'approved', label: 'Approved' },
          { key: 'returned', label: 'Returned' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'pending', label: 'Pending' },
        ],
      }
    }
    if (reportId === 'payment-report') {
      const scopedRequests = department === 'All' ? requests : requests.filter((row) => row.department === department)
      return {
        rows: [
          {
            id: 'pay-rep',
            approved: scopedRequests.filter((row) => row.status === 'Approved').length,
            ready: scopedRequests.filter((row) => row.status === 'Ready for Payment').length,
            paid: scopedRequests.filter((row) => row.status === 'Paid').length,
            unpaid: scopedRequests.filter((row) => !['Paid', 'Rejected', 'Cancelled'].includes(row.status)).length,
          },
        ],
        columns: [
          { key: 'approved', label: 'Approved' },
          { key: 'ready', label: 'Ready for payment' },
          { key: 'paid', label: 'Paid' },
          { key: 'unpaid', label: 'Unpaid' },
        ],
      }
    }
    if (reportId.startsWith('employees') || reportId === 'eligibility-list' || reportId === 'joining-list') {
      const people = department === 'All' ? employees : employees.filter((row) => row.department === department)
      return {
        rows: people,
        columns: [
          { key: 'id', label: 'Employee ID' },
          { key: 'name', label: 'Name' },
          { key: 'department', label: 'Department' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'eligible', label: 'Eligible' },
          { key: 'joiningDate', label: 'Joining date' },
        ] satisfies Column<(typeof people)[number]>[],
      }
    }
    const register = department === 'All' ? items : items.filter((row) => row.department === deptCode || row.department === department)
    return {
      rows: register,
      columns: [
        { key: 'month', label: 'Month' },
        { key: 'department', label: 'Department' },
        { key: 'employee', label: 'Employee' },
        { key: 'hod', label: 'HOD' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'type', label: 'Incentive type' },
        { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
      ] satisfies Column<(typeof register)[number]>[],
    }
  }, [department, departments, deptCode, employees, items, payments, reportId, requests, sales, users])

  if (user?.role === 'HR' && (moneyIds.includes(reportId) || reportId === 'user-access')) {
    return <Navigate to="/hr/reports/employees-by-department" replace />
  }

  return (
    <div className="page-grid">
      <PageHeader
        title={titles[reportId] ?? 'Report'}
        subtitle="Filter by any IPS-USA department. Charts and registers follow the selected name."
        actions={
          <Button
            variant="ghost"
            onClick={() =>
              downloadCsv(
                `${reportId}.csv`,
                rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value)]))),
              )
            }
          >
            Export to Excel
          </Button>
        }
      />
      <Select label="Department" value={department} options={departmentOptions(departments, { value: 'All', label: 'All departments' })} onChange={setDepartment} />
      <Card>
        <DataTable rows={rows} rowKey={(row) => String((row as { id?: string; requestId?: string; employee?: string; type?: string }).id ?? `${(row as { requestId?: string }).requestId}-${(row as { employee?: string }).employee}-${(row as { type?: string }).type}`)} columns={columns as Column<(typeof rows)[number]>[]} />
      </Card>
    </div>
  )
}
