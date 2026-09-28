import type { AuthUser, IncentiveItem, IncentiveRequest, ReportId, Role } from '@/shared/types'
import { ROLE_LABEL } from '@/shared/constants/roles'
import { money } from '@/shared/utils/money'
import type { Employee } from '@/features/data/fims-store'

export type ReportColumn = { key: string; label: string; kind?: 'money' | 'status' | 'pct' }

export type ReportDef = { id: ReportId; label: string; blurb: string }

export type ReportFilters = {
  month: string
  department: string
  employee: string
  hod: string
  status: string
  type: string
  eligible: string
  empStatus: string
}

export type BuiltReport = {
  id: ReportId
  title: string
  columns: ReportColumn[]
  rows: Record<string, string | number>[]
  totals: { label: string; value: string }[]
}

const moneyReports: ReportDef[] = [
  { id: 'incentive-register', label: 'Incentive Register', blurb: 'Month, department, employee, HOD, status, type, amount' },
  { id: 'employee-history', label: 'Employee Incentive History', blurb: 'Every incentive and payment status for a person' },
  { id: 'department-summary', label: 'Department Summary', blurb: 'Sales, net collections, incentive, incentive %' },
  { id: 'hod-submissions', label: 'HOD Submission Report', blurb: 'Requests, approved, returned, rejected, pending' },
  { id: 'payment-report', label: 'Payment Report', blurb: 'Approved, ready for payment, paid, unpaid' },
]

const hrReports: ReportDef[] = [
  { id: 'employees-by-department', label: 'Employees by Department', blurb: 'Headcount by department' },
  { id: 'employees-by-status', label: 'Employees by Status', blurb: 'Active, notice, resigned, terminated, inactive' },
  { id: 'eligibility-list', label: 'Incentive Eligibility', blurb: 'Eligible vs not eligible people' },
  { id: 'joining-list', label: 'Joining Date List', blurb: 'Employee master joining dates' },
]

export function reportsFor(role: Role): ReportDef[] {
  if (role === 'HR') return hrReports
  const list = [...moneyReports]
  if (role === 'SUPER_ADMIN') list.push({ id: 'user-access', label: 'User / role access', blurb: 'Users, roles and department scope' })
  if (role === 'SUPER_ADMIN' || role === 'FINANCE_MANAGER') {
    list.push({ id: 'audit-history', label: 'Audit history', blurb: 'User, action, entity, old/new value, time, reason' })
  }
  return list
}

export function isPeopleReport(id: ReportId) {
  return id === 'employees-by-department' || id === 'employees-by-status' || id === 'eligibility-list' || id === 'joining-list'
}

function matchDept(value: string, selected: string, departments: Array<{ name: string; code: string }>) {
  if (selected === 'All') return true
  const code = departments.find((row) => row.name === selected)?.code
  return value === selected || value === code
}

function paymentBucket(status: string) {
  if (status === 'Paid') return 'Paid'
  if (status === 'Ready for Payment') return 'Ready for Payment'
  if (status === 'Approved') return 'Approved'
  if (status === 'Rejected' || status === 'Cancelled') return 'Closed'
  return 'Unpaid'
}

export function buildReport(
  reportId: ReportId,
  filters: ReportFilters,
  data: {
    items: IncentiveItem[]
    requests: IncentiveRequest[]
    employees: Employee[]
    departments: Array<{ id: string; name: string; code: string; hod: string }>
    sales: Array<{ id: string; department: string; contract: number; net: number }>
    payments: Array<{ saleId: string; net: number; status: string }>
    users: AuthUser[]
    audit: Array<{ id: string; user: string; action: string; entity: string; oldValue: string; newValue: string; at: string; reason: string }>
  },
): BuiltReport {
  const { month, department, employee, hod, status, type, eligible, empStatus } = filters
  const items = data.items.filter((row) => {
    if (!matchDept(row.department, department, data.departments)) return false
    if (month !== 'All' && row.month !== month) return false
    if (employee !== 'All' && row.employee !== employee) return false
    if (hod !== 'All' && row.hod !== hod) return false
    if (status !== 'All' && row.status !== status) return false
    if (type !== 'All' && row.type !== type) return false
    return true
  })
  const requests = data.requests.filter((row) => {
    if (!matchDept(row.department, department, data.departments) && !matchDept(row.departmentCode ?? '', department, data.departments)) return false
    if (month !== 'All' && row.month !== month) return false
    if (hod !== 'All' && row.hod !== hod) return false
    if (status !== 'All' && row.status !== status) return false
    if (type !== 'All' && row.type !== type) return false
    return true
  })
  const people = data.employees.filter((row) => {
    if (department !== 'All' && row.department !== department) return false
    if (employee !== 'All' && row.name !== employee) return false
    if (hod !== 'All' && row.hod !== hod) return false
    if (eligible !== 'All' && row.eligible !== eligible) return false
    if (empStatus !== 'All' && row.status !== empStatus) return false
    return true
  })

  if (reportId === 'employee-history') {
    const rows = items.map((row, index) => ({
      id: `${row.requestId}-${row.employee}-${index}`,
      employee: row.employee,
      month: row.month,
      requestId: row.requestId,
      type: row.type,
      amount: row.amount,
      status: row.status,
      hod: row.hod,
      department: row.department,
    }))
    return {
      id: reportId,
      title: 'Employee Incentive History',
      columns: [
        { key: 'employee', label: 'Employee' },
        { key: 'month', label: 'Period' },
        { key: 'requestId', label: 'Request' },
        { key: 'type', label: 'Incentive type' },
        { key: 'amount', label: 'Amount', kind: 'money' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'hod', label: 'HOD' },
        { key: 'department', label: 'Department' },
      ],
      rows,
      totals: [{ label: 'Total incentive', value: money(items.reduce((sum, row) => sum + row.amount, 0)) }, { label: 'Rows', value: String(rows.length) }],
    }
  }

  if (reportId === 'department-summary') {
    const scopedDepts = department === 'All' ? data.departments : data.departments.filter((row) => row.name === department)
    const rows = scopedDepts.map((dept) => {
      const deptSales = data.sales.filter((row) => row.department === dept.name)
      const collections = data.payments
        .filter((pay) => deptSales.some((sale) => sale.id === pay.saleId) && pay.status === 'Verified')
        .reduce((sum, row) => sum + row.net, 0)
      const incentive = items
        .filter((item) => item.department === dept.code || item.department === dept.name)
        .reduce((sum, item) => sum + item.amount, 0)
      const salesTotal = deptSales.reduce((sum, row) => sum + row.contract, 0)
      return {
        id: dept.id,
        department: dept.name,
        hod: dept.hod,
        sales: salesTotal,
        collections,
        incentive,
        pct: collections ? `${((incentive / collections) * 100).toFixed(1)}%` : '0.0%',
      }
    })
    return {
      id: reportId,
      title: 'Department Summary',
      columns: [
        { key: 'department', label: 'Department' },
        { key: 'hod', label: 'HOD' },
        { key: 'sales', label: 'Total sales', kind: 'money' },
        { key: 'collections', label: 'Net collections', kind: 'money' },
        { key: 'incentive', label: 'Total incentive', kind: 'money' },
        { key: 'pct', label: 'Incentive %', kind: 'pct' },
      ],
      rows,
      totals: [
        { label: 'Net collections', value: money(rows.reduce((sum, row) => sum + Number(row.collections), 0)) },
        { label: 'Total incentive', value: money(rows.reduce((sum, row) => sum + Number(row.incentive), 0)) },
      ],
    }
  }

  if (reportId === 'hod-submissions') {
    const names = [...new Set([...requests.map((row) => row.hod), ...data.departments.map((row) => row.hod)])]
    const scoped = department === 'All' ? names : names.filter((name) => data.departments.some((dept) => dept.hod === name && dept.name === department) || requests.some((row) => row.hod === name))
    const rows = scoped.map((name) => {
      const mine = requests.filter((row) => row.hod === name)
      return {
        id: name,
        hod: name,
        requests: mine.length,
        approved: mine.filter((row) => row.status === 'Approved').length,
        returned: mine.filter((row) => row.status === 'Returned').length,
        rejected: mine.filter((row) => row.status === 'Rejected').length,
        pending: mine.filter((row) => ['Submitted', 'Resubmitted', 'Draft', 'Under Finance Review'].includes(row.status)).length,
      }
    })
    return {
      id: reportId,
      title: 'HOD Submission Report',
      columns: [
        { key: 'hod', label: 'HOD' },
        { key: 'requests', label: 'Requests' },
        { key: 'approved', label: 'Approved' },
        { key: 'returned', label: 'Returned' },
        { key: 'rejected', label: 'Rejected' },
        { key: 'pending', label: 'Pending' },
      ],
      rows,
      totals: [{ label: 'HODs', value: String(rows.length) }, { label: 'Requests', value: String(requests.length) }],
    }
  }

  if (reportId === 'payment-report') {
    const rows = requests.map((row) => ({
      id: row.id,
      requestId: row.id,
      department: row.department,
      hod: row.hod,
      month: row.month,
      amount: row.total,
      status: row.status,
      bucket: paymentBucket(row.status),
    }))
    return {
      id: reportId,
      title: 'Payment Report',
      columns: [
        { key: 'requestId', label: 'Request' },
        { key: 'department', label: 'Department' },
        { key: 'hod', label: 'HOD' },
        { key: 'month', label: 'Month' },
        { key: 'amount', label: 'Amount', kind: 'money' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'bucket', label: 'Payment bucket' },
      ],
      rows,
      totals: [
        { label: 'Approved', value: String(requests.filter((row) => row.status === 'Approved').length) },
        { label: 'Ready for payment', value: String(requests.filter((row) => row.status === 'Ready for Payment').length) },
        { label: 'Paid', value: String(requests.filter((row) => row.status === 'Paid').length) },
        { label: 'Unpaid', value: String(requests.filter((row) => !['Paid', 'Rejected', 'Cancelled'].includes(row.status)).length) },
      ],
    }
  }

  if (isPeopleReport(reportId)) {
    const sorted = reportId === 'joining-list' ? [...people].sort((a, b) => a.joiningDate.localeCompare(b.joiningDate)) : people
    return {
      id: reportId,
      title: hrReports.find((row) => row.id === reportId)?.label ?? 'Employee report',
      columns: [
        { key: 'id', label: 'Employee ID' },
        { key: 'name', label: 'Name' },
        { key: 'designation', label: 'Designation' },
        { key: 'department', label: 'Department' },
        { key: 'hod', label: 'HOD' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'eligible', label: 'Eligible', kind: 'status' },
        { key: 'joiningDate', label: 'Joining date' },
        { key: 'location', label: 'Location' },
      ],
      rows: sorted.map((row) => ({
        id: row.id,
        name: row.name,
        designation: row.designation,
        department: row.department,
        hod: row.hod,
        status: row.status,
        eligible: row.eligible,
        joiningDate: row.joiningDate,
        location: row.location,
      })),
      totals: [
        { label: 'Employees', value: String(sorted.length) },
        { label: 'Eligible', value: String(sorted.filter((row) => row.eligible === 'Yes').length) },
      ],
    }
  }

  if (reportId === 'user-access') {
    return {
      id: reportId,
      title: 'User / role access',
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'title', label: 'Title' },
        { key: 'scope', label: 'Scope' },
      ],
      rows: data.users.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: ROLE_LABEL[row.role],
        title: row.title,
        scope: row.departmentNames.join(', ') || 'All departments',
      })),
      totals: [{ label: 'Users', value: String(data.users.length) }],
    }
  }

  if (reportId === 'audit-history') {
    return {
      id: reportId,
      title: 'Audit history',
      columns: [
        { key: 'user', label: 'User' },
        { key: 'action', label: 'Action' },
        { key: 'entity', label: 'Entity' },
        { key: 'oldValue', label: 'Old value' },
        { key: 'newValue', label: 'New value' },
        { key: 'at', label: 'Date / time' },
        { key: 'reason', label: 'Reason' },
      ],
      rows: data.audit.map((row) => ({ ...row })),
      totals: [{ label: 'Events', value: String(data.audit.length) }],
    }
  }

  const rows = items.map((row, index) => ({
    id: `${row.requestId}-${row.employee}-${index}`,
    month: row.month,
    department: row.department,
    employee: row.employee,
    hod: row.hod,
    status: row.status,
    type: row.type,
    amount: row.amount,
    requestId: row.requestId,
  }))
  return {
    id: reportId,
    title: 'Incentive Register',
    columns: [
      { key: 'month', label: 'Month' },
      { key: 'department', label: 'Department' },
      { key: 'employee', label: 'Employee' },
      { key: 'hod', label: 'HOD' },
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'type', label: 'Incentive type' },
      { key: 'amount', label: 'Amount', kind: 'money' },
    ],
    rows,
    totals: [{ label: 'Total amount', value: money(items.reduce((sum, row) => sum + row.amount, 0)) }, { label: 'Rows', value: String(rows.length) }],
  }
}

export function exportMatrix(report: BuiltReport) {
  const columns = report.columns.map((col) => col.label)
  const rows = report.rows.map((row) =>
    report.columns.map((col) => {
      const value = row[col.key]
      if (col.kind === 'money') return money(Number(value) || 0)
      return value ?? ''
    }),
  )
  return { columns, rows }
}
