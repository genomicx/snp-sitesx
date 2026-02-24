import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface PerSequenceChartProps {
  variantCounts: { name: string; count: number }[]
}

export function PerSequenceChart({ variantCounts }: PerSequenceChartProps) {
  const rawHeight = Math.max(150, variantCounts.length * 32)
  const height = Math.min(rawHeight, 400)

  return (
    <section className="chart-section">
      <h3>Variants per Sequence</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={variantCounts}
          margin={{ top: 8, right: 32, bottom: 8, left: 16 }}
        >
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [value, 'Variants']}
            labelFormatter={(label: string) => `Sequence: ${label}`}
          />
          <Bar dataKey="count" fill="#0d9488" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
