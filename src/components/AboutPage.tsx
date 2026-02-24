export function AboutPage() {
  return (
    <div className="about-page">
      <h1>snp-sitesx</h1>
      <p>
        A browser-based tool that extracts SNP sites from multi-FASTA alignments, replicating
        snp-sites by Sanger Pathogens.
      </p>

      <div className="privacy-note">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>
          No data leaves your machine — all processing happens client-side in your browser.
        </span>
      </div>

      <section>
        <h2>References</h2>
        <p>
          Page, A.J. et al. (2016). SNP-sites: rapid efficient extraction of SNPs from
          multi-FASTA alignments. <em>Microbial Genomics</em>.{' '}
          <a
            href="https://doi.org/10.1099/mgen.0.000056"
            target="_blank"
            rel="noopener noreferrer"
          >
            doi:10.1099/mgen.0.000056
          </a>
        </p>
      </section>

      <section>
        <h2>Author</h2>
        <p>Nabil-Fareed Alikhan</p>
        <div className="about-links">
          <a href="https://happykhan.com" target="_blank" rel="noopener noreferrer">
            happykhan.com
          </a>
          <a
            href="https://orcid.org/0000-0002-4465-174X"
            target="_blank"
            rel="noopener noreferrer"
          >
            ORCID
          </a>
          <a href="mailto:nabil@happykhan.com">Email</a>
          <a
            href="https://twitter.com/happykhan"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <a
            href="https://genomic.social/@happykhan"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mastodon
          </a>
        </div>
      </section>
    </div>
  )
}
