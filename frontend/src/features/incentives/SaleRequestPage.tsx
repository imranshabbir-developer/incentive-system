import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { deptCode, eligibleFrom, useFims } from '@/features/data/fims-store'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import { departmentOptions, INCENTIVE_TYPES, periodOptions } from '@/shared/data/seed'
import { money } from '@/shared/utils/money'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Select } from '@/shared/ui/Select'

type Line = { employeeId: string; type: string; amount: string; comments: string }
const emptyLine: Line = { employeeId: '', type: 'Sales', amount: '', comments: '' }

export function SaleRequestPage() {
  const { requestId } = useParams()
  const { user } = useAuth()
  const { requests, items, employees, sales, payments, saleTeam, departments, saveRequest, monthLocked } = useFims()
  const navigate = useNavigate()
  const prefix = ROLE_PREFIX[user!.role]
  const existing = requests.find((row) => row.id === requestId)
  const [department, setDepartment] = useState(user?.departmentNames[0] ?? 'Construction Estimation')
  const collections = eligibleFrom(department, sales, payments)
  const [month, setMonth] = useState(existing?.month ?? 'September 2026')
  const [paymentId, setPaymentId] = useState(existing?.paymentId ?? '')
  const [comments, setComments] = useState(existing?.comments ?? '')
  const [error, setError] = useState('')
  const [lines, setLines] = useState<Line[]>(() => {
    const current = items.filter((row) => row.requestId === requestId)
    return current.length
      ? current.map((row) => ({ employeeId: row.employeeId, type: row.type, amount: String(row.amount), comments: row.comments }))
      : [{ ...emptyLine }]
  })

  const selected = collections.find((row) => row.pay.id === paymentId)
  const suggested = selected ? saleTeam.filter((row) => row.saleId === selected.sale.id) : []
  const teamPool = employees.filter((emp) => emp.department === department && emp.eligible === 'Yes' && emp.status === 'Active')
  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)
  const usedCombos = useMemo(
    () => items.filter((row) => row.requestId !== existing?.id && !['Rejected', 'Cancelled'].includes(row.status)).map((row) => {
      const req = requests.find((item) => item.id === row.requestId)
      return `${req?.saleId ?? ''}|${req?.paymentId ?? ''}|${row.employeeId}|${row.type}`
    }),
    [existing?.id, items, requests],
  )

  function persist(submit: boolean) {
    setError('')
    if (monthLocked && submit) { setError('This month is locked.'); return }
    if (!selected) { setError('Select a verified collection first.'); return }
    const filled = lines.filter((line) => line.employeeId && Number(line.amount) > 0)
    if (!filled.length) { setError('Add at least one eligible employee with an amount.'); return }
    const duplicate = filled.find((line) => usedCombos.includes(`${selected.sale.id}|${selected.pay.id}|${line.employeeId}|${line.type}`))
    if (duplicate) {
      setError(`Duplicate blocked: this employee already has ${duplicate.type} on this sale + payment.`)
      return
    }
    const result = saveRequest({
      existingId: existing?.id, kind: 'SALE', department, departmentCode: deptCode(department, departments), hod: user!.name, month,
      type: filled[0].type, saleId: selected.sale.id, paymentId: selected.pay.id, comments, actor: user!.name, submit,
      lines: filled.map((line) => {
        const emp = teamPool.find((item) => item.id === line.employeeId)
        return { employeeId: line.employeeId, employee: emp?.name ?? line.employeeId, designation: emp?.designation ?? '', type: line.type, amount: Number(line.amount), comments: line.comments }
      }),
    })
    navigate(`/${prefix}/incentives/${result.id}`)
  }

  if (user?.role !== 'HOD') return <p className="muted">Only an HOD can create a sale-based incentive request.</p>
  if (existing && !['Draft', 'Returned'].includes(existing.status)) return <p className="muted">This request is locked from HOD edits.</p>

  return (
    <div className="page-grid">
      <PageHeader title="New sale-based request" subtitle="Source money is Finance-verified and read-only." actions={<Link to={`/${prefix}/incentives`} className="ui-btn ui-btn-ghost">Back to my requests</Link>} />
      <Card title="Period and collection">
        <div className="form-grid">
          <Select label="Month" value={month} options={periodOptions()} onChange={setMonth} />
          <Select
            label="Department"
            value={department}
            options={departmentOptions(departments)}
            onChange={(name) => {
              setDepartment(name)
              setPaymentId('')
            }}
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <Select
              label="Verified sale / collection"
              value={paymentId}
              options={[{ value: '', label: 'Select verified collection' }, ...collections.map((row) => ({ value: row.pay.id, label: `${row.sale.project} — ${row.sale.client} (${money(row.pay.net)})` }))]}
              onChange={(id) => {
                setPaymentId(id)
                const next = collections.find((row) => row.pay.id === id)
                if (next) {
                  const team = saleTeam.filter((row) => row.saleId === next.sale.id)
                  setLines(team.length ? team.map((member) => ({ employeeId: member.employeeId, type: member.role === 'Closer' ? 'Closing' : 'Sales', amount: '', comments: '' })) : [{ ...emptyLine }])
                }
              }}
            />
          </div>
        </div>
      </Card>
      {selected ? (
        <Card title="Source collection (read-only)">
          <div className="readonly-grid">
            <div><span>Client</span><strong>{selected.sale.client}</strong></div>
            <div><span>Company</span><strong>{selected.sale.company}</strong></div>
            <div><span>Project</span><strong>{selected.sale.project}</strong></div>
            <div><span>Service</span><strong>{selected.sale.service}</strong></div>
            <div><span>Sale type</span><strong>{selected.sale.saleType}</strong></div>
            <div><span>Linked employees</span><strong>{suggested.map((row) => `${row.name} (${row.role})`).join(', ') || '—'}</strong></div>
            <div><span>Contract</span><strong>{money(selected.sale.contract)}</strong></div>
            <div><span>Collection</span><strong>{money(selected.pay.amount)}</strong></div>
            <div><span>Deductions</span><strong>{money(selected.sale.tax + selected.sale.other)}</strong></div>
            <div><span>Net collection</span><strong>{money(selected.sale.net)}</strong></div>
            <div><span>Payment date</span><strong>{selected.pay.date}</strong></div>
            <div><span>Collection status</span><strong>Verified by Finance</strong></div>
          </div>
        </Card>
      ) : null}
      <Card title="Employees for incentive" action={<Button type="button" variant="soft" onClick={() => setLines((prev) => [...prev, { ...emptyLine }])}>Add employee</Button>}>
        <div className="line-list">
          {lines.map((line, index) => {
            const emp = teamPool.find((item) => item.id === line.employeeId)
            return (
              <div className="line-row" key={`${line.employeeId}-${index}`}>
                <Select label="Employee" value={line.employeeId} options={[{ value: '', label: 'Select from master' }, ...teamPool.map((item) => ({ value: item.id, label: item.name }))]} onChange={(employeeId) => setLines((prev) => prev.map((item, i) => i === index ? { ...item, employeeId } : item))} />
                <label className="ui-field"><span>Designation</span><input value={emp?.designation ?? ''} readOnly /></label>
                <Select label="Incentive type" value={line.type} options={INCENTIVE_TYPES.map((type) => ({ value: type, label: type }))} onChange={(type) => setLines((prev) => prev.map((item, i) => i === index ? { ...item, type } : item))} />
                <label className="ui-field"><span>Amount</span><input type="number" min="1" value={line.amount} onChange={(e) => setLines((prev) => prev.map((item, i) => i === index ? { ...item, amount: e.target.value } : item))} /></label>
                <label className="ui-field"><span>Comments</span><input value={line.comments} onChange={(e) => setLines((prev) => prev.map((item, i) => i === index ? { ...item, comments: e.target.value } : item))} /></label>
                <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setLines((prev) => prev.filter((_, i) => i !== index || prev.length === 1))}>Remove</button>
              </div>
            )
          })}
        </div>
        <p className="kpi-value" style={{ fontSize: 20, marginTop: 12 }}>Total incentive {money(total)}</p>
      </Card>
      <Card title="Additional comments">
        <label className="ui-field"><span>Comments to Finance</span><input value={comments} onChange={(e) => setComments(e.target.value)} /></label>
        {error ? <p className="delta-down">{error}</p> : null}
        <div className="filter-row" style={{ marginTop: 16 }}>
          <Button type="button" variant="ghost" onClick={() => persist(false)}>Save Draft</Button>
          <Button type="button" onClick={() => persist(true)}>Submit to Finance</Button>
        </div>
      </Card>
    </div>
  )
}
