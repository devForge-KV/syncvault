import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiShield } from 'react-icons/fi'
import Footer from '../components/Footer'
import api, { getApiError } from '../utils/api'

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (form) => {
    setError('')

    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('syncvault_token', data.token)
      const user = data.user || { role: data.role }
      localStorage.setItem('syncvault_user', JSON.stringify(user))
      if (user.role === 'superadmin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'agency') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/portal', { replace: true })
      }
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to sign in with those details.'))
    }
  }

  return (
    <>
    <main className="auth-page">
      <section className="auth-intro">
        <div className="brand-mark">S<span>/</span>V</div>
        <p className="eyebrow">SYNCVAULT / CLIENT OPERATIONS</p>
        <h1>Work that stays in sync.</h1>
        <p className="intro-copy">One clear workspace for agencies and the clients who move projects forward together.</p>
        <div className="intro-signal"><FiShield /> <span>Private workspace access</span></div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand brand-mark">S<span>/</span>V</div>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to SyncVault</h2>
          <p className="form-subtitle">Pick up exactly where your team left off.</p>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <label className="field-label" htmlFor="email">Work email</label>
            <div className="input-wrap">
              <FiMail />
              <input id="email" type="email" placeholder="you@company.com" autoComplete="email" {...register('email', { required: 'Work email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' } })} />
            </div>
            {errors.email && <p className="field-error">{errors.email.message}</p>}
            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <FiLock />
              <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
            <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'} <FiArrowRight />
            </button>
          </form>
          <p className="auth-switch">New to SyncVault? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}

export default Login
