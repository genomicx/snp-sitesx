# snp-sitesx

**SNP Site Extraction from Alignments — in your browser.**

snp-sitesx is a privacy-first, client-side web tool that replicates the functionality of [snp-sites](https://github.com/sanger-pathogens/snp-sites) by Sanger Pathogens. Extract SNP sites from multi-FASTA alignments with interactive visualisations — no data leaves your machine.

Live app: [snp-sitesx.genomicx.org](https://snp-sitesx.genomicx.org)

## Features

- **VCF, Phylip, and SNP-FASTA export** — same outputs as the snp-sites CLI
- **SNP density and position visualisations** — interactive Recharts plots
- **Pairwise distance matrix** — heatmap for up to 50 sequences
- **Client-side** — all computation happens in your browser

## Replicates CLI flags

| CLI flag | Description |
|----------|-------------|
| `-v` | Include VCF in export (default on) |
| `-p` | Include Phylip in export |
| `-m` | Include SNP-FASTA in export (default on) |
| `-r` | Include reference sequence in outputs |
| `-c` | Only ACGT columns (filter ambiguous) |
| `-b` | Include monomorphic sites |

## Development

```bash
npm install
npm run dev       # Start dev server
npm run test      # Run unit tests
npm run check     # Type-check + lint + build
```

## Hosting

Cloudflare Pages publishes `dist` using Node 24. To deploy this direct-upload project:

```bash
npm install
npm run check
npx wrangler pages deploy dist --project-name snp-sitesx --branch main
```
The app has no server, workers, WASM assets or required environment secrets.
Its interface uses `@genomicx/ui` 0.10.1 with bundled IBM Plex fonts.

## Tech

- Vite + React 18 + TypeScript 5.6
- Recharts 2.x for visualisations
- Pure TypeScript SNP detection (no WASM)
- file-saver for downloads

## License

GPL-3.0-only — see [LICENSE](LICENSE)

## Author

[Nabil-Fareed Alikhan](https://www.happykhan.com) — [@happy_khan](https://twitter.com/happy_khan)
