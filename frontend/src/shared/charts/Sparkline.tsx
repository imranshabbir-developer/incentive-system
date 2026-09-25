import { Line, LineChart, ResponsiveContainer } from 'recharts'

type Props = {
  data: number[]
  color?: string
}

export function Sparkline({ data, color = '#22c55e' }: Props) {
  const points = data.map((value, index) => ({ index, value }))
  return (
    <div className="sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
