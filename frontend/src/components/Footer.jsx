import { FiArrowUpRight, FiMail } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="syncvault-footer">
      <div className="syncvault-footer-main">
        <div className="syncvault-footer-brand">
          <Link className="syncvault-footer-logo" to="/"><span className="syncvault-footer-mark">S<span>/</span>V</span><span>SyncVault</span></Link>
          <p>The transparent client management portal for modern high-ticket agencies.</p>
        </div>
        <nav className="syncvault-footer-column" aria-label="Product links">
          <h2>Product</h2>
          <a href="/#features">Features <FiArrowUpRight /></a>
          <a href="/#pricing">Pricing <FiArrowUpRight /></a>
          <a href="/#live-demo">Live Demo <FiArrowUpRight /></a>
        </nav>
        <nav className="syncvault-footer-column" aria-label="Legal and compliance links">
          <h2>Legal &amp; Compliance</h2>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/refund">Refund Policy</Link>
          <Link to="/contact">Contact &amp; Support</Link>
        </nav>
      </div>
      <div className="syncvault-footer-bottom">
        <span>© 2026 SyncVault. All rights reserved.</span>
        <a className="syncvault-support-badge" href="mailto:support@syncvault.com"><FiMail /> support@syncvault.com</a>
      </div>
    </footer>
  )
}

export default Footer