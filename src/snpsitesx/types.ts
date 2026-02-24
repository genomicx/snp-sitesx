/** A single sequence in a multi-FASTA alignment */
export interface AlignedSequence {
  id: string
  sequence: string
}

/** A SNP site in the alignment */
export interface SnpSite {
  position: number          // 1-based
  refBase: string           // base in first (reference) sequence
  alleles: Record<string, string>  // seqId → base at this position
  baseFreq: {
    A: number
    T: number
    G: number
    C: number
    other: number
  }
}

/** Options controlling SNP detection and output (mirrors snp-sites CLI flags) */
export interface SnpOptions {
  includeRef: boolean          // -r: include ref in output
  onlyAcgt: boolean            // -c: filter to ACGT only
  includeMonomorphic: boolean  // -b: include non-variant sites (BEAST)
}

/** Full result from the snp-sitesx pipeline */
export interface SnpResult {
  sequences: AlignedSequence[]
  snpSites: SnpSite[]
  allSites: number
  snpCount: number
  snpPercent: number
  // Formatted outputs
  vcfOutput: string
  phylipOutput: string
  fastaOutput: string
  // Visualisation data
  variantCounts: { name: string; count: number }[]
  densityData: { windowStart: number; density: number }[]
  pairwiseDistances: { seq1: string; seq2: string; distance: number }[]
}

export const DEFAULT_OPTIONS: SnpOptions = {
  includeRef: false,
  onlyAcgt: false,
  includeMonomorphic: false,
}
