import { useState } from 'react'
import { FiCheck, FiLock, FiUser, FiX } from 'react-icons/fi'
import api, { getApiError } from '../utils/api'

function WorkspaceSettingsModal({ user, projects, onClose, onUserUpdated }) {
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ name: user?.name || '', companyName: user?.companyName || '' })
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPlanUpdating, setIsPlanUpdating] = useState(false)

  const submitProfile = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)
    try {
      const { data } = await api.put('/auth/profile', profile)
      localStorage.setItem('syncvault_user', JSON.stringify(data.user))
      onUserUpdated(data.user)
      setMessage('Profile changes saved.')
    } catch (requestError) {
      setError(getApiError(requestError, 'Profile changes could not be saved.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitSecurity = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (security.newPassword !== security.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setIsSubmitting(true)
    try {
      const { data } = await api.put('/auth/profile', security)
      localStorage.setItem('syncvault_token', data.token)
      localStorage.setItem('syncvault_user', JSON.stringify(data.user))
      onUserUpdated(data.user)
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage('Password updated successfully.')
    } catch (requestError) {
      setError(getApiError(requestError, 'Password could not be updated.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (event, setter) => setter((current) => ({ ...current, [event.target.name]: event.target.value }))

  const switchPlan = async (plan) => {
    setError('')
    setMessage('')
    setIsPlanUpdating(true)
    try {
      const { data } = await api.put('/auth/update-plan', { plan })
      localStorage.setItem('syncvault_user', JSON.stringify(data.user))
      onUserUpdated(data.user)
      setMessage(`Plan switched to ${plan === 'agency_pro' ? 'Agency Pro' : 'Starter'}.`)
    } catch (requestError) {
      setError(getApiError(requestError, 'The plan could not be updated.'))
    } finally {
      setIsPlanUpdating(false)
    }
  }

  const planName = { starter: 'Starter', agency_pro: 'Agency Pro', enterprise: 'Enterprise' }[user?.plan] || 'Starter'
  const planUsage = user?.plan === 'starter' ? `${projects.length}/3 used` : 'Unlimited'

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="modal-card settings-modal">
        <div className="modal-header"><div><p className="eyebrow">WORKSPACE CONTROL</p><h2>Workspace Settings</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close settings"><FiX /></button></div>
        <div className="settings-tabs"><button className={tab === 'profile' ? 'active' : ''} type="button" onClick={() => { setTab('profile'); setError(''); setMessage('') }}><FiUser /> Profile Info</button><button className={tab === 'security' ? 'active' : ''} type="button" onClick={() => { setTab('security'); setError(''); setMessage('') }}><FiLock /> Security</button><button className={tab === 'plan' ? 'active' : ''} type="button" onClick={() => { setTab('plan'); setError(''); setMessage('') }}><FiCheck /> Plan Details</button></div>
        {message && <div className="form-success" role="status">{message}</div>}
        {error && <div className="form-alert" role="alert">{error}</div>}
        {tab === 'profile' && <form className="settings-form" onSubmit={submitProfile}><label className="field-label" htmlFor="settings-name">Name</label><input id="settings-name" name="name" value={profile.name} onChange={(event) => handleChange(event, setProfile)} required /><label className="field-label" htmlFor="settings-company">Company name</label><input id="settings-company" name="companyName" value={profile.companyName} onChange={(event) => handleChange(event, setProfile)} placeholder="Your studio or agency" /><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button></form>}
        {tab === 'security' && <form className="settings-form" onSubmit={submitSecurity}><label className="field-label" htmlFor="settings-current-password">Current Password</label><input id="settings-current-password" name="currentPassword" type="password" value={security.currentPassword} onChange={(event) => handleChange(event, setSecurity)} required /><label className="field-label" htmlFor="settings-new-password">New Password</label><input id="settings-new-password" name="newPassword" type="password" minLength="8" value={security.newPassword} onChange={(event) => handleChange(event, setSecurity)} required /><label className="field-label" htmlFor="settings-confirm-password">Confirm New Password</label><input id="settings-confirm-password" name="confirmPassword" type="password" minLength="8" value={security.confirmPassword} onChange={(event) => handleChange(event, setSecurity)} required /><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Password'}</button></form>}
        {tab === 'plan' && <div className="plan-details"><div className="current-plan-row"><span>Active plan</span><strong className="plan-badge">{planName} <span>({planUsage})</span></strong></div><div><span>Connected clients</span><strong>{new Set(projects.map((project) => project.clientId?._id || project.clientId)).size}</strong></div><div><span>Active projects</span><strong>{projects.filter((project) => project.status === 'active').length}</strong></div>{import.meta.env.DEV && <div className="plan-dev-switches"><span>Developer testing</span><div><button className="secondary-button" type="button" disabled={isPlanUpdating || user?.plan === 'agency_pro'} onClick={() => switchPlan('agency_pro')}>{isPlanUpdating ? 'Switching...' : 'Switch to Agency Pro (Dev Test)'}</button><button className="secondary-button" type="button" disabled={isPlanUpdating || user?.plan === 'starter'} onClick={() => switchPlan('starter')}>{isPlanUpdating ? 'Switching...' : 'Switch to Starter (Dev Test)'}</button></div></div>}</div>}
      </div>
    </div>
  )
}

export default WorkspaceSettingsModal
