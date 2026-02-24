import type { AlignedSequence, SnpOptions, SnpSite } from './types'

/**
 * Format SNP sites as relaxed Phylip.
 *
 * Output format:
 *   N L
 *   name1\t<SNP bases>
 *   name2\t<SNP bases>
 *   ...
 *
 * Where N = number of output sequences, L = number of SNP sites.
 * If includeRef is false, the first sequence (reference) is excluded.
 */
export function formatPhylip(
  sequences: AlignedSequence[],
  snpSites: SnpSite[],
  options: SnpOptions,
): string {
  const outputSeqs = options.includeRef ? sequences : sequences.slice(1)
  const L = snpSites.length
  const N = outputSeqs.length

  const lines: string[] = [`${N} ${L}`]

  for (const seq of outputSeqs) {
    const snpBases = snpSites.map((site) => site.alleles[seq.id] ?? '-').join('')
    lines.push(`${seq.id}\t${snpBases}`)
  }

  return lines.join('\n') + '\n'
}
