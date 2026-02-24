import { SnpOptions } from '../snpsitesx/types'

export interface OptionsPanelProps {
  options: SnpOptions
  onChange: (opts: SnpOptions) => void
  disabled: boolean
}

interface CheckboxDef {
  label: string
  key: keyof SnpOptions
}

const CHECKBOXES: CheckboxDef[] = [
  { label: 'Include reference sequence', key: 'includeRef' },
  { label: 'ACGT only (filter ambiguous bases)', key: 'onlyAcgt' },
  { label: 'Include monomorphic sites (BEAST)', key: 'includeMonomorphic' },
]

export function OptionsPanel({ options, onChange, disabled }: OptionsPanelProps) {
  function handleChange(key: keyof SnpOptions, checked: boolean) {
    onChange({ ...options, [key]: checked })
  }

  return (
    <section className="options-panel">
      <div className="options-group">
        <span className="options-label">SNP Options</span>
        {CHECKBOXES.map(({ label, key }) => (
          <label key={key} className="checkbox-label">
            <input
              type="checkbox"
              checked={options[key]}
              disabled={disabled}
              onChange={(e) => handleChange(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
    </section>
  )
}
