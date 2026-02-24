import { saveAs } from 'file-saver'
import { SnpResult } from '../snpsitesx/types'

export interface ResultsExportProps {
  result: SnpResult
  exportVcf: boolean
  exportPhylip: boolean
  exportFasta: boolean
  onExportVcfChange: (v: boolean) => void
  onExportPhylipChange: (v: boolean) => void
  onExportFastaChange: (v: boolean) => void
}

interface FormatDef {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  content: string
  filename: string
}

export function ResultsExport({
  result,
  exportVcf,
  exportPhylip,
  exportFasta,
  onExportVcfChange,
  onExportPhylipChange,
  onExportFastaChange,
}: ResultsExportProps) {
  const formats: FormatDef[] = [
    {
      label: 'VCF',
      checked: exportVcf,
      onChange: onExportVcfChange,
      content: result.vcfOutput,
      filename: 'snp-sitesx.vcf',
    },
    {
      label: 'Phylip',
      checked: exportPhylip,
      onChange: onExportPhylipChange,
      content: result.phylipOutput,
      filename: 'snp-sitesx.phy',
    },
    {
      label: 'SNP-FASTA',
      checked: exportFasta,
      onChange: onExportFastaChange,
      content: result.fastaOutput,
      filename: 'snp-sitesx.fasta',
    },
  ]

  const anyChecked = exportVcf || exportPhylip || exportFasta

  function handleDownload() {
    for (const fmt of formats) {
      if (fmt.checked) {
        saveAs(new Blob([fmt.content], { type: 'text/plain' }), fmt.filename)
      }
    }
  }

  return (
    <section className="results-export">
      <div className="options-group">
        <span className="options-label">Export Formats</span>
        {formats.map(({ label, checked, onChange }) => (
          <label key={label} className="checkbox-label">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
      {anyChecked && (
        <button className="download-button" onClick={handleDownload} type="button">
          Download
        </button>
      )}
    </section>
  )
}
