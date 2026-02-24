import type { AlignedSequence } from './types'

/**
 * Reads all bytes from a ReadableStream<Uint8Array> and returns them
 * concatenated as a single Uint8Array.
 */
async function readStream(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let totalLength = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    totalLength += value.length
  }

  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

/**
 * Parse raw text in FASTA format and return aligned sequences.
 * Validates that all sequences have equal length.
 */
function parseFastaText(text: string): AlignedSequence[] {
  const lines = text.split(/\r?\n/)
  const sequences: AlignedSequence[] = []
  let currentId: string | null = null
  let currentSeqParts: string[] = []

  const flush = () => {
    if (currentId !== null) {
      const seq = currentSeqParts.join('').replace(/\s+/g, '').toUpperCase()
      sequences.push({ id: currentId, sequence: seq })
      currentId = null
      currentSeqParts = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    if (trimmed.startsWith('>')) {
      flush()
      currentId = trimmed.slice(1).trim()
    } else {
      if (currentId === null) {
        throw new Error('Invalid FASTA format: sequence data found before any header line')
      }
      currentSeqParts.push(trimmed)
    }
  }
  flush()

  if (sequences.length < 2) {
    throw new Error(
      `FASTA file must contain at least 2 sequences, found ${sequences.length}`,
    )
  }

  const expectedLen = sequences[0].sequence.length
  for (const seq of sequences) {
    if (seq.sequence.length !== expectedLen) {
      throw new Error(
        `Alignment length mismatch: sequence "${seq.id}" has length ${seq.sequence.length}` +
          ` but expected ${expectedLen} (length of first sequence "${sequences[0].id}").` +
          ' All sequences in a multiple alignment must be the same length.',
      )
    }
  }

  if (expectedLen === 0) {
    throw new Error('Sequences must have at least one character')
  }

  return sequences
}

/**
 * Parse a FASTA or gzipped FASTA File object.
 *
 * - Accepts `.gz` files and decompresses with DecompressionStream('gzip').
 * - Supports multi-line sequences.
 * - Validates equal-length alignment (required for SNP analysis).
 * - Returns at least 2 AlignedSequence objects.
 */
export async function parseFasta(file: File): Promise<AlignedSequence[]> {
  const isGzip = file.name.endsWith('.gz')

  let text: string

  if (isGzip) {
    const rawStream = file.stream() as ReadableStream<Uint8Array>
    const decompressedStream = rawStream.pipeThrough(
      new DecompressionStream('gzip'),
    )
    const bytes = await readStream(decompressedStream)
    text = new TextDecoder('utf-8').decode(bytes)
  } else {
    text = await file.text()
  }

  return parseFastaText(text)
}
