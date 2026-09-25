import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { deptCode, useFims } from '@/features/data/fims-store'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import { departmentOptions, INCENTIVE_TYPES, periodOptions } from '@/shared/data/seed'
import { money } from '@/shared/utils/money'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Select'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'

export function ManualRequestPage() {
  const { user } = useAuth()
  const { employees, departments, saveRequest } = useFims()
  const navigate = useNavigate()
  const prefix = ROLE_PREFIX[user!.role]
  const [department, setDepartment] = useState(user?.departmentNames[0] ?? 'Construction Estimation')
  const pool = employees.filter((emp) => emp.eligible === 'Yes' && emp.status !== 'Inactive' && emp.department === department)
  const [month, setMonth] = useState('September 2026')
  const [employeeId, setEmployeeId] = useState('')
  const [type, setType] = useState('Special')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [comments, setComments] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')

  if (user?.role !== 'HOD') return <p className="muted">Only an HOD can create a manual / special request.</p>

  const emp = pool.find((item) => item.id === employeeId)

  function persist(submit: boolean) {
    setError('')
    if (!employeeId || !Number(amount) || !reason || !comments || !fileName) {
      setError('Employee, amount, reason, comments and attachment are required.')
      return
    }
    const result = saveRequest({
      kind: 'MANUAL',
      department,
      departmentCode: deptCode(department, departments),
      hod: user!.name,
      month,
      type,
      saleId: '—',
      paymentId: '',
      comments: `${reason}. ${comments}`,
      actor: user!.name,
      submit,
      lines: [{
        employeeId,
        employee: emp?.name ?? employeeId,
        designation: emp?.designation ?? '',
        type,
        amount: Number(amount),
        comments,
      }],
    })
    navigate(`/${prefix}/incentives/${result.id}`)
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="New Manual / Special request"
        subtitle="Use this when there is no verified sale — Software, IT, bonus or special incentive."
        actions={<Link to={`/${prefix}/incentives`} className="ui-btn ui-btn-ghost">Back</Link>}
      />
      <Card>
        <div className="form-grid">
          <Select label="Month" value={month} options={periodOptions()} onChange={setMonth} />
          <Select
            label="Department"
            value={department}
            options={departmentOptions(departments)}
            onChange={(name) => {
              setDepartment(name)
              setEmployeeId('')
            }}
          />
          <Select label="Employee" value={employeeId} options={[{ value: '', label: 'Select from master' }, ...pool.map((item) => ({ value: item.id, label: item.name }))]} onChange={setEmployeeId} />
          <Select label="Incentive type" value={type} options={INCENTIVE_TYPES.map((item) => ({ value: item, label: item }))} onChange={setType} />
          <label className="ui-field"><span>Amount</span>
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="ui-field"><span>Reason</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <label className="ui-field" style={{ gridColumn: '1 / -1' }}><span>Comments</span>
            <input value={comments} onChange={(e) => setComments(e.target.value)} />
          </label>
          <label className="ui-field"><span>Attachment</span>
            <input type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
          </label>
        </div>
        <p className="muted">Total {money(Number(amount) || 0)}</p>
        {error ? <p className="delta-down">{error}</p> : null}
        <div className="filter-row" style={{ marginTop: 16 }}>
          <Button type="button" variant="ghost" onClick={() => persist(false)}>Save Draft</Button>
          <Button type="button" onClick={() => persist(true)}>Submit to Finance</Button>
        </div>
      </Card>
    </div>
  )
}
