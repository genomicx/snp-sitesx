import { describe, it, expect } from 'vitest'
import { findSnps } from './findSnps'
import type { AlignedSequence, SnpOptions } from './types'

// Test alignment: 4 sequences × 20 columns, 3 known SNP sites
//
//   Position: 1234567890123456789 0
//   seq1:     ACGTACGTACGTACGTACGT
//   seq2:     ACGTTCGTACGTACGTTCGT  (pos 5: A→T, pos 17: A→T)
//   seq3:     ACGTACGTACGTTCGTACGT  (pos 13: A→T)
//   seq4:     ACGTTCGTACGTTCGTACGT  (pos 5: A→T, pos 13: A→T)
//
// SNP sites: position 5, 13, 17
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

describe('findSnps', () => {
  it('detects exactly 3 SNP sites', () => {
    const snps = findSnps(testSequences, defaultOptions)
    expect(snps).toHaveLength(3)
  })

  it('reports correct 1-based positions (5, 13, 17)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const positions = snps.map((s) => s.position)
    expect(positions).toContain(5)
    expect(positions).toContain(13)
    expect(positions).toContain(17)
  })

  it('reports correct refBase for each SNP site', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const byPos = Object.fromEntries(snps.map((s) => [s.position, s]))

    // ref (seq1) has 'A' at positions 5, 13, and 17
    expect(byPos[5].refBase).toBe('A')
    expect(byPos[13].refBase).toBe('A')
    expect(byPos[17].refBase).toBe('A')
  })

  it('records correct alleles for SNP at position 5', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const site5 = snps.find((s) => s.position === 5)!
    expect(site5.alleles['seq1']).toBe('A')
    expect(site5.alleles['seq2']).toBe('T')
    expect(site5.alleles['seq3']).toBe('A')
    expect(site5.alleles['seq4']).toBe('T')
  })

  it('records correct alleles for SNP at position 13', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const site13 = snps.find((s) => s.position === 13)!
    expect(site13.alleles['seq1']).toBe('A')
    expect(site13.alleles['seq2']).toBe('A')
    expect(site13.alleles['seq3']).toBe('T')
    expect(site13.alleles['seq4']).toBe('T')
  })

  it('records correct baseFreq at position 5 (2 A, 2 T)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const site5 = snps.find((s) => s.position === 5)!
    expect(site5.baseFreq.A).toBe(2)
    expect(site5.baseFreq.T).toBe(2)
    expect(site5.baseFreq.G).toBe(0)
    expect(site5.baseFreq.C).toBe(0)
    expect(site5.baseFreq.other).toBe(0)
  })

  it('records correct baseFreq at position 13 (2 A, 2 T)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const site13 = snps.find((s) => s.position === 13)!
    expect(site13.baseFreq.A).toBe(2)
    expect(site13.baseFreq.T).toBe(2)
  })

  it('records correct baseFreq at position 17 (3 A, 1 T)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const site17 = snps.find((s) => s.position === 17)!
    expect(site17.baseFreq.A).toBe(3)
    expect(site17.baseFreq.T).toBe(1)
  })

  it('returns SNP sites in ascending position order', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const positions = snps.map((s) => s.position)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('includeMonomorphic returns all 20 positions', () => {
    const opts: SnpOptions = { ...defaultOptions, includeMonomorphic: true }
    const snps = findSnps(testSequences, opts)
    expect(snps).toHaveLength(20)
  })

  it('onlyAcgt with pure ACGT alignment returns same SNPs', () => {
    const opts: SnpOptions = { ...defaultOptions, onlyAcgt: true }
    const snps = findSnps(testSequences, opts)
    // All bases are ACGT so result should be the same 3 SNPs
    expect(snps).toHaveLength(3)
    const positions = snps.map((s) => s.position)
    expect(positions).toContain(5)
    expect(positions).toContain(13)
    expect(positions).toContain(17)
  })

  it('gap characters do not count as unique bases', () => {
    const seqsWithGap: AlignedSequence[] = [
      { id: 'r', sequence: 'ACGT' },
      { id: 's', sequence: 'A-GT' }, // gap at position 2
    ]
    const snps = findSnps(seqsWithGap, defaultOptions)
    // Position 2 has 'C' and '-'; gap is excluded, only 'C' in set → monomorphic
    const pos2 = snps.find((s) => s.position === 2)
    expect(pos2).toBeUndefined()
  })

  it('returns empty array for empty sequences list', () => {
    const snps = findSnps([], defaultOptions)
    expect(snps).toHaveLength(0)
  })
})
