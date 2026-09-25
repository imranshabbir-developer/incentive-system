import type { Role } from '@/shared/types'

export type NavKey =
  | 'dashboard'
  | 'employees'
  | 'departments'
  | 'designations'
  | 'users'
  | 'plans'
  | 'sales'
  | 'incentives'
  | 'approvals'
  | 'extra-approvals'
  | 'payroll'
  | 'reports'
  | 'settings'
  | 'audit'

export type NavItem = {
  key: NavKey
  label: string
  path: string
}

const all: Record<NavKey, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  departments: 'Departments',
  designations: 'Designations',
  users: 'Users',
  plans: 'Incentive Plans',
  sales: 'Sales / Collections',
  incentives: 'Incentive Requests',
  approvals: 'Approvals',
  'extra-approvals': 'Extra Approvals',
  payroll: 'Payroll',
  reports: 'Reports',
  settings: 'Settings',
  audit: 'Audit',
}

const byRole: Record<Role, NavKey[]> = {
  SUPER_ADMIN: ['dashboard', 'users', 'employees', 'departments', 'designations', 'plans', 'sales', 'incentives', 'approvals', 'extra-approvals', 'payroll', 'reports', 'settings', 'audit'],
  HR: ['dashboard', 'employees', 'reports'],
  HOD: ['dashboard', 'employees', 'incentives', 'reports'],
  FINANCE_USER: ['dashboard', 'sales', 'incentives', 'approvals', 'payroll', 'reports'],
  FINANCE_MANAGER: ['dashboard', 'sales', 'incentives', 'approvals', 'extra-approvals', 'payroll', 'reports', 'settings', 'audit'],
  EXECUTIVE: ['dashboard', 'approvals', 'extra-approvals', 'reports'],
}

export function navFor(role: Role, prefix: string): NavItem[] {
  return byRole[role].map((key) => ({
    key,
    label: all[key],
    path: `/${prefix}/${key}`,
  }))
}
