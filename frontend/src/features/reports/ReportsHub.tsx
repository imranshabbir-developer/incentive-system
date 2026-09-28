import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileDown, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { useFims } from '@/features/data/fims-store'
import { buildReport, exportMatrix, isPeopleReport, reportsFor, type ReportFilters } from '@/features/reports/report-engine'
import { ROLE_LABEL, ROLE_PREFIX } from '@/shared/constants/roles'
import { departmentOptions, EMPLOYEE_STATUSES, INCENTIVE_TYPES, periodOptions, REQUEST_STATUSES } from '@/shared/data/seed'
import type { ReportId } from '@/shared/types'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable, type Column } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Select } from '@/shared/ui/Select'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { exportCsv, exportExcel, exportPdf, exportWord } from '@/shared/utils/export-file'
import { money } from '@/shared/utils/money'

const all = { value: 'All', label: 'All' }

export function ReportsHub() {
  const { reportId: urlId } = useParams()
  const { user } = useAuth()
  const store = useFims()
  const prefix = user ? ROLE_PREFIX[user.role] : 'admin'
  const catalog = reportsFor(user?.role ?? 'HOD')
  const activeId = (catalog.some((row) => row.id === urlId) ? urlId : catalog[0]?.id) as ReportId
  const [filters, setFilters] = useState<ReportFilters>({
    month: 'September 2026',
    department: user?.role === 'HOD' ? (user.departmentNames[0] ?? 'All') : 'All',
    employee: 'All',
    hod: 'All',
    status: 'All',
    type: 'All',
    eligible: 'All',
    empStatus: 'All',
  })

  const report = useMemo(
    () =>
      buildReport(activeId, filters, {
        items: store.items,
        requests: store.requests,
        employees: store.employees,
        departments: store.departments,
        sales: store.sales,
        payments: store.payments,
        users: store.users,
        audit: store.audit,
      }),
    [activeId, filters, store.audit, store.departments, store.employees, store.items, store.payments, store.requests, store.sales, store.users],
  )

  const employeeOptions = useMemo(
    () => [all, ...[...new Set(store.employees.map((row) => row.name))].map((value) => ({ value, label: value }))],
    [store.employees],
  )
  const hodOptions = useMemo(
    () => [all, ...[...new Set([...store.departments.map((row) => row.hod), ...store.employees.map((row) => row.hod)])].map((value) => ({ value, label: value }))],
    [store.departments, store.employees],
  )

  const people = isPeopleReport(activeId)
  const meta = [
    user ? ROLE_LABEL[user.role] : 'FIMS',
    filters.month === 'All' ? 'All periods' : filters.month,
    filters.department === 'All' ? 'All departments' : filters.department,
    `${report.rows.length} rows`,
  ].join(' · ')

  function setFilter<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function matrix() {
    return exportMatrix(report)
  }

  function slug() {
    return `FIMS-${report.id}`
  }

  const columns: Column<Record<string, string | number>>[] = report.columns.map((col) => ({
    key: col.key,
    label: col.label,
    render: (row) => {
      const value = row[col.key]
      if (col.kind === 'money') return money(Number(value) || 0)
      if (col.kind === 'status') return <StatusBadge value={String(value)} />
      return String(value ?? '')
    },
  }))

  if (!user) return null

  return (
    <div className="page-grid">
      <PageHeader
        title="Reports"
        subtitle="Filter any official IPS-USA register, then export PDF, Word, Excel, or CSV. HR sees people reports only."
        actions={
          <div className="export-actions">
            <Button variant="ghost" onClick={() => { const m = matrix(); exportPdf(report.title, meta, m.columns, m.rows) }}><Printer size={14} /> PDF</Button>
            <Button variant="ghost" onClick={() => { const m = matrix(); exportWord(`${slug()}.doc`, report.title, meta, m.columns, m.rows) }}><FileText size={14} /> Word</Button>
            <Button variant="ghost" onClick={() => { const m = matrix(); exportExcel(`${slug()}.xls`, report.title, meta, m.columns, m.rows) }}><FileSpreadsheet size={14} /> Excel</Button>
            <Button variant="ghost" onClick={() => { const m = matrix(); exportCsv(`${slug()}.csv`, m.columns, m.rows) }}><FileDown size={14} /> CSV</Button>
          </div>
        }
      />
      <Card title="Report type">
        <div className="report-grid">
          {catalog.map((item) => (
            <Link key={item.id} className={`shortcut${item.id === activeId ? ' is-current' : ''}`} to={`/${prefix}/reports/${item.id}`}>
              <strong>{item.label}</strong>
              <span className="tiny">{item.blurb}</span>
            </Link>
          ))}
        </div>
      </Card>
      <Card
        title={report.title}
        action={
          <div className="filter-grid">
            {people ? null : <Select label="Period" value={filters.month} options={[all, ...periodOptions()]} onChange={(value) => setFilter('month', value)} />}
            <Select label="Department" value={filters.department} options={departmentOptions(store.departments, { value: 'All', label: 'All departments' })} onChange={(value) => setFilter('department', value)} />
            {activeId === 'user-access' || activeId === 'audit-history' ? null : (
              <>
                <Select label="Employee" value={filters.employee} options={employeeOptions} onChange={(value) => setFilter('employee', value)} />
                <Select label="HOD" value={filters.hod} options={hodOptions} onChange={(value) => setFilter('hod', value)} />
              </>
            )}
            {people ? (
              <>
                <Select label="Employment status" value={filters.empStatus} options={[all, ...EMPLOYEE_STATUSES.map((value) => ({ value, label: value }))]} onChange={(value) => setFilter('empStatus', value)} />
                <Select label="Incentive eligible" value={filters.eligible} options={[all, { value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} onChange={(value) => setFilter('eligible', value)} />
              </>
            ) : activeId === 'user-access' || activeId === 'audit-history' ? null : (
              <>
                <Select label="Status" value={filters.status} options={[all, ...REQUEST_STATUSES.map((value) => ({ value, label: value }))]} onChange={(value) => setFilter('status', value)} />
                <Select label="Incentive type" value={filters.type} options={[all, ...INCENTIVE_TYPES.map((value) => ({ value, label: value }))]} onChange={(value) => setFilter('type', value)} />
              </>
            )}
          </div>
        }
      >
        <div className="report-sheet">
          <div className="report-sheet-head">
            <p className="tiny">IPS-USA · FIMS</p>
            <h2>{report.title}</h2>
            <p className="muted">{meta}</p>
            <div className="report-totals">
              {report.totals.map((item) => (
                <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>
              ))}
            </div>
          </div>
          <DataTable
            rows={report.rows}
            rowKey={(row) => String(row.id)}
            empty="No rows for these filters."
            columns={columns}
          />
        </div>
      </Card>
    </div>
  )
}
