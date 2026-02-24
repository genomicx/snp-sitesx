import type { AlignedSequence, SnpOptions, SnpSite } from './types'

const ACGT = new Set(['A', 'T', 'G', 'C'])

/**
 * Scan alignment columns and return SNP sites.
 *
 * Algorithm per column i:
 *  1. Collect each sequence's base at position i.
 *  2. Build a Set of unique bases, always excluding gap characters ('-').
 *  3. If onlyAcgt is set, also exclude any base not in {A, T, G, C}.
 *  4. Record a SnpSite when the set has >1 member (polymorphic)
 *     OR when includeMonomorphic is true.
 */
export function findSnps(
  sequences: AlignedSequence[],
  options: SnpOptions,
): SnpSite[] {
  if (sequences.length === 0) return []

  const alignmentLength = sequences[0].sequence.length
  const snpSites: SnpSite[] = []

  for (let i = 0; i < alignmentLength; i++) {
    const uniqueBases = new Set<string>()
    const alleles: Record<string, string> = {}
    const baseFreq = { A: 0, T: 0, G: 0, C: 0, other: 0 }

    for (const seq of sequences) {
      const base = seq.sequence[i]
      alleles[seq.id] = base

      // Accumulate base frequencies
      if (base === 'A') baseFreq.A++
      else if (base === 'T') baseFreq.T++
      else if (base === 'G') baseFreq.G++
      else if (base === 'C') baseFreq.C++
      else baseFreq.other++

      // Skip gap characters when determining polymorphism
      if (base === '-') continue

      // If onlyAcgt filter is active, skip non-ACGT bases
      if (options.onlyAcgt && !ACGT.has(base)) continue

      uniqueBases.add(base)
    }

    const isPolymorphic = uniqueBases.size > 1
    if (isPolymorphic || options.includeMonomorphic) {
      snpSites.push({
        position: i + 1, // convert to 1-based
        refBase: sequences[0].sequence[i],
        alleles,
        baseFreq,
      })
    }
  }

  return snpSites
}
