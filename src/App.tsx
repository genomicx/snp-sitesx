import { useState, useEffect, useCallback } from 'react'
import { FileUpload } from './components/FileUpload'
import { OptionsPanel } from './components/OptionsPanel'
import { SummaryCards } from './components/SummaryCards'
import { SnpPositionPlot } from './components/SnpPositionPlot'
import { SnpDensityChart } from './components/SnpDensityChart'
import { NucleotideFreqChart } from './components/NucleotideFreqChart'
import { PerSequenceChart } from './components/PerSequenceChart'
import { PairwiseHeatmap } from './components/PairwiseHeatmap'
import { ResultsExport } from './components/ResultsExport'
import { LogConsole } from './components/LogConsole'
import { AboutPage } from './components/AboutPage'
import { runSnpSitesx } from './snpsitesx/pipeline'
import { DEFAULT_OPTIONS } from './snpsitesx/types'
import type { SnpResult, SnpOptions } from './snpsitesx/types'
import './App.css'

type Theme = 'light' | 'dark'
type View = 'analysis' | 'about'

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [options, setOptions] = useState<SnpOptions>(DEFAULT_OPTIONS)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [error, setError] = useState('')
  const [logLines, setLogLines] = useState<string[]>([])
  const [result, setResult] = useState<SnpResult | null>(null)

  // Export format toggles
  const [exportVcf, setExportVcf] = useState(true)
  const [exportPhylip, setExportPhylip] = useState(false)
  const [exportFasta, setExportFasta] = useState(true)

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('gx-theme') as Theme) || 'dark'
  })
  const [currentView, setCurrentView] = useState<View>('analysis')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gx-theme', theme)
  }, [theme])

  const handleRun = useCallback(async () => {
    if (files.length === 0) return
    setRunning(true)
    setError('')
    setResult(null)
    setLogLines([])
    setProgress('Starting...')
    setProgressPct(0)

    try {
      const res = await runSnpSitesx(
        files,
        options,
        (msg, pct) => { setProgress(msg); setProgressPct(pct) },
        (msg) => { setLogLines(prev => [...prev, msg]) },
      )
      setResult(res)
      setProgress('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setRunning(false)
    }
  }, [files, options])

  const canRun = files.length > 0 && !running

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>snp-sitesx</h1>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '\u263E' : '\u2600'}
          </button>
        </div>
        <p className="subtitle">SNP Site Extraction from Alignments</p>
        <nav className="tab-bar">
          <button className={`tab ${currentView === 'analysis' ? 'tab-active' : ''}`} onClick={() => setCurrentView('analysis')}>Analysis</button>
          <button className={`tab ${currentView === 'about' ? 'tab-active' : ''}`} onClick={() => setCurrentView('about')}>About</button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'analysis' ? (
          <>
            <div className="controls">
              <FileUpload files={files} onFilesChange={setFiles} disabled={running} />
              <OptionsPanel options={options} onChange={setOptions} disabled={running} />
            </div>

            <button className="run-button" onClick={handleRun} disabled={!canRun}>
              {running ? 'Running...' : 'Extract SNPs'}
            </button>

            {running && (
              <section className="progress" aria-live="polite">
                <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="progress-text">{progress}</p>
              </section>
            )}

            {error && (
              <section className="error" role="alert">
                <p>{error}</p>
              </section>
            )}

            {result && (
              <>
                <SummaryCards result={result} />
                <div className="charts-grid">
                  <SnpPositionPlot snpSites={result.snpSites} allSites={result.allSites} />
                  <SnpDensityChart densityData={result.densityData} allSites={result.allSites} />
                  <NucleotideFreqChart snpSites={result.snpSites} />
                  <PerSequenceChart variantCounts={result.variantCounts} />
                  <PairwiseHeatmap pairwiseDistances={result.pairwiseDistances} sequences={result.sequences} />
                </div>
                <ResultsExport
                  result={result}
                  exportVcf={exportVcf}
                  exportPhylip={exportPhylip}
                  exportFasta={exportFasta}
                  onExportVcfChange={setExportVcf}
                  onExportPhylipChange={setExportPhylip}
                  onExportFastaChange={setExportFasta}
                />
              </>
            )}

            {logLines.length > 0 && <LogConsole lines={logLines} />}
          </>
        ) : (
          <AboutPage />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <span>GenomicX &mdash; open-source bioinformatics for the browser</span>
          <div className="footer-links">
            <a href="https://github.com/genomicx" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://genomicx.vercel.app/about" target="_blank" rel="noopener noreferrer">Mission</a>
            <a href="https://www.happykhan.com/" target="_blank" rel="noopener noreferrer">Nabil-Fareed Alikhan</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
