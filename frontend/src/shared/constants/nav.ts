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
  | 'notifications'
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
  notifications: 'Notifications',
  settings: 'Settings',
  audit: 'Audit',
}

const byRole: Record<Role, NavKey[]> = {
  SUPER_ADMIN: ['dashboard', 'users', 'employees', 'departments', 'designations', 'plans', 'sales', 'incentives', 'approvals', 'extra-approvals', 'payroll', 'reports', 'notifications', 'settings', 'audit'],
  HR: ['dashboard', 'employees', 'departments', 'reports', 'notifications'],
  HOD: ['dashboard', 'employees', 'incentives', 'reports', 'notifications'],
  FINANCE_USER: ['dashboard', 'sales', 'incentives', 'approvals', 'payroll', 'reports', 'notifications'],
  FINANCE_MANAGER: ['dashboard', 'sales', 'incentives', 'approvals', 'extra-approvals', 'payroll', 'reports', 'notifications', 'settings', 'audit'],
  EXECUTIVE: ['dashboard', 'sales', 'incentives', 'approvals', 'extra-approvals', 'payroll', 'reports', 'notifications'],
}

export function navFor(role: Role, prefix: string): NavItem[] {
  return byRole[role].map((key) => ({
    key,
    label: all[key],
    path: `/${prefix}/${key}`,
  }))
}
