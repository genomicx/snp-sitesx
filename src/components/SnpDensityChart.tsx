import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

export interface SnpDensityChartProps {
  densityData: { windowStart: number; density: number }[]
  allSites: number
}

export function SnpDensityChart({ densityData }: SnpDensityChartProps) {
  return (
    <section className="chart-section">
      <h3>SNP Density</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={densityData}
          margin={{ top: 8, right: 16, bottom: 24, left: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="windowStart"
            name="Position"
            label={{ value: 'Position', position: 'insideBottom', offset: -12 }}
            type="number"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            label={{ value: 'SNPs', angle: -90, position: 'insideLeft', offset: 8 }}
          />
          <Tooltip
            formatter={(value: number) => [value, 'SNPs']}
            labelFormatter={(label: number) => `Window start: ${label}`}
          />
          <Bar dataKey="density" fill="#0d9488" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
