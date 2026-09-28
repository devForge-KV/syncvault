import { useState } from 'react'
import { FiArrowUpRight, FiClock, FiMail, FiSend } from 'react-icons/fi'
import LegalPageLayout from '../../components/LegalPageLayout'

function ContactUs() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const message = String(form.get('message') || '').trim()
    const subject = encodeURIComponent(`SyncVault support request from ${name}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    setSubmitted(true)
    window.location.href = `mailto:support@syncvault.com?subject=${subject}&body=${body}`
  }

  return (
    <LegalPageLayout
      eyebrow="WE'RE HERE TO HELP"
      title="Contact & Support"
      summary="Talk with the SyncVault team about your workspace, subscription, or a technical issue."
    >
      <div className="contact-layout">
        <aside className="contact-card">
          <span className="contact-card-icon"><FiMail /></span>
          <p className="legal-eyebrow">DIRECT SUPPORT</p>
          <a className="contact-email" href="mailto:support@syncvault.com">support@syncvault.com <FiArrowUpRight /></a>
          <div className="contact-response"><FiClock /><p><strong>Response within 24 hours</strong><span>We respond to all agency inquiries and technical support requests within 24 hours.</span></p></div>
        </aside>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" autoComplete="name" placeholder="Your name" required />
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" placeholder="How can we help?" rows="5" required />
          <button className="contact-submit" type="submit"><FiSend /> {submitted ? 'Opening your email app…' : 'Send support request'}</button>
          <p className="contact-form-note">Your email app will open with your message ready to send.</p>
        </form>
      </div>
    </LegalPageLayout>
  )
}

export default ContactUs