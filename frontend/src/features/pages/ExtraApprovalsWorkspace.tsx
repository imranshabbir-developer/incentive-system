import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'

export function ExtraApprovalsWorkspace() {
  const { user } = useAuth()
  const prefix = ROLE_PREFIX[user!.role]
  return (
    <div className="page-grid">
      <PageHeader
        title="Extra approval queue"
        subtitle="Hidden until a department or amount threshold is configured. FIMS does not invent those amounts."
      />
      <Card title="Waiting extra approval">
        <p className="muted">No threshold is configured, so this queue is empty. Configure it later in Settings — do not enter a policy percentage here.</p>
        <div style={{ marginTop: 16 }}>
          <DataTable
            rows={[] as Array<{ id: string }>}
            rowKey={(row) => row.id}
            columns={[{ key: 'id', label: 'Request' }]}
            empty="No items waiting extra approval."
          />
        </div>
      </Card>
      {user?.role === 'SUPER_ADMIN' || user?.role === 'FINANCE_MANAGER' ? (
        <Link className="shortcut" to={`/${prefix}/settings`}>
          <strong>Open settings</strong>
          <span className="tiny">Threshold stays unconfigured</span>
        </Link>
      ) : null}
    </div>
  )
}
