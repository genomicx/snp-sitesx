import type { AlignedSequence, SnpOptions, SnpSite } from './types'

const VALID_BASES = new Set(['A', 'T', 'G', 'C'])
const MISSING_OR_GAP = new Set(['-', 'N', '.'])

/**
 * Format SNP sites as VCF 4.2.
 *
 * - CHROM = "alignment"
 * - POS   = 1-based position
 * - REF   = refBase (first sequence base)
 * - ALT   = comma-separated unique alternate alleles (ACGT only, excluding ref and gaps)
 * - QUAL  = "." (not computed)
 * - FILTER= "PASS"
 * - INFO  = AF=<alt allele frequency, comma-separated when multiple alts>
 * - FORMAT= GT
 * - One sample column per sequence (ref sequence excluded unless includeRef is true)
 * - GT: 0=ref, 1..n=alt index (1-based), "."=gap/missing/ambiguous
 */
export function formatVcf(
  sequences: AlignedSequence[],
  snpSites: SnpSite[],
  options: SnpOptions,
): string {
  const today = new Date().toISOString().split('T')[0]

  // Determine which sequences appear as sample columns
  const sampleSequences = options.includeRef ? sequences : sequences.slice(1)

  const lines: string[] = [
    '##fileformat=VCFv4.2',
    `##fileDate=${today}`,
    '##source=snp-sitesx',
    '##reference=alignment',
    `##FILTER=<ID=PASS,Description="All filters passed">`,
    `##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency">`,
    `##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">`,
    [
      '#CHROM',
      'POS',
      'ID',
      'REF',
      'ALT',
      'QUAL',
      'FILTER',
      'INFO',
      'FORMAT',
      ...sampleSequences.map((s) => s.id),
    ].join('\t'),
  ]

  const totalSamples = sequences.length

  for (const site of snpSites) {
    const refBase = site.refBase

    // Collect alternate alleles: unique ACGT bases that differ from refBase
    const altSet = new Set<string>()
    for (const seq of sequences) {
      const base = site.alleles[seq.id]
      if (base && VALID_BASES.has(base) && base !== refBase) {
        altSet.add(base)
      }
    }

    // If REF itself is not ACGT, mark it as-is; ALT list may be empty
    const altAlleles = Array.from(altSet)
    const altField = altAlleles.length > 0 ? altAlleles.join(',') : '.'

    // Compute AF per alt allele (frequency across all sequences)
    const afValues = altAlleles.map((alt) => {
      let count = 0
      for (const seq of sequences) {
        if (site.alleles[seq.id] === alt) count++
      }
      return (count / totalSamples).toFixed(4)
    })
    const infoField =
      afValues.length > 0 ? `AF=${afValues.join(',')}` : 'AF=.'

    // Build genotype calls for sample sequences
    const gtCalls = sampleSequences.map((seq) => {
      const base = site.alleles[seq.id]
      if (!base || MISSING_OR_GAP.has(base) || (!VALID_BASES.has(base) && base !== refBase)) {
        return '.'
      }
      if (base === refBase) return '0'
      const altIdx = altAlleles.indexOf(base)
      return altIdx >= 0 ? String(altIdx + 1) : '.'
    })

    lines.push(
      [
        'alignment',
        String(site.position),
        '.',
        refBase,
        altField,
        '.',
        'PASS',
        infoField,
        'GT',
        ...gtCalls,
      ].join('\t'),
    )
  }

  return lines.join('\n') + '\n'
}
