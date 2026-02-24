import { SnpResult } from '../snpsitesx/types'

export interface SummaryCardsProps {
  result: SnpResult
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const cards: { label: string; value: string }[] = [
    {
      label: 'Sequences',
      value: result.sequences.length.toLocaleString(),
    },
    {
      label: 'Alignment Length',
      value: `${result.allSites.toLocaleString()} bp`,
    },
    {
      label: 'SNP Sites',
      value: result.snpCount.toLocaleString(),
    },
    {
      label: 'SNP Density',
      value: `${result.snpPercent.toFixed(2)}%`,
    },
  ]

  return (
    <div className="summary-cards">
      {cards.map(({ label, value }) => (
        <div key={label} className="stat-card">
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  )
}
