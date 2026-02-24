import { useEffect, useRef, useState } from 'react'

export interface LogConsoleProps {
  lines: string[]
}

export function LogConsole({ lines }: LogConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (lines.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lines])

  if (lines.length === 0) return null

  function handleCopy() {
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const padWidth = String(lines.length).length

  return (
    <section className="log-console">
      <div className="log-header">
        <span className="log-title">Log</span>
        <span className="log-count">{lines.length}</span>
        <button className="log-copy-button" onClick={handleCopy} type="button">
          {copied ? 'Copied!' : 'Copy Log'}
        </button>
      </div>
      <div className="log-body">
        {lines.map((line, idx) => (
          <div key={idx} className="log-line">
            <span className="log-index">{String(idx + 1).padStart(padWidth, ' ')}</span>
            {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </section>
  )
}
