import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiEye, FiEyeOff, FiLock } from 'react-icons/fi'
import Footer from '../components/Footer'
import { useForm } from 'react-hook-form'
import api, { getApiError } from '../utils/api'

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { password: '', confirmPassword: '' } })

  const onSubmit = async ({ password }) => {
    setError('')
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password })
      localStorage.setItem('syncvault_token', data.token)
      localStorage.setItem('syncvault_user', JSON.stringify(data.user))
      navigate(data.user.role === 'superadmin' ? '/admin' : data.user.role === 'agency' ? '/dashboard' : '/portal', { replace: true })
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to reset your password.'))
    }
  }

  return (
    <>
    <main className="auth-page auth-page-single">
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-brand brand-mark">S<span>/</span>V</div>
          <p className="eyebrow">SECURE ACCESS</p>
          <h2>Set a new password</h2>
          <p className="form-subtitle">Choose a strong password for your SyncVault workspace.</p>
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <label className="field-label" htmlFor="reset-password">New password</label>
            <div className="input-wrap"><FiLock /><input id="reset-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })} /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
            <label className="field-label" htmlFor="reset-confirm-password">Confirm password</label>
            <div className="input-wrap"><FiLock /><input id="reset-confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your password" {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === watch('password') || 'Passwords do not match' })} /><button className="password-toggle" type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <FiEyeOff /> : <FiEye />}</button></div>
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
            <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Reset password'} <FiArrowRight /></button>
          </form>
          <p className="auth-switch"><Link to="/login"><FiArrowLeft /> Back to sign in</Link></p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}

export default ResetPassword
