import { useMemo } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import {
  auditLogs,
  departments,
  employees,
  incentiveRequests,
  payments,
  sales,
} from '@/shared/data/seed'
import { DEMO_USERS } from '@/shared/constants/roles'
import { money } from '@/shared/utils/money'
import { downloadCsv } from '@/shared/utils/csv'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'

type PageKey = 'employees' | 'departments' | 'users' | 'sales' | 'incentives' | 'approvals' | 'payroll' | 'settings' | 'audit'

const copy: Record<PageKey, { title: string; subtitle: string }> = {
  employees: { title: 'Employee Master', subtitle: 'People are selected from this list. Status is changed instead of delete.' },
  departments: { title: 'Departments', subtitle: 'Same schema for CE, Medical Billing, Truck Dispatch, Digital Marketing, Software, IT and Hardware.' },
  users: { title: 'Users & roles', subtitle: 'Login accounts mapped to Super Admin, HR, HOD, Finance User, Finance Manager and Executive.' },
  sales: { title: 'Sales / Collections', subtitle: 'Client money only. Payments are a list, not first/second payment fields. No card data.' },
  incentives: { title: 'Incentive requests', subtitle: 'Sale-based requests need a verified collection. Software / IT use Manual / Special.' },
  approvals: { title: 'Approvals', subtitle: 'Finance can approve, return or reject. Return and reject require a reason.' },
  payroll: { title: 'Payroll / payment batches', subtitle: 'Approved incentives become Ready for Payment, then Paid.' },
  settings: { title: 'Settings', subtitle: 'Month lock, approval routing and demo flags. Policy amounts stay configurable.' },
  audit: { title: 'Audit history', subtitle: 'User, action, entity, old value, new value, time and reason.' },
}

export function ResourcePage({ page }: { page: PageKey }) {
  const { user } = useAuth()
  const meta = copy[page]

  const { rows, columns, filename } = useMemo(() => {
    if (page === 'employees') {
      const scoped = user?.role === 'HOD' ? employees.filter((row) => user.departmentIds.includes(row.departmentId)) : employees
      return {
        filename: 'employees.csv',
        rows: scoped,
        columns: [
          { key: 'id', label: 'Employee ID' },
          { key: 'name', label: 'Name' },
          { key: 'designation', label: 'Designation' },
          { key: 'department', label: 'Department' },
          { key: 'hod', label: 'HOD' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'eligible', label: 'Eligible' },
        ] satisfies Column<(typeof scoped)[number]>[],
      }
    }
    if (page === 'departments') {
      return {
        filename: 'departments.csv',
        rows: departments,
        columns: [
          { key: 'code', label: 'ID' },
          { key: 'name', label: 'Department' },
          { key: 'hod', label: 'HOD' },
          { key: 'reviewer', label: 'Finance reviewer' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        ] satisfies Column<(typeof departments)[number]>[],
      }
    }
    if (page === 'users') {
      return {
        filename: 'users.csv',
        rows: DEMO_USERS,
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'title', label: 'Role' },
          { key: 'departmentNames', label: 'Departments', render: (row) => row.departmentNames.join(', ') || 'All' },
        ] satisfies Column<(typeof DEMO_USERS)[number]>[],
      }
    }
    if (page === 'sales') {
      return {
        filename: 'sales.csv',
        rows: sales,
        columns: [
          { key: 'id', label: 'Sale ID' },
          { key: 'project', label: 'Project' },
          { key: 'client', label: 'Client' },
          { key: 'saleType', label: 'Sale type' },
          { key: 'contract', label: 'Contract', render: (row) => money(row.contract) },
          { key: 'net', label: 'Net collected', render: (row) => money(row.net) },
          { key: 'status', label: 'Collection status', render: (row) => <StatusBadge value={row.status} /> },
        ] satisfies Column<(typeof sales)[number]>[],
      }
    }
    if (page === 'incentives' || page === 'approvals') {
      const scoped = user?.role === 'HOD'
        ? incentiveRequests.filter((row) => row.department === 'Construction Estimation')
        : incentiveRequests
      return {
        filename: 'incentives.csv',
        rows: scoped,
        columns: [
          { key: 'id', label: 'Request ID' },
          { key: 'department', label: 'Department' },
          { key: 'hod', label: 'HOD' },
          { key: 'month', label: 'Period' },
          { key: 'type', label: 'Type' },
          { key: 'total', label: 'Total', render: (row) => money(row.total) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        ] satisfies Column<(typeof scoped)[number]>[],
      }
    }
    if (page === 'payroll') {
      const payrollRows = [
        { id: 'BATCH-2026-09', month: 'September 2026', department: 'All', total: 250, status: 'Ready for Payment' },
      ]
      return {
        filename: 'payroll.csv',
        rows: payrollRows,
        columns: [
          { key: 'id', label: 'Batch' },
          { key: 'month', label: 'Month' },
          { key: 'total', label: 'Total', render: (row) => money(row.total) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        ] satisfies Column<(typeof payrollRows)[number]>[],
      }
    }
    if (page === 'settings') {
      return {
        filename: 'settings.csv',
        rows: [
          { id: 'month-lock', name: 'September 2026 lock', value: 'Unlocked' },
          { id: 'quickfill', name: 'Role quick-fill', value: import.meta.env.VITE_ENABLE_ROLE_QUICKFILL === 'true' ? 'On (demo)' : 'Off' },
          { id: 'card-data', name: 'Card data fields', value: 'Forbidden' },
        ],
        columns: [
          { key: 'name', label: 'Setting' },
          { key: 'value', label: 'Value' },
        ],
      }
    }
    return {
      filename: 'audit.csv',
      rows: auditLogs,
      columns: [
        { key: 'user', label: 'User' },
        { key: 'action', label: 'Action' },
        { key: 'entity', label: 'Entity' },
        { key: 'oldValue', label: 'Old value' },
        { key: 'newValue', label: 'New value' },
        { key: 'at', label: 'Date / time' },
        { key: 'reason', label: 'Reason' },
      ] satisfies Column<(typeof auditLogs)[number]>[],
    }
  }, [page, user])

  return (
    <div className="page-grid">
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        actions={
          <Button
            variant="ghost"
            onClick={() =>
              downloadCsv(
                filename,
                rows.map((row) =>
                  Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : String(value)])),
                ),
              )
            }
          >
            Export to Excel
          </Button>
        }
      />
      {page === 'sales' ? (
        <Card title="Collection payments">
          <DataTable
            rows={payments}
            rowKey={(row) => row.id}
            columns={[
              { key: 'id', label: 'Payment ID' },
              { key: 'saleId', label: 'Sale' },
              { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
              { key: 'method', label: 'Method' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
              { key: 'reference', label: 'Reference' },
            ]}
          />
        </Card>
      ) : null}
      <Card>
        <DataTable rows={rows} rowKey={(row) => String((row as { id: string }).id)} columns={columns as Column<(typeof rows)[number]>[]} />
      </Card>
    </div>
  )
}
