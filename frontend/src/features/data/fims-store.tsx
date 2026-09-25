import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  auditLogs as seedAudit,
  departments as seedDepartments,
  employees as seedEmployees,
  incentiveItems as seedItems,
  incentiveRequests as seedRequests,
  payments as seedPayments,
  saleEmployees as seedTeam,
  sales as seedSales,
} from '@/shared/data/seed'
import { DEMO_USERS, ROLE_HOME, ROLE_LABEL } from '@/shared/constants/roles'
import type { AuditRow, AuthUser, IncentiveItem, IncentiveRequest, RequestStatus } from '@/shared/types'

const KEY = 'fims.live.v3'

export type Employee = (typeof seedEmployees)[number]
export type Department = (typeof seedDepartments)[number]
export type Sale = (typeof seedSales)[number]
export type Payment = (typeof seedPayments)[number]
export type SaleMember = (typeof seedTeam)[number]
export type Batch = { id: string; month: string; total: number; status: 'Open' | 'Finalized' | 'Paid'; requestIds: string[] }
export type Notice = { id: string; title: string; body: string; to: string; at: string; read: boolean }
export type Designation = { id: string; name: string; status: 'Active' | 'Inactive' }
export type AppUser = AuthUser
export type IncentivePlan = {
  id: string
  name: string
  department: string
  saleType: string
  employeeRole: string
  basis: string
  rate: string
  minCollection: string
  maxIncentive: string
  from: string
  to: string
  status: 'Draft' | 'Active' | 'Inactive'
}

type SaveInput = {
  existingId?: string
  kind: 'SALE' | 'MANUAL'
  department: string
  departmentCode: string
  hod: string
  month: string
  type: string
  saleId: string
  paymentId: string
  comments: string
  actor: string
  submit: boolean
  lines: Array<{ employeeId: string; employee: string; designation: string; type: string; amount: number; comments: string }>
}

type State = {
  requests: IncentiveRequest[]
  items: IncentiveItem[]
  audit: AuditRow[]
  employees: Employee[]
  departments: Department[]
  sales: Sale[]
  payments: Payment[]
  saleTeam: SaleMember[]
  batches: Batch[]
  notices: Notice[]
  monthLocked: boolean
  designations: Designation[]
  users: AppUser[]
  plans: IncentivePlan[]
}

type FimsContextValue = State & {
  saveRequest: (input: SaveInput) => { id: string; status: RequestStatus }
  decide: (id: string, status: 'Approved' | 'Returned' | 'Rejected', actor: string, reason: string) => void
  upsertEmployee: (row: Employee, actor: string) => void
  upsertDepartment: (row: Department, actor: string) => void
  upsertSale: (row: Sale, team: SaleMember[], actor: string) => void
  addPayment: (row: Payment, actor: string) => void
  setPaymentStatus: (id: string, status: Payment['status'], actor: string) => void
  createBatch: (month: string, actor: string) => void
  finalizeBatch: (id: string, actor: string) => void
  markBatchPaid: (id: string, actor: string) => void
  setMonthLock: (locked: boolean, actor: string, reason: string) => void
  addAdjustment: (requestId: string, amount: number, reason: string, actor: string) => void
  markNoticeRead: (id: string) => void
  upsertDesignation: (row: Designation, actor: string) => void
  upsertUser: (row: AppUser, actor: string) => void
  upsertPlan: (row: IncentivePlan, actor: string) => void
}

const FimsContext = createContext<FimsContextValue | null>(null)

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

function toSeedRequests(): IncentiveRequest[] {
  return seedRequests.map((row) => ({
    id: row.id,
    kind: row.saleId === '—' ? 'MANUAL' : 'SALE',
    department: row.department,
    departmentCode: row.id.split('-')[1],
    hod: row.hod,
    month: row.month,
    submitted: row.submitted,
    total: row.total,
    status: row.status as RequestStatus,
    type: row.type,
    saleId: row.saleId,
    paymentId: row.saleId === 'SALE-2045' ? 'PAY-9001' : '',
    comments: '',
    reason: '',
  }))
}

function initial(): State {
  return {
    requests: toSeedRequests(),
    items: seedItems.map((row) => ({
      ...row,
      employeeId: seedEmployees.find((emp) => emp.name === row.employee)?.id ?? row.employee,
      designation: seedEmployees.find((emp) => emp.name === row.employee)?.designation ?? '',
      comments: '',
      status: row.status as RequestStatus,
    })),
    audit: seedAudit,
    employees: seedEmployees,
    departments: seedDepartments,
    sales: seedSales,
    payments: seedPayments,
    saleTeam: seedTeam,
    batches: [{ id: 'BATCH-2026-09', month: 'September 2026', total: 250, status: 'Open', requestIds: ['INC-CE-2026-0045'] }],
    notices: [
      { id: 'N-1', title: 'Request submitted', body: 'INC-CE-2026-0045 is with Finance.', to: 'FINANCE', at: '2026-10-01 14:20', read: false },
    ],
    monthLocked: false,
    designations: [
      { id: 'des-seller', name: 'Seller', status: 'Active' },
      { id: 'des-closer', name: 'Closer', status: 'Active' },
      { id: 'des-hod', name: 'HOD', status: 'Active' },
      { id: 'des-swe', name: 'Software Engineer', status: 'Active' },
      { id: 'des-it', name: 'IT Support', status: 'Active' },
      { id: 'des-seo', name: 'SEO Specialist', status: 'Active' },
      { id: 'des-disp', name: 'Dispatcher', status: 'Active' },
      { id: 'des-bill', name: 'Billing Specialist', status: 'Active' },
      { id: 'des-hw', name: 'Hardware Technician', status: 'Active' },
    ],
    users: DEMO_USERS,
    plans: [
      { id: 'plan-ce', name: 'CE collection (configure rates later)', department: 'Construction Estimation', saleType: 'New Client', employeeRole: 'Seller', basis: 'Net collected', rate: '', minCollection: '', maxIncentive: '', from: '2026-01-01', to: '', status: 'Draft' },
      { id: 'plan-mb', name: 'Medical Billing collection (configure rates later)', department: 'Medical Billing', saleType: 'Existing Client', employeeRole: 'Account Manager', basis: 'Net collected', rate: '', minCollection: '', maxIncentive: '', from: '2026-01-01', to: '', status: 'Draft' },
    ],
  }
}

function mergeById<T extends { id: string }>(saved: T[] | undefined, seed: T[]) {
  const current = saved ?? []
  const seen = new Set(current.map((row) => row.id))
  return [...current, ...seed.filter((row) => !seen.has(row.id))]
}

function loadState(): State {
  const raw = localStorage.getItem(KEY)
  if (!raw) return initial()
  try {
    const parsed = JSON.parse(raw) as Partial<State>
    const base = initial()
    return {
      ...base,
      ...parsed,
      designations: mergeById(parsed.designations, base.designations),
      users: mergeById(parsed.users, base.users),
      plans: mergeById(parsed.plans, base.plans),
      employees: mergeById(parsed.employees, base.employees),
      departments: mergeById(parsed.departments, base.departments).map((row) => ({ ...row, division: row.division || 'Operations' })),
      sales: (parsed.sales ?? base.sales).map((row) => ({ ...row, currency: row.currency || 'USD', invoice: row.invoice || row.contract })),
    }
  } catch {
    return initial()
  }
}

function nextId(requests: IncentiveRequest[], code: string, year: string) {
  const prefix = `INC-${code}-${year}-`
  const max = requests.filter((row) => row.id.startsWith(prefix)).map((row) => Number(row.id.slice(prefix.length))).reduce((best, n) => (Number.isFinite(n) && n > best ? n : best), 0)
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

function log(actor: string, action: string, entity: string, oldValue: string, newValue: string, reason: string): AuditRow {
  return { id: `AUD-${Date.now()}`, user: actor, action, entity, oldValue, newValue, at: nowStamp(), reason }
}

export function eligibleFrom(department: string, sales: Sale[], payments: Payment[]) {
  return payments
    .filter((pay) => pay.status === 'Verified' && pay.net > 0)
    .map((pay) => {
      const sale = sales.find((row) => row.id === pay.saleId)
      return sale ? { pay, sale } : null
    })
    .filter((row): row is { pay: Payment; sale: Sale } => !!row && row.sale.department === department)
}

export function FimsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadState)

  function commit(next: State) {
    localStorage.setItem(KEY, JSON.stringify(next))
    return next
  }

  const value = useMemo<FimsContextValue>(
    () => ({
      ...state,
      saveRequest(input) {
        if (state.monthLocked && input.submit) throw new Error('This month is locked. Finance must reopen it first.')
        const existing = input.existingId ? state.requests.find((row) => row.id === input.existingId) : undefined
        const id = existing?.id ?? nextId(state.requests, input.departmentCode, input.month.slice(-4))
        const status: RequestStatus = input.submit ? (existing?.status === 'Returned' ? 'Resubmitted' : 'Submitted') : 'Draft'
        setState((prev) => {
          const total = input.lines.reduce((sum, line) => sum + line.amount, 0)
          const request: IncentiveRequest = {
            id, kind: input.kind, department: input.department, departmentCode: input.departmentCode, hod: input.hod,
            month: input.month, submitted: input.submit ? nowStamp().slice(0, 10) : existing?.submitted ?? '',
            total, status, type: input.type, saleId: input.saleId, paymentId: input.paymentId, comments: input.comments, reason: existing?.reason ?? '',
          }
          const lines = input.lines.map((line) => ({
            requestId: id, employeeId: line.employeeId, employee: line.employee, designation: line.designation,
            department: input.departmentCode, hod: input.hod, type: line.type, amount: line.amount, status, month: input.month, comments: line.comments,
          }))
          const notices = input.submit
            ? [{ id: `N-${Date.now()}`, title: 'New incentive submitted', body: `${id} needs Finance review.`, to: 'FINANCE', at: nowStamp(), read: false }, ...prev.notices]
            : prev.notices
          return commit({
            ...prev,
            requests: [request, ...prev.requests.filter((row) => row.id !== id)],
            items: [...lines, ...prev.items.filter((row) => row.requestId !== id)],
            audit: [log(input.actor, input.submit ? 'Submitted request' : 'Saved draft', id, existing?.status ?? '—', status, input.comments || status), ...prev.audit],
            notices,
          })
        })
        return { id, status }
      },
      decide(id, status, actor, reason) {
        setState((prev) => {
          const current = prev.requests.find((row) => row.id === id)
          if (!current) return prev
          const noticeTo = status === 'Returned' ? current.hod : 'HOD'
          return commit({
            ...prev,
            requests: prev.requests.map((row) => (row.id === id ? { ...row, status, reason } : row)),
            items: prev.items.map((row) => (row.requestId === id ? { ...row, status } : row)),
            audit: [log(actor, `${status} request`, id, current.status, status, reason), ...prev.audit],
            notices: [{ id: `N-${Date.now()}`, title: `Request ${status}`, body: `${id} is now ${status}.`, to: noticeTo, at: nowStamp(), read: false }, ...prev.notices],
          })
        })
      },
      upsertEmployee(row, actor) {
        setState((prev) => commit({
          ...prev,
          employees: [row, ...prev.employees.filter((item) => item.id !== row.id)],
          audit: [log(actor, 'Saved employee', row.id, '', row.status, 'Employee master update'), ...prev.audit],
        }))
      },
      upsertDepartment(row, actor) {
        setState((prev) => commit({
          ...prev,
          departments: [row, ...prev.departments.filter((item) => item.id !== row.id)],
          audit: [log(actor, 'Saved department', row.id, '', row.status, 'Department update'), ...prev.audit],
        }))
      },
      upsertSale(row, team, actor) {
        if (state.monthLocked) throw new Error('Month is locked.')
        setState((prev) => commit({
          ...prev,
          sales: [row, ...prev.sales.filter((item) => item.id !== row.id)],
          saleTeam: [...team, ...prev.saleTeam.filter((item) => item.saleId !== row.id)],
          audit: [log(actor, 'Saved sale', row.id, '', row.status, row.project), ...prev.audit],
        }))
      },
      addPayment(row, actor) {
        if (state.monthLocked) throw new Error('Month is locked.')
        setState((prev) => {
          const payments = [row, ...prev.payments]
          const collected = payments.filter((item) => item.saleId === row.saleId).reduce((sum, item) => sum + item.amount, 0)
          return commit({
            ...prev,
            payments,
            sales: prev.sales.map((sale) => sale.id === row.saleId ? { ...sale, collected, net: Number((collected - sale.tax - sale.other).toFixed(2)) } : sale),
            audit: [log(actor, 'Added payment', row.id, '', row.status, row.reference), ...prev.audit],
          })
        })
      },
      setPaymentStatus(id, status, actor) {
        setState((prev) => {
          const current = prev.payments.find((row) => row.id === id)
          if (!current) return prev
          const payments = prev.payments.map((row) => (row.id === id ? { ...row, status } : row))
          const salePays = payments.filter((row) => row.saleId === current.saleId)
          const saleStatus = salePays.some((row) => row.status === 'Verified') ? 'Verified' : salePays[0]?.status ?? 'Pending'
          return commit({
            ...prev,
            payments,
            sales: prev.sales.map((sale) => sale.id === current.saleId ? { ...sale, status: saleStatus } : sale),
            audit: [log(actor, 'Payment status', id, current.status, status, 'Collection update'), ...prev.audit],
          })
        })
      },
      createBatch(month, actor) {
        const approved = state.requests.filter((row) => row.status === 'Approved' && row.month === month)
        const id = `BATCH-${month.slice(-4)}-${String(state.batches.length + 1).padStart(2, '0')}`
        setState((prev) => commit({
          ...prev,
          batches: [{ id, month, total: approved.reduce((sum, row) => sum + row.total, 0), status: 'Open', requestIds: approved.map((row) => row.id) }, ...prev.batches],
          requests: prev.requests.map((row) => approved.some((item) => item.id === row.id) ? { ...row, status: 'Ready for Payment' as RequestStatus } : row),
          items: prev.items.map((row) => approved.some((item) => item.id === row.requestId) ? { ...row, status: 'Ready for Payment' as RequestStatus } : row),
          audit: [log(actor, 'Created batch', id, 'Approved', 'Ready for Payment', month), ...prev.audit],
        }))
      },
      finalizeBatch(id, actor) {
        setState((prev) => commit({
          ...prev,
          batches: prev.batches.map((row) => row.id === id ? { ...row, status: 'Finalized' } : row),
          audit: [log(actor, 'Finalized batch', id, 'Open', 'Finalized', 'Locked from normal edit'), ...prev.audit],
        }))
      },
      markBatchPaid(id, actor) {
        setState((prev) => {
          const batch = prev.batches.find((row) => row.id === id)
          if (!batch) return prev
          return commit({
            ...prev,
            batches: prev.batches.map((row) => row.id === id ? { ...row, status: 'Paid' } : row),
            requests: prev.requests.map((row) => batch.requestIds.includes(row.id) ? { ...row, status: 'Paid' as RequestStatus } : row),
            items: prev.items.map((row) => batch.requestIds.includes(row.requestId) ? { ...row, status: 'Paid' as RequestStatus } : row),
            audit: [log(actor, 'Marked batch paid', id, batch.status, 'Paid', 'Payroll processed'), ...prev.audit],
            notices: [{ id: `N-${Date.now()}`, title: 'Batch paid', body: `${id} is Paid.`, to: 'ALL', at: nowStamp(), read: false }, ...prev.notices],
          })
        })
      },
      setMonthLock(locked, actor, reason) {
        setState((prev) => commit({
          ...prev,
          monthLocked: locked,
          audit: [log(actor, locked ? 'Locked month' : 'Reopened month', 'September 2026', String(prev.monthLocked), String(locked), reason), ...prev.audit],
        }))
      },
      addAdjustment(requestId, amount, reason, actor) {
        setState((prev) => {
          const request = prev.requests.find((row) => row.id === requestId)
          if (!request) return prev
          const item: IncentiveItem = {
            requestId, employeeId: 'ADJ', employee: 'Adjustment', designation: '—', department: request.departmentCode,
            hod: request.hod, type: 'Adjustment', amount, status: request.status, month: request.month, comments: reason,
          }
          return commit({
            ...prev,
            items: [item, ...prev.items],
            requests: prev.requests.map((row) => row.id === requestId ? { ...row, total: row.total + amount } : row),
            audit: [log(actor, 'Adjustment', requestId, String(request.total), String(request.total + amount), reason), ...prev.audit],
          })
        })
      },
      markNoticeRead(id) {
        setState((prev) => commit({ ...prev, notices: prev.notices.map((row) => row.id === id ? { ...row, read: true } : row) }))
      },
      upsertDesignation(row, actor) {
        setState((prev) => commit({
          ...prev,
          designations: [row, ...prev.designations.filter((item) => item.id !== row.id)],
          audit: [log(actor, 'Saved designation', row.id, '', row.status, row.name), ...prev.audit],
        }))
      },
      upsertUser(row, actor) {
        setState((prev) => commit({
          ...prev,
          users: [row, ...prev.users.filter((item) => item.id !== row.id)],
          audit: [log(actor, 'Saved user', row.id, '', row.role, row.email), ...prev.audit],
        }))
      },
      upsertPlan(row, actor) {
        setState((prev) => commit({
          ...prev,
          plans: [row, ...prev.plans.filter((item) => item.id !== row.id)],
          audit: [log(actor, 'Saved incentive plan', row.id, '', row.status, row.name), ...prev.audit],
        }))
      },
    }),
    [state],
  )

  return <FimsContext.Provider value={value}>{children}</FimsContext.Provider>
}

export function useFims() {
  const ctx = useContext(FimsContext)
  if (!ctx) throw new Error('useFims must be used inside FimsProvider')
  return ctx
}

export function countStatus(requests: IncentiveRequest[], status: RequestStatus | RequestStatus[]) {
  const list = Array.isArray(status) ? status : [status]
  return requests.filter((row) => list.includes(row.status)).length
}

export function deptCode(name: string, departments: Department[]) {
  return departments.find((row) => row.name === name)?.code ?? 'XX'
}

export function makeUser(partial: Partial<AppUser> & Pick<AppUser, 'name' | 'email' | 'role'>): AppUser {
  return {
    id: partial.id ?? `u-${Date.now()}`,
    name: partial.name,
    email: partial.email,
    role: partial.role,
    departmentIds: partial.departmentIds ?? [],
    departmentNames: partial.departmentNames ?? [],
    homePath: ROLE_HOME[partial.role],
    title: partial.title ?? ROLE_LABEL[partial.role],
  }
}

