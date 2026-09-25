import { useAuth } from '@/features/auth/auth-context'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ROLE_LABEL } from '@/shared/constants/roles'

export function ProfileWorkspace() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="page-grid">
      <PageHeader title="Profile" subtitle="Signed-in account details for this session." />
      <Card title="Account">
        <div className="readonly-grid">
          <div><span>Name</span><strong>{user.name}</strong></div>
          <div><span>Email</span><strong>{user.email}</strong></div>
          <div><span>Role</span><strong>{ROLE_LABEL[user.role]}</strong></div>
          <div><span>Title</span><strong>{user.title}</strong></div>
          <div><span>Department</span><strong>{user.departmentNames.join(', ') || 'All departments'}</strong></div>
          <div><span>User ID</span><strong>{user.id}</strong></div>
        </div>
      </Card>
    </div>
  )
}
