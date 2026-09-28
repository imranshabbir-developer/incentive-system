import { useAuth } from '@/features/auth/auth-context'
import { useFims } from '@/features/data/fims-store'
import { ROLE_PREFIX } from '@/shared/constants/roles'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'
import { useNavigate } from 'react-router-dom'

export function NotificationsWorkspace() {
  const { user } = useAuth()
  const { notices, markNoticeRead } = useFims()
  const navigate = useNavigate()
  const prefix = ROLE_PREFIX[user!.role]
  const mine = notices.filter((row) =>
    row.to === 'ALL'
    || row.to === user!.role
    || row.to === user!.name
    || (row.to === 'FINANCE' && user!.role.includes('FINANCE'))
    || (row.to === 'HOD' && user!.role === 'HOD'),
  )

  return (
    <div className="page-grid">
      <PageHeader
        title="Notifications"
        subtitle="In-app alerts for submit, return, approve and payroll. Email templates stay for a later phase."
        actions={
          <Button
            variant="ghost"
            onClick={() => mine.filter((row) => !row.read).forEach((row) => markNoticeRead(row.id))}
          >
            Mark all read
          </Button>
        }
      />
      <Card title="Inbox">
        <DataTable
          rows={mine}
          rowKey={(row) => row.id}
          empty="No notifications for this role."
          columns={[
            { key: 'title', label: 'Event' },
            { key: 'body', label: 'Detail' },
            { key: 'at', label: 'When' },
            { key: 'read', label: 'State', render: (row) => row.read ? 'Read' : 'Unread' },
            {
              key: 'open',
              label: '',
              render: (row) => (
                <Button
                  variant="ghost"
                  onClick={() => {
                    markNoticeRead(row.id)
                    navigate(`/${prefix}/incentives`)
                  }}
                >
                  Open
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
