import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import {
  FiArrowRight,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiMessageSquare,
  FiPlay,
  FiUsers,
  FiZap,
} from 'react-icons/fi'

const features = [
  {
    icon: FiZap,
    number: '01',
    title: 'Real-time Milestone Approvals',
    description: 'Clients approve deliverables in one click, so your team always knows what is unblocked and ready to ship.',
  },
  {
    icon: FiFileText,
    number: '02',
    title: 'Centralized Project Hub',
    description: 'Keep Figma links, repositories, briefs, and timelines in one shared source of truth for every engagement.',
  },
  {
    icon: FiMessageSquare,
    number: '03',
    title: 'Client Feedback Loop',
    description: 'Turn scattered review notes into structured decisions without another endless email chain.',
  },
]

const plans = [
  { name: 'Starter', prices: { USD: '$29', INR: '₹1,999' }, description: 'For focused solo operators.', features: ['Up to 3 Clients', 'Milestone Approvals', 'Shared Vault', 'Live Activity Feed'] },
  { name: 'Agency Pro', prices: { USD: '$79', INR: '₹4,999' }, description: 'For teams building repeatable trust.', popular: true, features: ['Unlimited Clients', 'Priority Loops', 'Custom Branding', 'Activity Reports'] },
  { name: 'Enterprise', prices: { USD: '$199', INR: '₹15,499' }, description: 'For multi-team operations at scale.', features: ['White-label portal', 'Multiple PM seats', 'Custom Domain', 'Dedicated Support'] },
]

function ProductPreview() {
  return (
    <div className="landing-preview-wrap" id="live-demo">
      <div className="preview-badge"><span className="preview-pulse" /> LIVE CLIENT VIEW</div>
      <div className="landing-preview">
        <div className="preview-sidebar"><div className="preview-logo">S<span>/</span>V</div><span className="preview-sidebar-line active" /><span className="preview-sidebar-line" /><span className="preview-sidebar-line" /><div className="preview-avatar">A</div></div>
        <div className="preview-main">
          <div className="preview-toolbar"><span>CLIENT PORTAL / NORTHSTAR</span><FiExternalLink /></div>
          <div className="preview-heading"><div><span className="preview-kicker">ACTIVE PROJECT</span><h3>Brand system refresh</h3></div><span className="preview-status">IN PROGRESS</span></div>
          <div className="preview-progress-row"><span>Overall progress</span><strong>68%</strong></div>
          <div className="preview-progress"><span /></div>
          <div className="preview-cards"><div><FiClock /><small>NEXT MILESTONE</small><strong>Homepage review</strong><span>Due Oct 24</span></div><div><FiUsers /><small>PROJECT TEAM</small><strong>4 collaborators</strong><span>All aligned</span></div></div>
          <div className="preview-timeline"><div className="preview-line" /><div className="preview-milestone done"><i><FiCheck /></i><span><b>Creative direction</b><small>Approved yesterday</small></span></div><div className="preview-milestone"><i>02</i><span><b>Homepage review</b><small>Awaiting your approval</small></span><button><FiChevronRight /></button></div></div>
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  const [currency, setCurrency] = useState('USD')

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link className="landing-logo" to="/"><span>S</span>ync<span>V</span>ault</Link>
        <div className="landing-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a></div>
        <div className="landing-actions"><Link className="landing-login" to="/login">Login</Link><Link className="landing-nav-cta" to="/register">Get started <FiArrowRight /></Link></div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy"><div className="hero-kicker"><span>◆</span> THE CLIENT EXPERIENCE LAYER</div><h1>The transparent client portal for <em>modern</em> high-ticket agencies.</h1><p>Replace messy Slack and email threads with real-time milestone approvals, clear project progress, and a client experience that makes your work easier to say yes to.</p><div className="hero-actions"><Link className="landing-primary-cta" to="/register">Start free trial <FiArrowRight /></Link><a className="landing-demo-cta" href="#how-it-works"><span><FiPlay /></span> View client demo</a></div><div className="hero-proof"><div className="proof-avatars"><span>J</span><span>M</span><span>R</span><span>+</span></div><p><strong>Trusted by 240+ teams</strong><br />shipping clearer client work</p></div></div>
        <ProductPreview />
      </section>

      <section className="logo-strip"><span>BUILT FOR TEAMS WHO CARE ABOUT</span><strong>THE HANDOFF</strong><i /><strong>THE FOLLOW-THROUGH</strong><i /><strong>THE NEXT YES</strong></section>

      <section className="landing-section features-section" id="features"><div className="section-intro"><div><span className="landing-overline">ONE SHARED REALITY</span><h2>Make every project<br /><em>feel under control.</em></h2></div><p>SyncVault gives ambitious agencies a polished place to turn progress into confidence. Less reporting. More momentum.</p></div><div className="landing-feature-grid">{features.map(({ icon: Icon, number, title, description }) => <article className="landing-feature" key={number}><div className="feature-top"><span className="feature-icon"><Icon /></span><span className="feature-number">{number}</span></div><h3>{title}</h3><p>{description}</p><span className="feature-arrow"><FiArrowRight /></span></article>)}</div></section>

      <section className="landing-section workflow-section" id="how-it-works"><div className="workflow-label"><span className="landing-overline">HOW IT WORKS</span><span className="workflow-rule" /></div><div className="workflow-grid"><div><h2>Move from<br /><em>“where are we?”</em><br />to “ship it.”</h2><Link className="text-link" to="/register">See SyncVault in action <FiArrowRight /></Link></div><div className="workflow-steps"><div><span>01</span><div><h3>Set the room</h3><p>Give every client one calm, branded home for the work.</p></div></div><div><span>02</span><div><h3>Show the progress</h3><p>Make milestones, deliverables, and decisions impossible to miss.</p></div></div><div><span>03</span><div><h3>Get the green light</h3><p>Collect feedback and approvals without chasing a thread.</p></div></div></div></div></section>

      <section className="landing-section pricing-section" id="pricing"><div className="pricing-heading"><div><span className="landing-overline">SIMPLE, SERIOUS PRICING</span><h2>Choose your next<br /><em>operating advantage.</em></h2></div><div className="pricing-side"><p>Start small. Make trust visible. Scale when the work demands it.</p><div className="billing-toggle" role="group" aria-label="Billing currency"><button className={currency === 'USD' ? 'active' : ''} type="button" onClick={() => setCurrency('USD')}>Billing in USD ($)</button><button className={currency === 'INR' ? 'active' : ''} type="button" onClick={() => setCurrency('INR')}>Billing in INR (₹)</button></div></div></div><div className="pricing-grid">{plans.map((plan) => <article className={`price-card ${plan.popular ? 'popular' : ''}`} key={plan.name}>{plan.popular && <div className="popular-tag">MOST POPULAR</div>}<span className="price-plan">{plan.name}</span><h3>{plan.prices[currency]}<small>/mo</small></h3><p>{plan.description}</p><div className="price-rule" /> <ul>{plan.features.map((feature) => <li key={feature}><FiCheck /> {feature}</li>)}</ul><Link className={plan.popular ? 'landing-primary-cta' : 'price-cta'} to="/register">Choose plan <FiArrowRight /></Link></article>)}</div></section>

      <section className="landing-closer"><div><span className="landing-overline">READY WHEN YOU ARE</span><h2>Your best client<br /><em>experience starts here.</em></h2></div><Link className="landing-primary-cta" to="/register">Start free trial <FiArrowRight /></Link></section>

      <Footer />
    </main>
  )
}

export default LandingPage
