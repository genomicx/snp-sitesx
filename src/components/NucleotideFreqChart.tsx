import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { SnpSite } from '../snpsitesx/types'

export interface NucleotideFreqChartProps {
  snpSites: SnpSite[]
}

const BASE_COLORS: Record<string, string> = {
  A: '#0d9488',
  T: '#06b6d4',
  G: '#6366f1',
  C: '#f59e0b',
  other: '#94a3b8',
}

const BASES = ['A', 'T', 'G', 'C', 'other'] as const

export function NucleotideFreqChart({ snpSites }: NucleotideFreqChartProps) {
  if (snpSites.length === 0) {
    return (
      <section className="chart-section">
        <h3>Nucleotide Frequencies at SNP Sites</h3>
        <p>No SNP sites to display.</p>
      </section>
    )
  }

  if (snpSites.length <= 200) {
    // Per-site stacked bar chart
    const data = snpSites.map((s) => ({
      pos: s.position,
      A: s.baseFreq.A,
      T: s.baseFreq.T,
      G: s.baseFreq.G,
      C: s.baseFreq.C,
      other: s.baseFreq.other,
    }))

    return (
      <section className="chart-section">
        <h3>Nucleotide Frequencies at SNP Sites</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 24, left: 16 }}
          >
            <XAxis
              dataKey="pos"
              name="Position"
              label={{ value: 'Position', position: 'insideBottom', offset: -12 }}
            />
            <YAxis
              label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 8 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              labelFormatter={(label: number) => `Position: ${label}`}
            />
            <Legend verticalAlign="top" />
            {BASES.map((base) => (
              <Bar key={base} dataKey={base} stackId="freq" fill={BASE_COLORS[base]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </section>
    )
  }

  // Aggregated summary card for >200 SNP sites
  const totals = snpSites.reduce(
    (acc, s) => {
      acc.A += s.baseFreq.A
      acc.T += s.baseFreq.T
      acc.G += s.baseFreq.G
      acc.C += s.baseFreq.C
      acc.other += s.baseFreq.other
      return acc
    },
    { A: 0, T: 0, G: 0, C: 0, other: 0 },
  )

  const aggregated = [
    { base: 'A', count: totals.A },
    { base: 'T', count: totals.T },
    { base: 'G', count: totals.G },
    { base: 'C', count: totals.C },
    { base: 'other', count: totals.other },
  ]

  return (
    <section className="chart-section">
      <h3>Nucleotide Frequencies at SNP Sites</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--gx-muted, #64748b)', marginBottom: '0.5rem' }}>
        Aggregated totals across {snpSites.length} SNP sites
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={aggregated}
          margin={{ top: 8, right: 16, bottom: 24, left: 16 }}
        >
          <XAxis dataKey="base" />
          <YAxis
            label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 8 }}
          />
          <Tooltip formatter={(value: number) => [value, 'Count']} />
          <Bar dataKey="count">
            {aggregated.map((entry) => (
              <Cell key={entry.base} fill={BASE_COLORS[entry.base]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
