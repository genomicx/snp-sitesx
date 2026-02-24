# snp-sitesx — CLAUDE.md

## About

snp-sitesx is a GenomicX browser-based bioinformatics app that replicates [snp-sites](https://github.com/sanger-pathogens/snp-sites) (Sanger Pathogens). It extracts SNP sites from multi-FASTA alignments client-side. Pure TypeScript — no WASM.

## Dev Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # tsc -b && vite build
npm run test      # vitest run (unit tests)
npm run check     # vitest run && eslint . && npm run build
```

## Architecture

### Core Logic (`src/snpsitesx/`)

| File | Purpose |
|------|---------|
| `types.ts` | AlignedSequence, SnpSite, SnpOptions, SnpResult interfaces |
| `parseFasta.ts` | Parse multi-FASTA (File object, .gz support via DecompressionStream) |
| `findSnps.ts` | Column-scan algorithm to find SNP sites |
| `formatVcf.ts` | Format VCF 4.2 output |
| `formatPhylip.ts` | Format relaxed Phylip output |
| `computeStats.ts` | Variant counts, density windows, pairwise distances |
| `pipeline.ts` | Async orchestration with progress/log callbacks |

### Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `FileUpload` | Drag-and-drop FASTA input |
| `OptionsPanel` | SNP options (include ref, ACGT only, monomorphic) |
| `SummaryCards` | Summary statistics cards |
| `SnpPositionPlot` | ScatterChart of SNP positions |
| `SnpDensityChart` | BarChart of SNP density per window |
| `NucleotideFreqChart` | Stacked BarChart of A/T/G/C frequency at SNP sites |
| `PerSequenceChart` | Horizontal BarChart — variants per sequence |
| `PairwiseHeatmap` | CSS-grid heatmap of pairwise distances (≤50 seqs) |
| `ResultsExport` | Download VCF / Phylip / FASTA buttons |
| `LogConsole` | Auto-scrolling log with copy button |
| `AboutPage` | Privacy note, references, author info |

## Key Conventions

- **GX design tokens** — all styles use `--gx-*` CSS custom properties from `src/index.css`
- **No WASM** — pure TypeScript computation
- **Recharts 2.x** — for all charts
- **file-saver** — for all file downloads
- **Theme** — light/dark via `data-theme` on `<html>`, persisted in `localStorage('gx-theme')`
- **Default theme** — dark

## Running Tests

```bash
npm run test
```

Unit tests are in `src/snpsitesx/*.test.ts`. Test data uses a minimal 4-sequence, 20-column FASTA with known SNP sites at positions 5, 13, and 17.

## Scaffold Reference

This app follows the Vite + React 18 pattern from the GenomicX app creator skill.
Reference: `~/.claude/skills/genomicx-app-creator/references/vite-scaffold.md`
