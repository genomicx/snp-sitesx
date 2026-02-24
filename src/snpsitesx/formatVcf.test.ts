import { describe, it, expect } from 'vitest'
import { formatVcf } from './formatVcf'
import { findSnps } from './findSnps'
import type { AlignedSequence, SnpOptions } from './types'

// Same 4-sequence test alignment used across tests
const testSequences: AlignedSequence[] = [
  { id: 'seq1', sequence: 'ACGTACGTACGTACGTACGT' },
  { id: 'seq2', sequence: 'ACGTTCGTACGTACGTTCGT' },
  { id: 'seq3', sequence: 'ACGTACGTACGTTCGTACGT' },
  { id: 'seq4', sequence: 'ACGTTCGTACGTTCGTACGT' },
]

const defaultOptions: SnpOptions = {
  includeRef: false,
  onlyAcgt: false,
  includeMonomorphic: false,
}

function getVcfLines(vcf: string): string[] {
  return vcf.split('\n').filter((l) => l.length > 0)
}

function getDataLines(vcf: string): string[] {
  return getVcfLines(vcf).filter((l) => !l.startsWith('#'))
}

function getHeaderLines(vcf: string): string[] {
  return getVcfLines(vcf).filter((l) => l.startsWith('#'))
}

describe('formatVcf', () => {
  it('output starts with ##fileformat=VCFv4.2', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    expect(vcf.startsWith('##fileformat=VCFv4.2')).toBe(true)
  })

  it('contains ##source=snp-sitesx header', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    expect(vcf).toContain('##source=snp-sitesx')
  })

  it('column header line starts with #CHROM', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const headerLines = getHeaderLines(vcf)
    const colHeader = headerLines.find((l) => l.startsWith('#CHROM'))
    expect(colHeader).toBeDefined()
  })

  it('column header includes FORMAT and sample columns', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const headerLines = getHeaderLines(vcf)
    const colHeader = headerLines.find((l) => l.startsWith('#CHROM'))!
    // includeRef=false: seq1 (ref) excluded from samples
    expect(colHeader).toContain('FORMAT')
    expect(colHeader).toContain('seq2')
    expect(colHeader).toContain('seq3')
    expect(colHeader).toContain('seq4')
    expect(colHeader).not.toContain('seq1')
  })

  it('produces exactly 3 data rows (one per SNP site)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const dataLines = getDataLines(vcf)
    expect(dataLines).toHaveLength(3)
  })

  it('data rows have CHROM=alignment and correct POS values', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const dataLines = getDataLines(vcf)
    const positions = dataLines.map((l) => parseInt(l.split('\t')[1]))
    expect(positions).toContain(5)
    expect(positions).toContain(13)
    expect(positions).toContain(17)
    for (const line of dataLines) {
      expect(line.split('\t')[0]).toBe('alignment')
    }
  })

  it('REF is A for all 3 SNP sites (ref seq has A at pos 5, 13, 17)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const dataLines = getDataLines(vcf)
    for (const line of dataLines) {
      const fields = line.split('\t')
      expect(fields[3]).toBe('A') // REF column
    }
  })

  it('ALT is T for all 3 SNP sites', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const dataLines = getDataLines(vcf)
    for (const line of dataLines) {
      const fields = line.split('\t')
      expect(fields[4]).toBe('T') // ALT column
    }
  })

  it('FORMAT field is GT', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const dataLines = getDataLines(vcf)
    for (const line of dataLines) {
      const fields = line.split('\t')
      expect(fields[8]).toBe('GT')
    }
  })

  it('GT calls at position 5: seq2=1 (T), seq3=0 (A), seq4=1 (T)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const dataLines = getDataLines(vcf)
    // colHeader: #CHROM POS ID REF ALT QUAL FILTER INFO FORMAT seq2 seq3 seq4
    // indices:    0      1   2  3   4   5    6      7    8      9    10   11
    const row5 = dataLines.find((l) => l.split('\t')[1] === '5')!
    const fields = row5.split('\t')
    expect(fields[9]).toBe('1')   // seq2 → T (alt index 1)
    expect(fields[10]).toBe('0')  // seq3 → A (ref)
    expect(fields[11]).toBe('1')  // seq4 → T (alt index 1)
  })

  it('GT calls at position 13: seq2=0, seq3=1, seq4=1', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const dataLines = getDataLines(vcf)
    const row13 = dataLines.find((l) => l.split('\t')[1] === '13')!
    const fields = row13.split('\t')
    expect(fields[9]).toBe('0')   // seq2 → A (ref)
    expect(fields[10]).toBe('1')  // seq3 → T (alt)
    expect(fields[11]).toBe('1')  // seq4 → T (alt)
  })

  it('includeRef=true adds seq1 as first sample column', () => {
    const opts: SnpOptions = { ...defaultOptions, includeRef: true }
    const snps = findSnps(testSequences, opts)
    const vcf = formatVcf(testSequences, snps, opts)
    const headerLines = getHeaderLines(vcf)
    const colHeader = headerLines.find((l) => l.startsWith('#CHROM'))!
    const cols = colHeader.split('\t')
    expect(cols).toContain('seq1')
    // seq1 should appear before seq2
    expect(cols.indexOf('seq1')).toBeLessThan(cols.indexOf('seq2'))
  })

  it('INFO field contains AF=', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const vcf = formatVcf(testSequences, snps, defaultOptions)
    const dataLines = getDataLines(vcf)
    for (const line of dataLines) {
      const info = line.split('\t')[7]
      expect(info).toMatch(/^AF=/)
    }
  })

  it('empty snpSites produces only header lines', () => {
    const vcf = formatVcf(testSequences, [], defaultOptions)
    const dataLines = getDataLines(vcf)
    expect(dataLines).toHaveLength(0)
    expect(vcf).toContain('##fileformat=VCFv4.2')
  })
})
