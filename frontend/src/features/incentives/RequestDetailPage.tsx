import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { useFims } from '@/features/data/fims-store'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import { money } from '@/shared/utils/money'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { Modal } from '@/shared/ui/Modal'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'

const financeRoles = ['FINANCE_USER', 'FINANCE_MANAGER', 'SUPER_ADMIN']

export function RequestDetailPage() {
  const { requestId } = useParams()
  const { user } = useAuth()
  const { requests, items, sales, payments, employees, decide, addAdjustment } = useFims()
  const prefix = ROLE_PREFIX[user!.role]
  const request = requests.find((row) => row.id === requestId)
  const lines = items.filter((row) => row.requestId === requestId)
  const sale = sales.find((row) => row.id === request?.saleId)
  const payment = payments.find((row) => row.id === request?.paymentId)
  const [modal, setModal] = useState<'Returned' | 'Rejected' | 'Adjust' | null>(null)
  const [reason, setReason] = useState('')
  const [adjust, setAdjust] = useState('0')
  const canDecide = !!user && financeRoles.includes(user.role) && request && ['Submitted', 'Resubmitted', 'Under Finance Review'].includes(request.status)
  const canEdit = user?.role === 'HOD' && request && ['Draft', 'Returned'].includes(request.status)
  const canAdjust = !!user && (user.role === 'FINANCE_MANAGER' || user.role === 'SUPER_ADMIN') && request && ['Approved', 'Ready for Payment'].includes(request.status)

  if (!request) return <p className="muted">Request not found.</p>

  const saleBased = request.kind === 'SALE'
  const linePeople = lines.map((line) => employees.find((row) => row.id === line.employeeId || row.name === line.employee))
  const duplicate = lines.some((line) => items.some((row) => {
    if (row.requestId === request.id || ['Rejected', 'Cancelled'].includes(row.status)) return false
    const other = requests.find((item) => item.id === row.requestId)
    return `${other?.saleId ?? ''}|${other?.paymentId ?? ''}|${row.employeeId}|${row.type}` === `${request.saleId}|${request.paymentId}|${line.employeeId}|${line.type}`
  }))
  const checks = [
    { label: 'Employee exists', ok: linePeople.length > 0 && linePeople.every(Boolean), skip: false },
    { label: 'Employee active / eligible', ok: linePeople.every((emp) => !!emp && emp.status === 'Active' && emp.eligible === 'Yes'), skip: false },
    { label: 'Sale exists', ok: !!sale, skip: !saleBased },
    { label: 'Payment is Verified', ok: payment?.status === 'Verified', skip: !saleBased },
    { label: 'Net collection > 0', ok: (sale?.net ?? 0) > 0, skip: !saleBased },
    { label: 'Applicable plan or permitted manual process', ok: true, skip: false },
    { label: 'No duplicate Sale + Payment + Employee + Type', ok: !duplicate, skip: false },
    { label: 'Correct department', ok: linePeople.every((emp) => !emp || emp.department === request.department), skip: false },
    { label: 'Correct period', ok: !!request.month, skip: false },
  ]

  return (
    <div className="page-grid">
      <PageHeader
        title={request.id}
        subtitle={`${request.kind === 'SALE' ? 'Sale-based' : 'Manual / Special'} · ${request.department}`}
        actions={
          <div className="filter-row">
            {canEdit && request.kind === 'SALE' ? <Link className="ui-btn ui-btn-primary" to={`/${prefix}/incentives/${request.id}/edit`}>Continue editing</Link> : null}
            {canAdjust ? <Button variant="ghost" onClick={() => setModal('Adjust')}>Add adjustment</Button> : null}
            <Link className="ui-btn ui-btn-ghost" to={`/${prefix}/incentives`}>Back</Link>
          </div>
        }
      />
      <Card title="Request">
        <div className="readonly-grid">
          <div><span>Submitted by</span><strong>{request.hod}</strong></div>
          <div><span>Submission date</span><strong>{request.submitted || '—'}</strong></div>
          <div><span>Department</span><strong>{request.department}</strong></div>
          <div><span>Month</span><strong>{request.month}</strong></div>
          <div><span>Total incentive</span><strong>{money(request.total)}</strong></div>
          <div><span>Status</span><StatusBadge value={request.status} /></div>
        </div>
      </Card>
      {sale && payment ? (
        <Card title="Verified collection">
          <div className="readonly-grid">
            <div><span>Client</span><strong>{sale.client}</strong></div>
            <div><span>Project</span><strong>{sale.project}</strong></div>
            <div><span>Collection</span><strong>{money(payment.amount)}</strong></div>
            <div><span>Net collection</span><strong>{money(sale.net)}</strong></div>
            <div><span>Payment</span><strong>{payment.id} · {payment.status}</strong></div>
          </div>
        </Card>
      ) : <Card title="Manual / Special"><p className="muted">{request.comments || 'No sale is linked.'}</p></Card>}
      <Card title="Employee incentive items">
        <DataTable
          rows={lines}
          rowKey={(row) => row.requestId + row.employeeId + row.type + row.comments}
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'designation', label: 'Designation' },
            { key: 'type', label: 'Type' },
            { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
            { key: 'comments', label: 'Comments' },
          ]}
        />
      </Card>
      <Card title="Finance checklist">
        <DataTable
          rows={checks.map((row, index) => ({ id: String(index), ...row }))}
          rowKey={(row) => row.id}
          columns={[
            { key: 'label', label: 'Check' },
            { key: 'ok', label: 'Result', render: (row) => <StatusBadge value={row.skip ? 'N/A' : row.ok ? 'Pass' : 'Fail'} /> },
          ]}
        />
      </Card>
      {canDecide ? (
        <Card title="Finance decision">
          <div className="filter-row">
            <Button type="button" onClick={() => decide(request.id, 'Approved', user!.name, 'Approved for payroll')}>Approve</Button>
            <Button type="button" variant="ghost" onClick={() => setModal('Returned')}>Return to HOD</Button>
            <Button type="button" variant="dark" onClick={() => setModal('Rejected')}>Reject</Button>
          </div>
        </Card>
      ) : null}
      {request.reason ? <p className="muted">Last reason: {request.reason}</p> : null}
      {modal === 'Returned' || modal === 'Rejected' ? (
        <Modal
          title={`${modal} request`}
          onClose={() => setModal(null)}
          actions={<Button onClick={() => { if (!reason.trim()) return; decide(request.id, modal, user!.name, reason); setModal(null); setReason('') }}>Confirm</Button>}
        >
          <label className="ui-field"><span>Reason (required)</span><input value={reason} onChange={(e) => setReason(e.target.value)} /></label>
        </Modal>
      ) : null}
      {modal === 'Adjust' ? (
        <Modal
          title="Adjustment (does not overwrite the original)"
          onClose={() => setModal(null)}
          actions={<Button onClick={() => { if (!reason.trim() || !Number(adjust)) return; addAdjustment(request.id, Number(adjust), reason, user!.name); setModal(null) }}>Save adjustment</Button>}
        >
          <div className="form-grid">
            <label className="ui-field"><span>Amount (+ or -)</span><input type="number" value={adjust} onChange={(e) => setAdjust(e.target.value)} /></label>
            <label className="ui-field"><span>Reason</span><input value={reason} onChange={(e) => setReason(e.target.value)} /></label>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
