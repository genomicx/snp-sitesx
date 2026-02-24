import { parseFasta } from './parseFasta'
import { findSnps } from './findSnps'
import { formatVcf } from './formatVcf'
import { formatPhylip } from './formatPhylip'
import {
  computeVariantCounts,
  computeDensity,
  computePairwiseDistances,
} from './computeStats'
import type { SnpOptions, SnpResult } from './types'

type ProgressCallback = (msg: string, pct: number) => void
type LogCallback = (msg: string) => void

/**
 * Build a SNP-only FASTA string.
 * Each sequence contains only the bases at SNP site positions.
 * If includeRef is false, the first sequence (reference) is excluded.
 */
function buildFastaOutput(
  sequences: { id: string; sequence: string }[],
  snpSites: { position: number; alleles: Record<string, string> }[],
  includeRef: boolean,
): string {
  const outputSeqs = includeRef ? sequences : sequences.slice(1)
  const lines: string[] = []
  for (const seq of outputSeqs) {
    lines.push(`>${seq.id}`)
    const snpBases = snpSites.map((site) => site.alleles[seq.id] ?? '-').join('')
    lines.push(snpBases)
  }
  return lines.join('\n') + '\n'
}

/**
 * Orchestrate the full snp-sitesx pipeline:
 *
 * Step 1 ( 5%): Parse all input FASTA files and validate the alignment.
 * Step 2 (30%): Find SNP sites.
 * Step 3 (60%): Format VCF, Phylip, and SNP-only FASTA outputs.
 * Step 4 (80%): Compute visualisation data (variant counts, density, pairwise distances).
 * Step 5 (100%): Assemble and return the SnpResult.
 */
export async function runSnpSitesx(
  files: File[],
  options: SnpOptions,
  onProgress: ProgressCallback,
  onLog: LogCallback,
): Promise<SnpResult> {
  // ------------------------------------------------------------------
  // Step 1: Parse FASTA files
  // ------------------------------------------------------------------
  onProgress('Parsing FASTA file(s)…', 5)
  onLog(`Parsing ${files.length} file(s)`)

  if (files.length === 0) {
    throw new Error('No input files provided')
  }

  // Parse each file and concatenate sequences; if multiple files are given
  // we treat them as additional sequences appended to the alignment.
  let sequences = await parseFasta(files[0])
  onLog(`Parsed "${files[0].name}": ${sequences.length} sequences, length ${sequences[0].sequence.length}`)

  for (let k = 1; k < files.length; k++) {
    const extra = await parseFasta(files[k])
    onLog(`Parsed "${files[k].name}": ${extra.length} sequences`)
    // Validate that lengths match
    const expectedLen = sequences[0].sequence.length
    for (const seq of extra) {
      if (seq.sequence.length !== expectedLen) {
        throw new Error(
          `Alignment length mismatch across files: "${files[k].name}" sequence "${seq.id}" ` +
            `has length ${seq.sequence.length} but expected ${expectedLen}`,
        )
      }
    }
    sequences = sequences.concat(extra)
  }

  const alignmentLength = sequences[0].sequence.length
  onLog(`Alignment: ${sequences.length} sequences × ${alignmentLength} positions`)

  // ------------------------------------------------------------------
  // Step 2: Find SNP sites
  // ------------------------------------------------------------------
  onProgress('Finding SNP sites…', 30)
  const snpSites = findSnps(sequences, options)
  onLog(`Found ${snpSites.length} SNP site(s) out of ${alignmentLength} total positions`)

  // ------------------------------------------------------------------
  // Step 3: Format outputs
  // ------------------------------------------------------------------
  onProgress('Formatting outputs…', 60)

  const vcfOutput = formatVcf(sequences, snpSites, options)
  onLog('VCF output generated')

  const phylipOutput = formatPhylip(sequences, snpSites, options)
  onLog('Phylip output generated')

  const fastaOutput = buildFastaOutput(sequences, snpSites, options.includeRef)
  onLog('SNP-only FASTA output generated')

  // ------------------------------------------------------------------
  // Step 4: Compute visualisation data
  // ------------------------------------------------------------------
  onProgress('Computing statistics…', 80)

  const variantCounts = computeVariantCounts(sequences, snpSites)
  const densityData = computeDensity(snpSites, alignmentLength)
  const pairwiseDistances = computePairwiseDistances(sequences, snpSites)

  onLog('Statistics computed')

  // ------------------------------------------------------------------
  // Step 5: Assemble result
  // ------------------------------------------------------------------
  onProgress('Done', 100)

  const snpPercent =
    alignmentLength > 0
      ? parseFloat(((snpSites.length / alignmentLength) * 100).toFixed(2))
      : 0

  return {
    sequences,
    snpSites,
    allSites: alignmentLength,
    snpCount: snpSites.length,
    snpPercent,
    vcfOutput,
    phylipOutput,
    fastaOutput,
    variantCounts,
    densityData,
    pairwiseDistances,
  }
}
