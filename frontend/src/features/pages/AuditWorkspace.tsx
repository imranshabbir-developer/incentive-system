import { useFims } from '@/features/data/fims-store'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'
import { downloadCsv } from '@/shared/utils/csv'

export function AuditWorkspace() {
  const { audit } = useFims()
  return (
    <div className="page-grid">
      <PageHeader
        title="Audit history"
        subtitle="User, action, entity, old value, new value, time and reason."
        actions={<Button variant="ghost" onClick={() => downloadCsv('audit.csv', audit)}>Export to Excel</Button>}
      />
      <Card>
        <DataTable
          rows={audit}
          rowKey={(row) => row.id}
          columns={[
            { key: 'user', label: 'User' },
            { key: 'action', label: 'Action' },
            { key: 'entity', label: 'Entity' },
            { key: 'oldValue', label: 'Old value' },
            { key: 'newValue', label: 'New value' },
            { key: 'at', label: 'Date / time' },
            { key: 'reason', label: 'Reason' },
          ]}
        />
      </Card>
    </div>
  )
}
