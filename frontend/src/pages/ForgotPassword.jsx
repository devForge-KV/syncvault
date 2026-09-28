import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiMail } from 'react-icons/fi'
import Footer from '../components/Footer'
import { useForm } from 'react-hook-form'
import api, { getApiError } from '../utils/api'

function ForgotPassword() {
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resetLink, setResetLink] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: '' } })

  const onSubmit = async ({ email }) => {
    setError('')
    setMessage('')
    setResetLink('')
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setMessage(data.message)
      setResetLink(data.resetLink || '')
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to start password reset.'))
    }
  }

  return (
    <>
    <main className="auth-page auth-page-single">
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand brand-mark">S<span>/</span>V</div>
          <p className="eyebrow">ACCOUNT RECOVERY</p>
          <h2>Forgot your password?</h2>
          <p className="form-subtitle">Enter your work email and we&apos;ll send a secure reset link.</p>
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && <div className="form-alert" role="alert">{error}</div>}
            {message && <div className="form-success" role="status">{message}{resetLink && <><br /><a href={resetLink}>Open reset link</a></>}</div>}
            <label className="field-label" htmlFor="forgot-email">Work email</label>
            <div className="input-wrap"><FiMail /><input id="forgot-email" type="email" placeholder="you@company.com" autoComplete="email" {...register('email', { required: 'Work email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } })} /></div>
            {errors.email && <p className="field-error">{errors.email.message}</p>}
            <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send reset link'} <FiArrowRight /></button>
          </form>
          <p className="auth-switch"><Link to="/login"><FiArrowLeft /> Back to sign in</Link></p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}

export default ForgotPassword
