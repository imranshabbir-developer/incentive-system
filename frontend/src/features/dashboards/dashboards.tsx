import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Lock,
  UserCheck,
  Users,
} from 'lucide-react'
import { ReportingSection } from '@/features/dashboards/ReportingSection'
import { useAuth } from '@/features/auth/auth-context'
import { countStatus, eligibleFrom, useFims } from '@/features/data/fims-store'
import { BarSummaryChart } from '@/shared/charts/BarSummaryChart'
import { DonutChart } from '@/shared/charts/DonutChart'
import { LineTrendChart } from '@/shared/charts/LineTrendChart'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import { categoryShare, departmentOptions, monthlyTrend, spark, sparkDown } from '@/shared/data/seed'
import { Select } from '@/shared/ui/Select'
import { downloadCsv } from '@/shared/utils/csv'
import { money } from '@/shared/utils/money'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { KpiCard } from '@/shared/ui/KpiCard'
import { StatusBadge } from '@/shared/ui/StatusBadge'

function usePrefix() {
  const { user } = useAuth()
  return ROLE_PREFIX[user!.role]
}

function Hero({ title, text, to, action }: { title: string; text: string; to?: string; action?: string }) {
  return (
    <div className="hero">
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      {to ? (
        <Link className="ui-btn ui-btn-primary" to={to}>{action}</Link>
      ) : null}
    </div>
  )
}

function deptBars(items: { department: string; amount: number }[], departments: { name: string; code: string }[]) {
  return departments.map((dept) => ({
    name: dept.name,
    value: items.filter((row) => row.department === dept.code || row.department === dept.name).reduce((sum, row) => sum + row.amount, 0),
  }))
}

function DepartmentFilter({ value, onChange, departments }: { value: string; onChange: (value: string) => void; departments: { name: string }[] }) {
  return <Select label="Department" value={value} options={departmentOptions(departments, { value: 'All', label: 'All departments' })} onChange={onChange} />
}

export function AdminDashboard() {
  const base = usePrefix()
  const { requests, audit, users, departments, employees: people } = useFims()
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="page-grid">
      <Hero title="Control users, departments and audit from one place" text="Super Admin workspace for IPS-USA FIMS." to={`/${base}/users`} action="Open users" />
      <section className="kpi-grid">
        <KpiCard label="Total users" value={String(users.length)} tone="green" icon={<Users />} spark={spark} />
        <KpiCard label="Departments" value={String(departments.length)} delta={`${departments.filter((row) => row.status === 'Active').length} active`} tone="purple" icon={<Building2 />} spark={spark} />
        <KpiCard label="Employees" value={String(people.length)} delta={`${people.filter((row) => row.status === 'Active').length} active`} tone="blue" icon={<UserCheck />} spark={spark} />
        <KpiCard label="Inactive employees" value={String(people.filter((row) => row.status === 'Inactive').length)} tone="dark" icon={<Users />} />
        <KpiCard label="Open requests" value={String(requests.filter((row) => !['Paid', 'Rejected', 'Cancelled'].includes(row.status)).length)} tone="amber" icon={<ClipboardList />} spark={spark} />
        <KpiCard label="Audit events today" value={String(audit.filter((row) => row.at.startsWith(today)).length)} tone="rose" icon={<ClipboardList />} />
      </section>
      <div className="shortcut-grid">
        {[
          ['users', 'Users'],
          ['departments', 'Departments'],
          ['designations', 'Designations'],
          ['employees', 'Employees'],
          ['plans', 'Incentive plans'],
          ['settings', 'Settings'],
          ['audit', 'Audit log'],
          ['extra-approvals', 'Extra approvals'],
        ].map(([key, label]) => (
          <Link key={key} className="shortcut" to={`/${base}/${key}`}>
            <strong>{label}</strong>
            <span className="tiny">Open module</span>
          </Link>
        ))}
      </div>
      <Card title="Departments">
        <DataTable
          rows={departments}
          rowKey={(row) => row.id}
          columns={[
            { key: 'name', label: 'Department' },
            { key: 'hod', label: 'HOD' },
            { key: 'reviewer', label: 'Finance reviewer' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          ]}
        />
      </Card>
      <div className="two-col">
        <Card title="Monthly trend">
          <LineTrendChart data={monthlyTrend} />
        </Card>
        <Card title="Recent audit">
          <DataTable
            rows={audit.slice(0, 6)}
            rowKey={(row) => row.id}
            columns={[
              { key: 'user', label: 'User' },
              { key: 'action', label: 'Action' },
              { key: 'entity', label: 'Entity' },
              { key: 'at', label: 'When' },
            ]}
          />
        </Card>
      </div>
      <ReportingSection extra={[{ id: 'user-access', label: 'User / role access' }]} />
    </div>
  )
}

export function HrDashboard() {
  const base = usePrefix()
  const { employees: people, departments } = useFims()
  const first = people[0]
  return (
    <div className="page-grid">
      <Hero title="Keep the employee master accurate" text="HR maintains people data only. Incentive amounts are not calculated here." to={`/${base}/employees`} action="Open employee master" />
      <section className="kpi-grid">
        <KpiCard label="Total employees" value={String(people.length)} tone="green" icon={<Users />} spark={spark} />
        <KpiCard label="Active" value={String(people.filter((row) => row.status === 'Active').length)} tone="blue" icon={<UserCheck />} spark={spark} />
        <KpiCard label="Notice period" value={String(people.filter((row) => row.status === 'Notice Period').length)} tone="amber" icon={<Briefcase />} spark={sparkDown} />
        <KpiCard label="Resigned" value={String(people.filter((row) => row.status === 'Resigned').length)} tone="rose" icon={<Users />} />
        <KpiCard label="Terminated" value={String(people.filter((row) => row.status === 'Terminated').length)} tone="dark" icon={<Users />} />
        <KpiCard label="Inactive" value={String(people.filter((row) => row.status === 'Inactive').length)} tone="purple" icon={<Users />} />
        <KpiCard label="Eligible for incentive" value={String(people.filter((row) => row.eligible === 'Yes').length)} tone="green" icon={<BadgeCheck />} spark={spark} />
        <KpiCard label="Not eligible" value={String(people.filter((row) => row.eligible === 'No').length)} tone="amber" icon={<BadgeCheck />} />
      </section>
      <div className="shortcut-grid">
        <Link className="shortcut" to={`/${base}/employees`}><strong>Employee list</strong><span className="tiny">Master records</span></Link>
        <Link className="shortcut" to={`/${base}/employees?new=1`}><strong>Add employee</strong><span className="tiny">No incentive amount</span></Link>
        {first ? <Link className="shortcut" to={`/${base}/employees?id=${first.id}`}><strong>Employee profile</strong><span className="tiny">{first.name}</span></Link> : null}
      </div>
      <Card title="Employees by department">
        <DataTable
          rows={departments.map((dept) => ({
            id: dept.id,
            department: dept.name,
            total: people.filter((row) => row.department === dept.name).length,
            eligible: people.filter((row) => row.department === dept.name && row.eligible === 'Yes').length,
          }))}
          rowKey={(row) => row.id}
          columns={[
            { key: 'department', label: 'Department' },
            { key: 'total', label: 'Employees' },
            { key: 'eligible', label: 'Eligible' },
          ]}
        />
      </Card>
      <ReportingSection />
    </div>
  )
}

export function HodDashboard() {
  const { user } = useAuth()
  const base = usePrefix()
  const { requests, sales, payments, employees: people, departments } = useFims()
  const [dept, setDept] = useState(user?.departmentNames[0] ?? 'Construction Estimation')
  const mine = requests.filter((row) => row.department === dept)
  const eligible = eligibleFrom(dept, sales, payments)
  const team = people.filter((row) => row.department === dept)
  return (
    <div className="page-grid">
      <Hero title={`Submit September incentives for ${dept}`} text="Pick any IPS-USA department in the list. Collections and employees update to that department." to={`/${base}/incentives/new-sale`} action="New sale-based request" />
      <Select label="Department" value={dept} options={departmentOptions(departments)} onChange={setDept} />
      <section className="kpi-grid">
        <KpiCard label="Team members" value={String(team.length)} tone="green" icon={<Users />} spark={spark} />
        <KpiCard label="Eligible collections" value={String(eligible.length)} tone="blue" icon={<CircleDollarSign />} spark={spark} />
        <KpiCard label="Draft" value={String(countStatus(mine, 'Draft'))} tone="amber" icon={<ClipboardList />} />
        <KpiCard label="Submitted" value={String(countStatus(mine, ['Submitted', 'Resubmitted']))} tone="purple" icon={<ClipboardList />} spark={spark} />
        <KpiCard label="Returned" value={String(countStatus(mine, 'Returned'))} tone="rose" icon={<ClipboardList />} spark={sparkDown} />
        <KpiCard label="Approved" value={String(countStatus(mine, 'Approved'))} tone="green" icon={<BadgeCheck />} spark={spark} />
        <KpiCard label="Paid" value={String(countStatus(mine, 'Paid'))} tone="dark" icon={<CircleDollarSign />} />
      </section>
      <div className="shortcut-grid">
        <Link className="shortcut" to={`/${base}/incentives`}><strong>My requests</strong><span className="tiny">Draft to paid</span></Link>
        <Link className="shortcut" to={`/${base}/incentives/new-sale`}><strong>New sale-based request</strong><span className="tiny">Verified collections only</span></Link>
        <Link className="shortcut" to={`/${base}/incentives/new-manual`}><strong>Manual / Special</strong><span className="tiny">No sale required</span></Link>
        <Link className="shortcut" to={`/${base}/incentives?status=Returned`}><strong>Returned requests</strong><span className="tiny">{countStatus(mine, 'Returned')} waiting</span></Link>
        <Link className="shortcut" to={`/${base}/employees`}><strong>Team roster</strong><span className="tiny">Read-only people</span></Link>
      </div>
      <Card title="Eligible collections">
        <DataTable
          rows={eligible.map((row) => ({ id: row.pay.id, project: row.sale.project, client: row.sale.client, department: row.sale.department, net: row.sale.net, status: row.pay.status }))}
          rowKey={(row) => row.id}
          columns={[
            { key: 'project', label: 'Project' },
            { key: 'client', label: 'Client' },
            { key: 'department', label: 'Department' },
            { key: 'net', label: 'Net collection', render: (row) => money(row.net) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          ]}
        />
      </Card>
      <Card title="My requests">
        <DataTable
          rows={mine}
          rowKey={(row) => row.id}
          columns={[
            { key: 'id', label: 'Request', render: (row) => <Link to={`/${base}/incentives/${row.id}`}>{row.id}</Link> },
            { key: 'month', label: 'Period' },
            { key: 'total', label: 'Total', render: (row) => money(row.total) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          ]}
        />
      </Card>
      <ReportingSection />
    </div>
  )
}

export function FinanceUserDashboard() {
  const base = usePrefix()
  const { requests, items, sales, payments, departments } = useFims()
  const [dept, setDept] = useState('All')
  const shownSales = dept === 'All' ? sales : sales.filter((row) => row.department === dept)
  const shownQueue = requests.filter((row) => ['Submitted', 'Resubmitted', 'Under Finance Review'].includes(row.status) && (dept === 'All' || row.department === dept))
  const pending = countStatus(requests, ['Submitted', 'Resubmitted', 'Under Finance Review'])
  const approvedTotal = items.filter((row) => row.status === 'Approved').reduce((sum, row) => sum + row.amount, 0)
  const collected = payments.filter((row) => row.status === 'Verified').reduce((sum, row) => sum + row.net, 0)
  const categories = ['Sales', 'Performance', 'Special', 'Bonus'].map((name, index) => ({
    name,
    value: items.filter((row) => row.type === name).reduce((sum, row) => sum + row.amount, 0) || categoryShare[index]?.value || 0,
    color: categoryShare[index]?.color ?? '#d1d5db',
  }))
  return (
    <div className="page-grid">
      <Hero title="Verify collections and review HOD requests" text="Finance inbox for IPS-USA incentive control." to={`/${base}/approvals`} action="Open review queue" />
      <section className="kpi-grid">
        <KpiCard label="Pending review" value={String(pending)} tone="amber" icon={<ClipboardList />} spark={spark} />
        <KpiCard label="Returned" value={String(countStatus(requests, 'Returned'))} tone="rose" icon={<ClipboardList />} spark={sparkDown} />
        <KpiCard label="Approved" value={String(countStatus(requests, 'Approved'))} tone="green" icon={<BadgeCheck />} spark={spark} />
        <KpiCard label="Ready for payment" value={String(countStatus(requests, 'Ready for Payment'))} tone="blue" icon={<CircleDollarSign />} spark={spark} />
        <KpiCard label="Paid" value={String(countStatus(requests, 'Paid'))} tone="dark" icon={<CircleDollarSign />} />
        <KpiCard label="Unverified collections" value={String(payments.filter((row) => row.status !== 'Verified').length)} tone="purple" icon={<ClipboardList />} spark={sparkDown} />
        <KpiCard label="Sales this month" value={String(sales.filter((row) => row.date.startsWith('2026-09')).length)} tone="green" icon={<Briefcase />} spark={spark} />
        <KpiCard label="Collections this month" value={money(collected)} tone="blue" icon={<CircleDollarSign />} spark={spark} />
        <KpiCard label="Total incentives" value={money(items.reduce((sum, row) => sum + row.amount, 0))} tone="green" icon={<CircleDollarSign />} />
        <KpiCard label="Incentive / collection" value={collected ? `${((approvedTotal / collected) * 100).toFixed(1)}%` : '0%'} tone="purple" icon={<BadgeCheck />} />
      </section>
      <div className="two-col">
        <Card title="Monthly collections vs incentives" action={<Button variant="ghost" onClick={() => downloadCsv('monthly-trend.csv', monthlyTrend)}>Download</Button>}>
          <LineTrendChart data={monthlyTrend} />
        </Card>
        <Card title="Incentive categories">
          <DonutChart data={categories} />
          <div className="legend">
            {categories.map((item) => (
              <div key={item.name}><i style={{ background: item.color }} />{item.name}</div>
            ))}
          </div>
        </Card>
      </div>
      <DepartmentFilter value={dept} onChange={setDept} departments={departments} />
      <Card title="Department-wise incentives">
        <BarSummaryChart data={deptBars(items, departments)} />
      </Card>
      <Card title="Sales / collections queue">
        <DataTable
          rows={shownSales}
          rowKey={(row) => row.id}
          columns={[
            { key: 'project', label: 'Project' },
            { key: 'client', label: 'Client' },
            { key: 'department', label: 'Department' },
            { key: 'net', label: 'Net collected', render: (row) => money(row.net) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'open', label: '', render: () => <Link className="ui-btn ui-btn-ghost" to={`/${base}/sales`}>Verify</Link> },
          ]}
        />
      </Card>
      <Card title="Review queue">
        <DataTable
          rows={shownQueue}
          rowKey={(row) => row.id}
          columns={[
            { key: 'id', label: 'Request', render: (row) => <Link to={`/${base}/incentives/${row.id}`}>{row.id}</Link> },
            { key: 'hod', label: 'HOD' },
            { key: 'department', label: 'Department' },
            { key: 'total', label: 'Total', render: (row) => money(row.total) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          ]}
        />
      </Card>
      <div className="shortcut-grid">
        <Link className="shortcut" to={`/${base}/approvals`}><strong>Review queue</strong><span className="tiny">Submitted to Finance</span></Link>
        <Link className="shortcut" to={`/${base}/sales`}><strong>Verify payment</strong><span className="tiny">Collections list</span></Link>
        <Link className="shortcut" to={`/${base}/incentives?status=Approved`}><strong>Approved requests</strong><span className="tiny">Ready to batch</span></Link>
        <Link className="shortcut" to={`/${base}/payroll`}><strong>Payment batches</strong><span className="tiny">Create only</span></Link>
        <Link className="shortcut" to={`/${base}/reports`}><strong>Reports hub</strong><span className="tiny">All five + Excel</span></Link>
      </div>
      <ReportingSection />
    </div>
  )
}

export function FinanceManagerDashboard() {
  const base = usePrefix()
  const { requests, items, batches, monthLocked, departments } = useFims()
  const [dept, setDept] = useState('All')
  const shownItems = dept === 'All' ? items : items.filter((row) => row.department === departments.find((item) => item.name === dept)?.code || row.department === dept)
  return (
    <div className="page-grid">
      <Hero title="Final approval, batches and month lock" text="Finance Manager closes the period with a full audit trail." to={`/${base}/approvals`} action="Final approval queue" />
      <section className="kpi-grid">
        <KpiCard label="Waiting final approval" value={String(countStatus(requests, ['Submitted', 'Resubmitted', 'Under Finance Review']))} tone="amber" icon={<ClipboardList />} spark={spark} />
        <KpiCard label="Adjustments posted" value={String(items.filter((row) => row.type === 'Adjustment').length)} tone="purple" icon={<ClipboardList />} />
        <KpiCard label="Batches in progress" value={String(batches.filter((row) => row.status === 'Open').length)} tone="blue" icon={<CircleDollarSign />} spark={spark} />
        <KpiCard label="Finalized this month" value={String(batches.filter((row) => row.status === 'Finalized').length)} tone="green" icon={<BadgeCheck />} />
        <KpiCard label="Ready for payment" value={String(countStatus(requests, 'Ready for Payment'))} tone="blue" icon={<CircleDollarSign />} spark={spark} />
        <KpiCard label="Paid" value={String(countStatus(requests, 'Paid'))} tone="dark" icon={<CircleDollarSign />} />
        <KpiCard label="Month lock" value={monthLocked ? 'Locked' : 'Unlocked'} tone={monthLocked ? 'rose' : 'green'} icon={<Lock />} />
        <KpiCard label="Total incentives" value={money(shownItems.reduce((sum, row) => sum + row.amount, 0))} tone="green" icon={<CircleDollarSign />} spark={spark} />
      </section>
      <DepartmentFilter value={dept} onChange={setDept} departments={departments} />
      <div className="shortcut-grid">
        <Link className="shortcut" to={`/${base}/approvals`}><strong>Final approval queue</strong><span className="tiny">Submitted requests</span></Link>
        <Link className="shortcut" to={`/${base}/incentives?status=Approved`}><strong>Adjustments</strong><span className="tiny">Open an approved request</span></Link>
        <Link className="shortcut" to={`/${base}/payroll`}><strong>Payment batches</strong><span className="tiny">Finalize and mark paid</span></Link>
        <Link className="shortcut" to={`/${base}/settings`}><strong>Month lock</strong><span className="tiny">{monthLocked ? 'Locked' : 'Unlocked'}</span></Link>
        <Link className="shortcut" to={`/${base}/extra-approvals`}><strong>Extra approvals</strong><span className="tiny">Empty until configured</span></Link>
        <Link className="shortcut" to={`/${base}/reports`}><strong>Reports hub</strong><span className="tiny">All five + Excel</span></Link>
        <Link className="shortcut" to={`/${base}/audit`}><strong>Audit</strong><span className="tiny">Reasoned actions</span></Link>
      </div>
      <div className="two-col">
        <Card title="Department-wise incentives">
          <BarSummaryChart data={deptBars(shownItems, departments)} />
        </Card>
        <Card title="Monthly trend">
          <LineTrendChart data={monthlyTrend} />
        </Card>
      </div>
      <ReportingSection />
    </div>
  )
}

export function ExecutiveDashboard() {
  const base = usePrefix()
  const { requests, items, payments, departments } = useFims()
  const [dept, setDept] = useState('All')
  const shownItems = dept === 'All' ? items : items.filter((row) => row.department === departments.find((item) => item.name === dept)?.code || row.department === dept)
  const approved = shownItems.filter((row) => row.status === 'Approved' || row.status === 'Ready for Payment' || row.status === 'Paid').reduce((sum, row) => sum + row.amount, 0)
  const collected = payments.filter((row) => row.status === 'Verified').reduce((sum, row) => sum + row.net, 0)
  return (
    <div className="page-grid">
      <Hero title="Oversight without data entry" text="High-value approvals stay off until thresholds are configured." to={`/${base}/reports`} action="Open reports" />
      <section className="kpi-grid">
        <KpiCard label="Collections this month" value={money(collected)} tone="green" icon={<CircleDollarSign />} spark={spark} />
        <KpiCard label="Total incentives" value={money(approved)} tone="blue" icon={<CircleDollarSign />} spark={spark} />
        <KpiCard label="Incentive / collection" value={collected ? `${((approved / collected) * 100).toFixed(1)}%` : '0%'} tone="purple" icon={<BadgeCheck />} spark={spark} />
        <KpiCard label="Pending requests" value={String(countStatus(requests, ['Submitted', 'Resubmitted']))} tone="amber" icon={<ClipboardList />} spark={sparkDown} />
        <KpiCard label="Approved" value={String(countStatus(requests, 'Approved'))} tone="green" icon={<BadgeCheck />} spark={spark} />
        <KpiCard label="Paid" value={String(countStatus(requests, 'Paid'))} tone="dark" icon={<CircleDollarSign />} />
        <KpiCard label="Extra approval queue" value="0" tone="amber" icon={<Lock />} />
      </section>
      <DepartmentFilter value={dept} onChange={setDept} departments={departments} />
      <div className="shortcut-grid">
        <Link className="shortcut" to={`/${base}/extra-approvals`}><strong>Extra approval queue</strong><span className="tiny">Empty until configured</span></Link>
        <Link className="shortcut" to={`/${base}/approvals`}><strong>Finance queue (read)</strong><span className="tiny">No create-sale buttons</span></Link>
        <Link className="shortcut" to={`/${base}/reports`}><strong>All five reports</strong><span className="tiny">Excel export</span></Link>
      </div>
      <div className="two-col">
        <Card title="Monthly trend">
          <LineTrendChart data={monthlyTrend} />
        </Card>
        <Card title="Department-wise incentives">
          <BarSummaryChart data={deptBars(shownItems, departments)} />
        </Card>
      </div>
      <ReportingSection />
    </div>
  )
}
