import type { ReactNode } from 'react'
import type { KpiTone } from '@/shared/types'
import { kindForKpi, KpiMiniChart } from '@/shared/charts/KpiMiniChart'

type Props = {
  label: string
  value: string
  delta?: string
  tone?: KpiTone
  icon: ReactNode
  spark?: number[]
}

export function KpiCard({ label, value, delta, tone = 'green', icon, spark }: Props) {
  const up = delta?.startsWith('+') ?? true
  return (
    <article className="card card-pad kpi-card">
      <div className="kpi-top">
        <span className={`kpi-icon tone-${tone}`}>{icon}</span>
        <span className="kpi-label">{label}</span>
      </div>
      <strong className="kpi-value">{value}</strong>
      <div className="kpi-foot">
        {delta ? <span className={up ? 'delta-up' : 'delta-down'}>{delta}</span> : <span />}
        <KpiMiniChart kind={kindForKpi(label, value)} value={value} spark={spark} tone={tone} />
      </div>
    </article>
  )
}
