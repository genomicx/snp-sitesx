import { Fragment } from 'react'

export interface PairwiseHeatmapProps {
  pairwiseDistances: { seq1: string; seq2: string; distance: number }[]
  sequences: { id: string }[]
}

export function PairwiseHeatmap({ pairwiseDistances, sequences }: PairwiseHeatmapProps) {
  if (pairwiseDistances.length === 0) {
    return (
      <section className="chart-section">
        <h3>Pairwise Distance Matrix</h3>
        <p>Pairwise heatmap disabled for &gt;50 sequences</p>
      </section>
    )
  }

  // Build ordered list of unique sequence names
  const nameSet = new Set<string>()
  for (const { seq1, seq2 } of pairwiseDistances) {
    nameSet.add(seq1)
    nameSet.add(seq2)
  }
  // Preserve insertion order; overlay with sequences prop ordering when available
  const seqOrder = sequences.length > 0
    ? sequences.map((s) => s.id).filter((id) => nameSet.has(id))
    : Array.from(nameSet)

  // Fill any names present in distances but missing from sequences prop
  for (const name of nameSet) {
    if (!seqOrder.includes(name)) seqOrder.push(name)
  }

  const N = seqOrder.length

  // Build lookup map
  const distMap: Record<string, Record<string, number>> = {}
  for (const name of seqOrder) {
    distMap[name] = {}
  }
  for (const { seq1, seq2, distance } of pairwiseDistances) {
    distMap[seq1][seq2] = distance
    distMap[seq2][seq1] = distance
  }

  // Compute max distance for colour scale
  let maxDistance = 0
  for (const { distance } of pairwiseDistances) {
    if (distance > maxDistance) maxDistance = distance
  }

  function cellColor(seq1: string, seq2: string): string {
    if (seq1 === seq2) return 'var(--gx-border)'
    const dist = distMap[seq1]?.[seq2] ?? 0
    const opacity = maxDistance > 0 ? dist / maxDistance : 0
    return `color-mix(in srgb, var(--gx-accent) ${opacity * 100}%, var(--gx-surface))`
  }

  const showNumbers = N <= 20

  const cellSize = showNumbers ? 40 : 20
  const labelWidth = 100

  const gridTemplateColumns = `${labelWidth}px repeat(${N}, ${cellSize}px)`

  return (
    <section className="chart-section">
      <h3>Pairwise Distance Matrix</h3>
      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns,
            width: 'max-content',
          }}
        >
          {/* Top-left empty corner */}
          <div />

          {/* Header row: column labels (rotated) */}
          {seqOrder.map((name) => (
            <div
              key={`col-${name}`}
              style={{
                height: labelWidth,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 4,
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'bottom center',
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  maxWidth: cellSize * 3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={name}
              >
                {name}
              </span>
            </div>
          ))}

          {/* Data rows */}
          {seqOrder.map((rowName) => (
            <Fragment key={`row-${rowName}`}>
              {/* Row label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: 8,
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  height: cellSize,
                }}
                title={rowName}
              >
                {rowName}
              </div>

              {/* Data cells */}
              {seqOrder.map((colName) => {
                const dist =
                  rowName === colName ? undefined : (distMap[rowName]?.[colName] ?? 0)
                const bg = cellColor(rowName, colName)
                return (
                  <div
                    key={`cell-${rowName}-${colName}`}
                    style={{
                      backgroundColor: bg,
                      color: dist !== undefined && maxDistance > 0 && dist / maxDistance > 0.5
                        ? 'var(--gx-text-inverted)' : 'var(--gx-text)',
                      width: cellSize,
                      height: cellSize,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      border: '1px solid var(--gx-border)',
                      boxSizing: 'border-box',
                    }}
                    title={
                      rowName === colName
                        ? `${rowName} vs ${colName}`
                        : `${rowName} vs ${colName}: ${dist}`
                    }
                  >
                    {showNumbers && dist !== undefined ? dist : null}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
