import type { AlignedSequence, SnpSite } from './types'

/**
 * Count how many SNP positions each sequence differs from the reference
 * (first sequence). Only positions where both sequences have a non-gap base
 * are considered a difference.
 */
export function computeVariantCounts(
  sequences: AlignedSequence[],
  snpSites: SnpSite[],
): { name: string; count: number }[] {
  if (sequences.length === 0) return []

  const refSeq = sequences[0]

  return sequences.map((seq) => {
    let count = 0
    for (const site of snpSites) {
      const refBase = site.alleles[refSeq.id]
      const seqBase = site.alleles[seq.id]
      if (
        seqBase !== undefined &&
        refBase !== undefined &&
        seqBase !== refBase
      ) {
        count++
      }
    }
    return { name: seq.id, count }
  })
}

/**
 * Sliding window SNP density (non-overlapping windows).
 *
 * windowSize = max(50, Math.floor(alignmentLength * 0.01))
 * Step = windowSize (non-overlapping)
 * Returns { windowStart: number (1-based), density: number (SNPs in window) }
 */
export function computeDensity(
  snpSites: SnpSite[],
  alignmentLength: number,
): { windowStart: number; density: number }[] {
  if (alignmentLength <= 0) return []

  const windowSize = Math.max(50, Math.floor(alignmentLength * 0.01))
  const result: { windowStart: number; density: number }[] = []

  for (let start = 1; start <= alignmentLength; start += windowSize) {
    const end = Math.min(start + windowSize - 1, alignmentLength)
    const density = snpSites.filter(
      (site) => site.position >= start && site.position <= end,
    ).length
    result.push({ windowStart: start, density })
  }

  return result
}

/**
 * O(n²) pairwise SNP distances between all sequences.
 *
 * distance = number of positions that differ between two sequences
 * (considering all SNP sites).
 *
 * Only computed when sequences.length <= 50 to avoid UI freeze;
 * returns [] otherwise.
 */
export function computePairwiseDistances(
  sequences: AlignedSequence[],
  snpSites: SnpSite[],
): { seq1: string; seq2: string; distance: number }[] {
  if (sequences.length > 50) return []

  const distances: { seq1: string; seq2: string; distance: number }[] = []

  for (let i = 0; i < sequences.length; i++) {
    for (let j = i + 1; j < sequences.length; j++) {
      const seqA = sequences[i]
      const seqB = sequences[j]
      let diff = 0
      for (const site of snpSites) {
        const baseA = site.alleles[seqA.id]
        const baseB = site.alleles[seqB.id]
        if (baseA !== undefined && baseB !== undefined && baseA !== baseB) {
          diff++
        }
      }
      distances.push({ seq1: seqA.id, seq2: seqB.id, distance: diff })
    }
  }

  return distances
}
