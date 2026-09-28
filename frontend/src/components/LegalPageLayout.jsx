import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Footer from './Footer'

function LegalPageLayout({ eyebrow = 'LEGAL & COMPLIANCE', title, summary, children }) {
  return (
    <div className="legal-shell">
      <header className="legal-topbar">
        <Link className="legal-brand" to="/"><span>S<span>/</span>V</span> SyncVault</Link>
        <nav aria-label="Main navigation">
          <Link to="/#features">Product</Link>
          <Link to="/#pricing">Pricing</Link>
          <Link to="/contact">Support</Link>
        </nav>
        <Link className="legal-home-link" to="/"><FiArrowLeft /> Back to SyncVault</Link>
      </header>
      <main className="legal-page">
        <div className="legal-heading">
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{summary}</p>
          <span className="legal-updated">Last updated September 28, 2026</span>
        </div>
        <article className="legal-copy">{children}</article>
        <div className="legal-contact-line">Questions about this policy? <Link to="/contact">Contact our team <FiArrowRight /></Link></div>
      </main>
      <Footer />
    </div>
  )
}

export default LegalPageLayout