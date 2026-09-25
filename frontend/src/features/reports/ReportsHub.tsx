import { PageHeader } from '@/shared/ui/PageHeader'
import { ReportingSection } from '@/features/dashboards/ReportingSection'

export function ReportsHub() {
  return (
    <div className="page-grid">
      <PageHeader title="Reports" subtitle="Role-scoped registers and Excel export. HOD sees Construction Estimation only. HR sees people reports only." />
      <ReportingSection />
    </div>
  )
}
