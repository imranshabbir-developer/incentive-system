import { useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { useFims, type Payment, type Sale } from '@/features/data/fims-store'
import { CURRENCIES, departmentOptions, LOCATIONS, PAYMENT_METHODS, PAYMENT_STATUSES } from '@/shared/data/seed'
import { Select } from '@/shared/ui/Select'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { Modal } from '@/shared/ui/Modal'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { downloadCsv } from '@/shared/utils/csv'
import { money } from '@/shared/utils/money'

export function SalesWorkspace() {
  const { user } = useAuth()
  const { sales, payments, employees, departments, saleTeam, upsertSale, addPayment, setPaymentStatus, monthLocked } = useFims()
  const canWrite = user?.role === 'FINANCE_USER' || user?.role === 'FINANCE_MANAGER' || user?.role === 'SUPER_ADMIN'
  const [saleOpen, setSaleOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [payOpen, setPayOpen] = useState<string | null>(null)
  const [detail, setDetail] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string[][]>([])
  const [sale, setSale] = useState<Sale>({
    id: `SALE-${2000 + sales.length + 1}`, date: '2026-09-25', client: '', company: '', project: '', service: '',
    saleType: 'New Client', location: '', currency: 'USD', contract: 0, invoice: 0, collected: 0, net: 0, status: 'Pending', department: 'Construction Estimation', tax: 0, other: 0,
  })
  const [filterDept, setFilterDept] = useState('All')
  const [seller, setSeller] = useState('EMP-1001')
  const [closer, setCloser] = useState('EMP-1002')
  const [manager, setManager] = useState('EMP-1002')
  const shownSales = filterDept === 'All' ? sales : sales.filter((row) => row.department === filterDept)
  const shownPays = filterDept === 'All' ? payments : payments.filter((row) => shownSales.some((sale) => sale.id === row.saleId))
  const teamPool = employees.filter((row) => row.status === 'Active' && (row.department === sale.department || !sale.department))
  const [payment, setPayment] = useState<Payment>({ id: '', saleId: '', amount: 0, date: '2026-09-25', method: 'Zelle', status: 'Received', fee: 0, net: 0, reference: '' })

  function saveSale() {
    try {
      const team = [
        { saleId: sale.id, employeeId: seller, name: employees.find((row) => row.id === seller)?.name ?? seller, role: 'Seller' },
        { saleId: sale.id, employeeId: closer, name: employees.find((row) => row.id === closer)?.name ?? closer, role: 'Closer' },
        { saleId: sale.id, employeeId: manager, name: employees.find((row) => row.id === manager)?.name ?? manager, role: 'Account Manager' },
      ]
      upsertSale({ ...sale, net: Number((sale.collected - sale.tax - sale.other).toFixed(2)) }, team, user!.name)
      setSaleOpen(false)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save sale')
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Sales / Collections"
        subtitle="Client money only. Payments are a list. No card number, CVV, expiry or billing ZIP."
        actions={
          <div className="filter-row">
            {canWrite ? <Button disabled={monthLocked} onClick={() => setSaleOpen(true)}>Create sale</Button> : null}
            {canWrite ? <Button variant="soft" disabled={monthLocked} onClick={() => setImportOpen(true)}>Import Excel</Button> : null}
            <Button variant="ghost" onClick={() => downloadCsv('sales.csv', sales.map((row) => ({ ...row })))}>Export to Excel</Button>
          </div>
        }
      />
      {monthLocked ? <p className="delta-down">September is locked. Reopen it in Settings before editing collections.</p> : null}
      {error ? <p className="delta-down">{error}</p> : null}
      <Select label="Department" value={filterDept} options={departmentOptions(departments, { value: 'All', label: 'All departments' })} onChange={setFilterDept} />
      <Card title="Sales">
        <DataTable
          rows={shownSales}
          rowKey={(row) => row.id}
          columns={[
            { key: 'id', label: 'Sale ID' },
            { key: 'project', label: 'Project' },
            { key: 'client', label: 'Client' },
            { key: 'department', label: 'Department' },
            { key: 'saleType', label: 'Sale type' },
            { key: 'contract', label: 'Contract', render: (row) => money(row.contract) },
            { key: 'net', label: 'Net collected', render: (row) => money(row.net) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'open', label: '', render: (row) => <Button variant="ghost" onClick={() => setDetail(row.id)}>Open</Button> },
          ]}
        />
      </Card>
      <Card title="Collection payments">
        <DataTable
          rows={shownPays}
          rowKey={(row) => row.id}
          columns={[
            { key: 'id', label: 'Payment ID' },
            { key: 'saleId', label: 'Sale' },
            { key: 'amount', label: 'Amount', render: (row) => money(row.amount) },
            { key: 'method', label: 'Method' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'reference', label: 'Reference' },
            {
              key: 'act',
              label: '',
              render: (row) => canWrite ? <Button variant="soft" disabled={monthLocked} onClick={() => setPaymentStatus(row.id, 'Verified', user!.name)}>Verify</Button> : <span />,
            },
          ]}
        />
      </Card>
      {detail ? (
        <Card title={`Sale ${detail}`} action={canWrite ? <Button variant="ghost" onClick={() => { setPayment({ ...payment, id: `PAY-${9000 + payments.length + 1}`, saleId: detail }); setPayOpen(detail) }}>Add payment</Button> : null}>
          {sales.filter((row) => row.id === detail).map((row) => (
            <div className="readonly-grid" key={row.id}>
              <div><span>Client</span><strong>{row.client}</strong></div>
              <div><span>Company</span><strong>{row.company}</strong></div>
              <div><span>Project</span><strong>{row.project}</strong></div>
              <div><span>Service</span><strong>{row.service}</strong></div>
              <div><span>Sale type</span><strong>{row.saleType}</strong></div>
              <div><span>Currency</span><strong>{row.currency}</strong></div>
              <div><span>Contract</span><strong>{money(row.contract)}</strong></div>
              <div><span>Invoice</span><strong>{money(row.invoice)}</strong></div>
              <div><span>Collected</span><strong>{money(row.collected)}</strong></div>
              <div><span>Tax / other</span><strong>{money(row.tax + row.other)}</strong></div>
              <div><span>Net collected</span><strong>{money(row.net)}</strong></div>
              <div><span>Uncollected</span><strong>{money(Math.max(row.invoice - row.collected, 0))}</strong></div>
            </div>
          ))}
          <p className="muted" style={{ marginTop: 12 }}>Team: {saleTeam.filter((row) => row.saleId === detail).map((row) => `${row.name} (${row.role})`).join(', ') || '—'}</p>
        </Card>
      ) : null}

      {saleOpen ? (
        <Modal title="Create sale" onClose={() => setSaleOpen(false)} actions={<Button onClick={saveSale}>Save sale</Button>}>
          <div className="form-grid">
            <label className="ui-field"><span>Sale ID</span><input value={sale.id} readOnly /></label>
            <label className="ui-field"><span>Date</span><input type="date" value={sale.date} onChange={(e) => setSale({ ...sale, date: e.target.value })} /></label>
            <label className="ui-field"><span>Client</span><input value={sale.client} onChange={(e) => setSale({ ...sale, client: e.target.value })} /></label>
            <label className="ui-field"><span>Company</span><input value={sale.company} onChange={(e) => setSale({ ...sale, company: e.target.value })} /></label>
            <label className="ui-field"><span>Project</span><input value={sale.project} onChange={(e) => setSale({ ...sale, project: e.target.value })} /></label>
            <label className="ui-field"><span>Service</span><input value={sale.service} onChange={(e) => setSale({ ...sale, service: e.target.value })} /></label>
            <Select label="Department" value={sale.department} options={departmentOptions(departments)} onChange={(department) => setSale({ ...sale, department })} />
            <Select label="Sale type" value={sale.saleType} options={[{ value: 'New Client', label: 'New Client' }, { value: 'Existing Client', label: 'Existing Client' }]} onChange={(saleType) => setSale({ ...sale, saleType })} />
            <Select label="Location" value={sale.location} options={[{ value: '', label: 'Select location' }, ...LOCATIONS.map((v) => ({ value: v, label: v }))]} onChange={(location) => setSale({ ...sale, location })} />
            <Select label="Currency" value={sale.currency} options={CURRENCIES.map((v) => ({ value: v, label: v }))} onChange={(currency) => setSale({ ...sale, currency })} />
            <label className="ui-field"><span>Contract</span><input type="number" value={sale.contract} onChange={(e) => setSale({ ...sale, contract: Number(e.target.value) })} /></label>
            <label className="ui-field"><span>Invoice amount</span><input type="number" value={sale.invoice} onChange={(e) => setSale({ ...sale, invoice: Number(e.target.value) })} /></label>
            <label className="ui-field"><span>Tax / other charges</span><input type="number" value={sale.tax} onChange={(e) => setSale({ ...sale, tax: Number(e.target.value) })} /></label>
            <label className="ui-field"><span>Other deductions</span><input type="number" value={sale.other} onChange={(e) => setSale({ ...sale, other: Number(e.target.value) })} /></label>
            <Select label="Seller" value={seller} options={teamPool.map((row) => ({ value: row.id, label: `${row.name} · ${row.department}` }))} onChange={setSeller} />
            <Select label="Closer" value={closer} options={teamPool.map((row) => ({ value: row.id, label: `${row.name} · ${row.department}` }))} onChange={setCloser} />
            <Select label="Account manager" value={manager} options={teamPool.map((row) => ({ value: row.id, label: `${row.name} · ${row.department}` }))} onChange={setManager} />
          </div>
        </Modal>
      ) : null}

      {importOpen ? (
        <Modal
          title="Import sales (column mapper)"
          onClose={() => { setImportOpen(false); setPreview([]) }}
          actions={
            <Button
              onClick={() => {
                preview.slice(1).forEach((cols, index) => {
                  const id = `SALE-IMP-${Date.now()}-${index}`
                  upsertSale({
                    id, date: cols[0] || '2026-09-25', client: cols[1] || 'Imported client', company: cols[2] || '',
                    project: cols[3] || `Imported ${index + 1}`, service: cols[4] || '', saleType: cols[5] === 'Existing Client' ? 'Existing Client' : 'New Client',
                    location: cols[6] || '', currency: 'USD', contract: Number(cols[7]) || 0, invoice: Number(cols[8]) || Number(cols[7]) || 0,
                    collected: 0, net: 0, status: 'Pending', department: cols[9] || 'Construction Estimation', tax: 0, other: 0,
                  }, [], user!.name)
                })
                setImportOpen(false)
                setPreview([])
              }}
            >
              Commit preview
            </Button>
          }
        >
          <p className="muted">Expected first row headers, then: Date, Client, Company, Project, Service, Sale Type, Location, Contract, Invoice, Department. Final Excel layout is still a client item — this is a mapper, not a locked sheet.</p>
          <label className="ui-field" style={{ marginTop: 12 }}>
            <span>CSV file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  const text = String(reader.result ?? '')
                  setPreview(text.split(/\r?\n/).filter(Boolean).map((line) => line.split(',').map((cell) => cell.trim())))
                }
                reader.readAsText(file)
              }}
            />
          </label>
          {preview.length ? <p className="tiny" style={{ marginTop: 12 }}>{preview.length - 1} data rows ready.</p> : null}
        </Modal>
      ) : null}

      {payOpen ? (
        <Modal title="Add payment" onClose={() => setPayOpen(null)} actions={<Button onClick={() => { addPayment({ ...payment, net: payment.amount - payment.fee }, user!.name); setPayOpen(null) }}>Save payment</Button>}>
          <div className="form-grid">
            <label className="ui-field"><span>Payment ID</span><input value={payment.id} readOnly /></label>
            <label className="ui-field"><span>Amount</span><input type="number" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: Number(e.target.value) })} /></label>
            <label className="ui-field"><span>Date</span><input type="date" value={payment.date} onChange={(e) => setPayment({ ...payment, date: e.target.value })} /></label>
            <Select label="Method" value={payment.method} options={PAYMENT_METHODS.map((v) => ({ value: v, label: v }))} onChange={(method) => setPayment({ ...payment, method })} />
            <Select label="Status" value={payment.status} options={PAYMENT_STATUSES.map((v) => ({ value: v, label: v }))} onChange={(status) => setPayment({ ...payment, status })} />
            <label className="ui-field"><span>Fee</span><input type="number" value={payment.fee} onChange={(e) => setPayment({ ...payment, fee: Number(e.target.value) })} /></label>
            <label className="ui-field"><span>Reference</span><input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} /></label>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
