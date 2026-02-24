import React, { useRef, useState } from 'react'

export interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled: boolean
}

const ACCEPTED_EXTENSIONS = ['.fasta', '.fa', '.fna', '.aln', '.fas', '.fasta.gz', '.fa.gz']

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_EXTENSIONS.some((ext) => file.name.endsWith(ext))
}

export function FileUpload({ files, onFilesChange, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return
    const accepted = Array.from(incoming).filter(isAcceptedFile)
    if (accepted.length > 0) {
      onFilesChange([...files, ...accepted])
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div className="file-upload">
      <div
        className={`file-upload-area${isDragging ? ' file-upload-area--dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload alignment files"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick()
        }}
      >
        <div className="file-upload-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </div>
        <span className="file-upload-label">
          {disabled ? 'Processing…' : 'Drop alignment files here or click to browse'}
        </span>
        <span className="file-upload-hint">
          Accepted: .fasta, .fa, .fna, .aln, .fas, .fasta.gz, .fa.gz
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".fasta,.fa,.fna,.aln,.fas,.gz"
          multiple
          disabled={disabled}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          aria-label="Upload alignment files"
        />
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, idx) => (
            <li key={`${file.name}-${idx}`}>
              <span>{file.name}</span>
              <span>{(file.size / 1024).toFixed(1)} KB</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
