import { useMemo, useState } from 'react'
import { useFims } from '@/features/data/fims-store'
import { choiceOptions } from '@/shared/data/seed'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { DataTable } from '@/shared/ui/DataTable'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Select } from '@/shared/ui/Select'
import { downloadCsv } from '@/shared/utils/csv'

export function AuditWorkspace() {
  const { audit } = useFims()
  const [user, setUser] = useState('All')
  const [action, setAction] = useState('All')
  const rows = useMemo(
    () => audit.filter((row) => (user === 'All' || row.user === user) && (action === 'All' || row.action === action)),
    [action, audit, user],
  )
  return (
    <div className="page-grid">
      <PageHeader
        title="Audit history"
        subtitle="User, action, entity, old value, new value, time and reason."
        actions={<Button variant="ghost" onClick={() => downloadCsv('audit.csv', rows)}>Export to Excel</Button>}
      />
      <Card
        action={
          <div className="filter-row">
            <Select label="User" value={user} options={choiceOptions(audit.map((row) => row.user))} onChange={setUser} />
            <Select label="Action" value={action} options={choiceOptions(audit.map((row) => row.action))} onChange={setAction} />
          </div>
        }
      >
        <DataTable
          rows={rows}
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
