import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SnpSite } from '../snpsitesx/types'

export interface SnpPositionPlotProps {
  snpSites: SnpSite[]
  allSites: number
}

export function SnpPositionPlot({ snpSites, allSites }: SnpPositionPlotProps) {
  const data = snpSites.map((s) => ({ x: s.position, y: 1 }))

  return (
    <section className="chart-section">
      <h3>SNP Positions</h3>
      <ResponsiveContainer width="100%" height={120}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <XAxis
            type="number"
            dataKey="x"
            domain={[1, allSites]}
            name="Position"
            label={{ value: 'Position', position: 'insideBottom', offset: -2 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 2]}
            tick={false}
            axisLine={false}
            tickLine={false}
            width={0}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: number, name: string) =>
              name === 'x' ? [value, 'Position'] : [value, name]
            }
          />
          <Scatter data={data} fill="#0d9488" />
        </ScatterChart>
      </ResponsiveContainer>
    </section>
  )
}
