import type { ReactNode } from 'react'

export type Role =
  | 'SUPER_ADMIN'
  | 'HR'
  | 'HOD'
  | 'FINANCE_USER'
  | 'FINANCE_MANAGER'
  | 'EXECUTIVE'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  departmentIds: string[]
  departmentNames: string[]
  homePath: string
  title: string
}

export type KpiTone = 'green' | 'purple' | 'rose' | 'amber' | 'blue' | 'dark'

export type TableColumn<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
}

export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Finance Review'
  | 'Returned'
  | 'Resubmitted'
  | 'Approved'
  | 'Ready for Payment'
  | 'Paid'
  | 'Rejected'
  | 'Cancelled'

export type IncentiveRequest = {
  id: string
  kind: 'SALE' | 'MANUAL'
  department: string
  departmentCode: string
  hod: string
  month: string
  submitted: string
  total: number
  status: RequestStatus
  type: string
  saleId: string
  paymentId: string
  comments: string
  reason: string
}

export type IncentiveItem = {
  requestId: string
  employeeId: string
  employee: string
  designation: string
  department: string
  hod: string
  type: string
  amount: number
  status: RequestStatus
  month: string
  comments: string
}

export type AuditRow = {
  id: string
  user: string
  action: string
  entity: string
  oldValue: string
  newValue: string
  at: string
  reason: string
}

export type ReportId =
  | 'incentive-register'
  | 'employee-history'
  | 'department-summary'
  | 'hod-submissions'
  | 'payment-report'
  | 'employees-by-department'
  | 'employees-by-status'
  | 'eligibility-list'
  | 'joining-list'
