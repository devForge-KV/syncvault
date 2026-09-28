import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiArrowRight, FiBriefcase, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi'
import Footer from '../components/Footer'
import api, { getApiError } from '../utils/api'

function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('client')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: '', email: '', companyName: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (form) => {
    setError('')

    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        role,
      })
      const user = data.user || { role }
      localStorage.setItem('syncvault_token', data.token)
      localStorage.setItem('syncvault_user', JSON.stringify(user))
      navigate(role === 'agency' ? '/dashboard' : '/portal', { replace: true })
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to create your account.'))
    }
  }

  return (
    <>
    <main className="auth-page register-page">
      <section className="auth-intro">
        <div className="brand-mark">S<span>/</span>V</div>
        <p className="eyebrow">BUILD THE RELATIONSHIP</p>
        <h1>Less chasing.<br />More making.</h1>
        <p className="intro-copy">Bring briefs, milestones, feedback, and momentum into one calm place.</p>
        <div className="stat-strip"><strong>01</strong><span>workspace<br />for every handoff</span></div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand brand-mark">S<span>/</span>V</div>
          <p className="eyebrow">GET STARTED</p>
          <h2>Create your workspace</h2>
          <p className="form-subtitle">Set up your profile in less than a minute.</p>

          <div className="role-toggle" aria-label="Account type">
            <button type="button" className={role === 'client' ? 'active' : ''} onClick={() => setRole('client')}><FiUser /> Client</button>
            <button type="button" className={role === 'agency' ? 'active' : ''} onClick={() => setRole('agency')}><FiBriefcase /> Agency</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <label className="field-label" htmlFor="name">Full name</label>
            <div className="input-wrap"><FiUser /><input id="name" placeholder="Alex Morgan" autoComplete="name" {...register('name', { required: 'Full name is required' })} /></div>
            {errors.name && <p className="field-error">{errors.name.message}</p>}
            <label className="field-label" htmlFor="register-email">Work email</label>
            <div className="input-wrap"><FiMail /><input id="register-email" type="email" placeholder="you@company.com" autoComplete="email" {...register('email', { required: 'Work email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } })} /></div>
            {errors.email && <p className="field-error">{errors.email.message}</p>}
            <label className="field-label" htmlFor="companyName">Company name <span>(optional)</span></label>
            <div className="input-wrap"><FiBriefcase /><input id="companyName" placeholder="Northstar Studio" autoComplete="organization" {...register('companyName')} /></div>
            <label className="field-label" htmlFor="register-password">Password</label>
            <div className="input-wrap"><FiLock /><input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" autoComplete="new-password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })} /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
            <label className="field-label" htmlFor="confirm-password">Confirm Password</label>
            <div className="input-wrap"><FiLock /><input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter your password" autoComplete="new-password" {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === watch('password') || 'Passwords do not match' })} /><button className="password-toggle" type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <FiEyeOff /> : <FiEye />}</button></div>
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
            <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating workspace...' : 'Create workspace'} <FiArrowRight /></button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}

export default Register
