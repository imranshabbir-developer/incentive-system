import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type Slice = { name: string; value: number; color: string }

export function DonutChart({ data }: { data: Slice[] }) {
  return (
    <div className="chart-box donut-box">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={52} outerRadius={74} paddingAngle={3} stroke="none">
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
