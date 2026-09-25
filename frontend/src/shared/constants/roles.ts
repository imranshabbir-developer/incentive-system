import type { AuthUser, Role } from '@/shared/types'

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  HR: 'HR',
  HOD: 'HOD',
  FINANCE_USER: 'Finance User',
  FINANCE_MANAGER: 'Finance Manager',
  EXECUTIVE: 'Division Head / CFO / CEO',
}

export const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  HR: '/hr/dashboard',
  HOD: '/hod/dashboard',
  FINANCE_USER: '/finance/dashboard',
  FINANCE_MANAGER: '/finance-manager/dashboard',
  EXECUTIVE: '/executive/dashboard',
}

export const ROLE_PREFIX: Record<Role, string> = {
  SUPER_ADMIN: 'admin',
  HR: 'hr',
  HOD: 'hod',
  FINANCE_USER: 'finance',
  FINANCE_MANAGER: 'finance-manager',
  EXECUTIVE: 'executive',
}

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'u-admin',
    name: 'Ayesha Malik',
    email: 'admin@fims.local',
    role: 'SUPER_ADMIN',
    departmentIds: [],
    departmentNames: [],
    homePath: ROLE_HOME.SUPER_ADMIN,
    title: 'Super Admin',
  },
  {
    id: 'u-hr',
    name: 'Nadia Sheikh',
    email: 'hr@fims.local',
    role: 'HR',
    departmentIds: [],
    departmentNames: [],
    homePath: ROLE_HOME.HR,
    title: 'HR Manager',
  },
  {
    id: 'u-hod',
    name: 'Mark Watson',
    email: 'hod.ce@fims.local',
    role: 'HOD',
    departmentIds: ['dept-ce'],
    departmentNames: ['Construction Estimation'],
    homePath: ROLE_HOME.HOD,
    title: 'HOD · Construction Estimation',
  },
  {
    id: 'u-fin',
    name: 'Daniel Cruz',
    email: 'finance.user@fims.local',
    role: 'FINANCE_USER',
    departmentIds: [],
    departmentNames: [],
    homePath: ROLE_HOME.FINANCE_USER,
    title: 'Finance User',
  },
  {
    id: 'u-fm',
    name: 'Sara Khan',
    email: 'finance.manager@fims.local',
    role: 'FINANCE_MANAGER',
    departmentIds: [],
    departmentNames: [],
    homePath: ROLE_HOME.FINANCE_MANAGER,
    title: 'Finance Manager',
  },
  {
    id: 'u-exec',
    name: 'James Porter',
    email: 'executive@fims.local',
    role: 'EXECUTIVE',
    departmentIds: [],
    departmentNames: [],
    homePath: ROLE_HOME.EXECUTIVE,
    title: 'Division Head / CFO / CEO',
  },
]

export const DEMO_PASSWORDS: Record<string, string> = {
  'admin@fims.local': 'Admin@123',
  'hr@fims.local': 'Hr@123',
  'hod.ce@fims.local': 'Hod@123',
  'finance.user@fims.local': 'Finance@123',
  'finance.manager@fims.local': 'Manager@123',
  'executive@fims.local': 'Exec@123',
}

export function isQuickFillEnabled() {
  return import.meta.env.VITE_ENABLE_ROLE_QUICKFILL === 'true'
}
