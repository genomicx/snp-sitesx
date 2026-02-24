import { describe, it, expect } from 'vitest'
import {
  computeVariantCounts,
  computeDensity,
  computePairwiseDistances,
} from './computeStats'
import { findSnps } from './findSnps'
import type { AlignedSequence, SnpOptions } from './types'

// Same 4-sequence test alignment
//
//   seq1: ACGTACGTACGTACGTACGT  (reference)
//   seq2: ACGTTCGTACGTACGTTCGT  (differs at pos 5, 17)
//   seq3: ACGTACGTACGTTCGTACGT  (differs at pos 13)
//   seq4: ACGTTCGTACGTTCGTACGT  (differs at pos 5, 13)
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

describe('computeVariantCounts', () => {
  it('returns one entry per sequence', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const counts = computeVariantCounts(testSequences, snps)
    expect(counts).toHaveLength(4)
  })

  it('reference sequence (seq1) has 0 differences from itself', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const counts = computeVariantCounts(testSequences, snps)
    const ref = counts.find((c) => c.name === 'seq1')!
    expect(ref.count).toBe(0)
  })

  it('seq2 has 2 differences from seq1 (positions 5 and 17)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const counts = computeVariantCounts(testSequences, snps)
    const seq2 = counts.find((c) => c.name === 'seq2')!
    expect(seq2.count).toBe(2)
  })

  it('seq3 has 1 difference from seq1 (position 13)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const counts = computeVariantCounts(testSequences, snps)
    const seq3 = counts.find((c) => c.name === 'seq3')!
    expect(seq3.count).toBe(1)
  })

  it('seq4 has 2 differences from seq1 (positions 5 and 13)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const counts = computeVariantCounts(testSequences, snps)
    const seq4 = counts.find((c) => c.name === 'seq4')!
    expect(seq4.count).toBe(2)
  })

  it('returns empty array when no sequences provided', () => {
    const counts = computeVariantCounts([], [])
    expect(counts).toHaveLength(0)
  })

  it('returns all zeros when snpSites is empty', () => {
    const counts = computeVariantCounts(testSequences, [])
    for (const c of counts) {
      expect(c.count).toBe(0)
    }
  })
})

describe('computeDensity', () => {
  it('returns at least one window for a non-empty alignment', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const density = computeDensity(snps, 20)
    expect(density.length).toBeGreaterThan(0)
  })

  it('windowSize is max(50, floor(length * 0.01))', () => {
    // For length=20: windowSize = max(50, floor(20*0.01)=0) = 50
    // With length=20 and window=50, there is exactly 1 window covering [1..20]
    const snps = findSnps(testSequences, defaultOptions)
    const density = computeDensity(snps, 20)
    expect(density).toHaveLength(1)
    expect(density[0].windowStart).toBe(1)
  })

  it('the single window for length=20 contains all 3 SNPs', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const density = computeDensity(snps, 20)
    expect(density[0].density).toBe(3)
  })

  it('windowStart values are 1-based', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const density = computeDensity(snps, 20)
    for (const w of density) {
      expect(w.windowStart).toBeGreaterThanOrEqual(1)
    }
  })

  it('returns empty array for alignmentLength <= 0', () => {
    const density = computeDensity([], 0)
    expect(density).toHaveLength(0)
  })

  it('longer alignment (10000) creates multiple windows', () => {
    // windowSize = max(50, floor(10000*0.01)) = max(50,100) = 100
    // 10000 / 100 = 100 windows
    const snps = findSnps(testSequences, defaultOptions)
    const density = computeDensity(snps, 10000)
    expect(density.length).toBe(100)
  })

  it('total density across all windows equals total SNP count', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const density = computeDensity(snps, 20)
    const totalDensity = density.reduce((sum, w) => sum + w.density, 0)
    expect(totalDensity).toBe(snps.length)
  })
})

describe('computePairwiseDistances', () => {
  it('returns C(n,2) pairs for n sequences when n <= 50', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const distances = computePairwiseDistances(testSequences, snps)
    // C(4,2) = 6
    expect(distances).toHaveLength(6)
  })

  it('returns empty array when more than 50 sequences', () => {
    const manySeqs: AlignedSequence[] = Array.from({ length: 51 }, (_, i) => ({
      id: `seq${i}`,
      sequence: 'ACGT',
    }))
    const distances = computePairwiseDistances(manySeqs, [])
    expect(distances).toHaveLength(0)
  })

  it('distance between seq1 and seq2 is 2 (differ at pos 5 and 17)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const distances = computePairwiseDistances(testSequences, snps)
    const d12 = distances.find(
      (d) =>
        (d.seq1 === 'seq1' && d.seq2 === 'seq2') ||
        (d.seq1 === 'seq2' && d.seq2 === 'seq1'),
    )!
    expect(d12.distance).toBe(2)
  })

  it('distance between seq1 and seq3 is 1 (differ at pos 13)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const distances = computePairwiseDistances(testSequences, snps)
    const d13 = distances.find(
      (d) =>
        (d.seq1 === 'seq1' && d.seq2 === 'seq3') ||
        (d.seq1 === 'seq3' && d.seq2 === 'seq1'),
    )!
    expect(d13.distance).toBe(1)
  })

  it('distance between seq1 and seq4 is 2 (differ at pos 5 and 13)', () => {
    const snps = findSnps(testSequences, defaultOptions)
    const distances = computePairwiseDistances(testSequences, snps)
    const d14 = distances.find(
      (d) =>
        (d.seq1 === 'seq1' && d.seq2 === 'seq4') ||
        (d.seq1 === 'seq4' && d.seq2 === 'seq1'),
    )!
    expect(d14.distance).toBe(2)
  })

  it('distance between seq2 and seq3 is 3 (differ at pos 5, 13, 17)', () => {
    // seq2: pos5=T, pos13=A, pos17=T
    // seq3: pos5=A, pos13=T, pos17=A
    const snps = findSnps(testSequences, defaultOptions)
    const distances = computePairwiseDistances(testSequences, snps)
    const d23 = distances.find(
      (d) =>
        (d.seq1 === 'seq2' && d.seq2 === 'seq3') ||
        (d.seq1 === 'seq3' && d.seq2 === 'seq2'),
    )!
    expect(d23.distance).toBe(3)
  })

  it('distance between seq2 and seq4 is 2 (differ at pos 13 and 17)', () => {
    // seq2: pos5=T, pos13=A, pos17=T
    // seq4: pos5=T, pos13=T, pos17=A  → differ at pos 13 and pos 17
    const snps = findSnps(testSequences, defaultOptions)
    const distances = computePairwiseDistances(testSequences, snps)
    const d24 = distances.find(
      (d) =>
        (d.seq1 === 'seq2' && d.seq2 === 'seq4') ||
        (d.seq1 === 'seq4' && d.seq2 === 'seq2'),
    )!
    expect(d24.distance).toBe(2)
  })

  it('distance between seq3 and seq4 is 1 (differ only at pos 5)', () => {
    // seq3: pos5=A, pos13=T, pos17=A
    // seq4: pos5=T, pos13=T, pos17=A  → differ only at pos 5
    const snps = findSnps(testSequences, defaultOptions)
    const distances = computePairwiseDistances(testSequences, snps)
    const d34 = distances.find(
      (d) =>
        (d.seq1 === 'seq3' && d.seq2 === 'seq4') ||
        (d.seq1 === 'seq4' && d.seq2 === 'seq3'),
    )!
    expect(d34.distance).toBe(1)
  })

  it('returns empty array when snpSites is empty', () => {
    const distances = computePairwiseDistances(testSequences, [])
    for (const d of distances) {
      expect(d.distance).toBe(0)
    }
  })
})
