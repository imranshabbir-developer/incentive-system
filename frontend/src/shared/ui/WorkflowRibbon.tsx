import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { countStatus, useFims } from '@/features/data/fims-store'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import type { Role } from '@/shared/types'

const steps: Array<{ label: string; path: string; roles: Role[] }> = [
  { label: 'Employee Master', path: 'employees', roles: ['SUPER_ADMIN', 'HR', 'HOD'] },
  { label: 'Sales / Collection', path: 'sales', roles: ['SUPER_ADMIN', 'FINANCE_USER', 'FINANCE_MANAGER', 'EXECUTIVE'] },
  { label: 'HOD Submission', path: 'incentives', roles: ['SUPER_ADMIN', 'HOD', 'FINANCE_USER', 'FINANCE_MANAGER', 'EXECUTIVE'] },
  { label: 'Finance Review', path: 'approvals', roles: ['SUPER_ADMIN', 'FINANCE_USER', 'FINANCE_MANAGER', 'EXECUTIVE'] },
  { label: 'Approval', path: 'approvals', roles: ['SUPER_ADMIN', 'FINANCE_USER', 'FINANCE_MANAGER', 'EXECUTIVE'] },
  { label: 'Payroll / Payment', path: 'payroll', roles: ['SUPER_ADMIN', 'FINANCE_USER', 'FINANCE_MANAGER', 'EXECUTIVE'] },
  { label: 'Reports & Audit', path: 'reports', roles: ['SUPER_ADMIN', 'HR', 'HOD', 'FINANCE_USER', 'FINANCE_MANAGER', 'EXECUTIVE'] },
]

export function WorkflowRibbon() {
  const { user } = useAuth()
  const { employees, sales, requests, batches } = useFims()
  if (!user) return null
  const prefix = ROLE_PREFIX[user.role]
  const hints = [
    `${employees.length} people`,
    `${sales.length} sales`,
    `${countStatus(requests, ['Draft', 'Submitted', 'Resubmitted', 'Returned'])} open`,
    `${countStatus(requests, ['Submitted', 'Resubmitted', 'Under Finance Review'])} in queue`,
    `${countStatus(requests, 'Approved')} approved`,
    `${batches.length} batches`,
    'Export Excel',
  ]
  return (
    <section className="flow-ribbon" aria-label="Incentive process">
      {steps.map((step, index) => {
        const allowed = step.roles.includes(user.role)
        const inner = (
          <>
            <span className="flow-step-index">{index + 1}</span>
            <span>
              <strong>{step.label}</strong>
              <span className="tiny">{hints[index]}</span>
            </span>
          </>
        )
        return allowed ? (
          <Link key={step.label} className="flow-step" to={`/${prefix}/${step.path}`}>
            {inner}
          </Link>
        ) : (
          <div key={step.label} className="flow-step is-muted">
            {inner}
          </div>
        )
      })}
    </section>
  )
}
