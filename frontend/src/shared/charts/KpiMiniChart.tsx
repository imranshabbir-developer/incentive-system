import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { KpiTone } from '@/shared/types'

export type KpiChartKind = 'area' | 'bar' | 'ring'

const TONE: Record<KpiTone, { fill: string; soft: string }> = {
  green: { fill: '#10b981', soft: '#a7f3d0' },
  blue: { fill: '#38bdf8', soft: '#bae6fd' },
  purple: { fill: '#a78bfa', soft: '#ddd6fe' },
  amber: { fill: '#f59e0b', soft: '#fde68a' },
  rose: { fill: '#f43f5e', soft: '#fecdd3' },
  dark: { fill: '#14b8a6', soft: '#99f6e4' },
}

export function kindForKpi(label: string, value: string): KpiChartKind {
  const text = `${label} ${value}`.toLowerCase()
  if (text.includes('%') || text.includes('lock') || text.includes('eligible for') || text.includes('not eligible') || text.includes('incentive /')) return 'ring'
  if (text.includes('$') || text.includes('this month') || text.includes('total incentive') || text.includes('collections this')) return 'area'
  return 'bar'
}

function series(spark: number[] | undefined, value: string) {
  if (spark?.length) return spark.map((item, index) => ({ i: index, v: item }))
  const n = Number(String(value).replace(/[^0-9.]/g, '')) || 4
  const seed = [n * 0.45, n * 0.62, n * 0.5, n * 0.78, n * 0.7, n]
  return seed.map((item, index) => ({ i: index, v: Math.max(item, 1) }))
}

function ringValue(value: string) {
  if (value.includes('%')) return Math.min(100, Number(value.replace(/[^0-9.]/g, '')) || 0)
  if (/locked/i.test(value)) return 100
  if (/unlocked/i.test(value)) return 28
  const n = Number(String(value).replace(/[^0-9.]/g, '')) || 0
  return Math.min(100, n * 12)
}

export function KpiMiniChart({ kind, value, spark, tone = 'green' }: { kind: KpiChartKind; value: string; spark?: number[]; tone?: KpiTone }) {
  const color = TONE[tone]
  const data = series(spark, value)

  if (kind === 'ring') {
    const pct = ringValue(value)
    return (
      <div className="sparkline sparkline-lg">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{ v: pct }, { v: Math.max(100 - pct, 8) }]} dataKey="v" innerRadius={11} outerRadius={16} startAngle={90} endAngle={-270} stroke="none">
              <Cell fill={color.fill} />
              <Cell fill={color.soft} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (kind === 'bar') {
    return (
      <div className="sparkline sparkline-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="v" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((row, index) => (
                <Cell key={row.i} fill={index === data.length - 1 ? color.fill : color.soft} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="sparkline sparkline-lg">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Area type="monotone" dataKey="v" stroke={color.fill} fill={color.soft} strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
