import { useEffect, useState } from 'react'
import { FiActivity, FiArrowDownRight, FiArrowUpRight, FiBriefcase, FiCalendar, FiDollarSign, FiLayers, FiLogOut, FiRefreshCw, FiSearch, FiShield, FiUsers } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api, { getApiError } from '../utils/api'

const plans = [
  { id: 'starter', label: 'Starter', tone: 'starter' },
  { id: 'agency_pro', label: 'Agency Pro', tone: 'pro' },
  { id: 'enterprise', label: 'Enterprise', tone: 'enterprise' },
]

const formatNumber = (value) => Number(value || 0).toLocaleString()
const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  : '—'
const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('syncvault_user')) || {} } catch { return {} }
}

function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [serverStatus, setServerStatus] = useState('checking')
  const [updatingAgencyId, setUpdatingAgencyId] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const user = getStoredUser()

  useEffect(() => {
    let isCurrent = true
    const loadDashboard = async () => {
      try {
        const { data } = await api.get('/admin/metrics')
        if (!isCurrent) return
        setMetrics(data)
        setError('')
        setServerStatus('live')
        setLastUpdated(new Date())
      } catch (requestError) {
        if (isCurrent) {
          setError(getApiError(requestError, 'Platform data could not be loaded.'))
          setServerStatus(requestError.response ? 'live' : 'offline')
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadDashboard()
    const intervalId = window.setInterval(loadDashboard, 30000)
    return () => {
      isCurrent = false
      window.clearInterval(intervalId)
    }
  }, [])

  const handlePlanChange = async (agencyId, plan) => {
    setUpdatingAgencyId(agencyId)
    setError('')
    try {
      await api.put(`/admin/user/${agencyId}/plan`, { plan })
      const { data } = await api.get('/admin/metrics')
      setMetrics(data)
      setLastUpdated(new Date())
    } catch (requestError) {
      setError(getApiError(requestError, 'The agency plan could not be changed.'))
    } finally {
      setUpdatingAgencyId('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('syncvault_token')
    localStorage.removeItem('syncvault_user')
    navigate('/login', { replace: true })
  }

  const agencies = metrics?.agenciesList || []
  const filteredAgencies = agencies.filter((agency) => {
    const query = search.trim().toLowerCase()
    return !query || `${agency.companyName || agency.name} ${agency.name} ${agency.email}`.toLowerCase().includes(query)
  })
  const planCounts = metrics?.planCounts || { starter: 0, agency_pro: 0, enterprise: 0 }
  const totalAgencies = metrics?.totalAgencies || 0
  const premiumCount = planCounts.agency_pro + planCounts.enterprise
  const conversionRate = totalAgencies ? Math.round((premiumCount / totalAgencies) * 100) : 0
  const maxPlanCount = Math.max(1, ...Object.values(planCounts))
  const isDataUnavailable = !isLoading && !metrics

  return (
    <main className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-brand"><span className="admin-brand-mark">S<span>/</span>V</span><span className="admin-brand-divider" /><span>Founder Mission Control</span></div>
        <div className="admin-topbar-right">
          <span className={`admin-live admin-live-${serverStatus}`}><i /> {serverStatus === 'checking' ? 'Connecting' : serverStatus === 'live' ? 'Live' : 'Offline'}</span>
          <span className="admin-profile-mark">{(user.name || 'Founder').slice(0, 1).toUpperCase()}</span>
          <span className="admin-profile-name">{user.name || 'Founder'}</span>
          <button className="admin-switch-button" type="button" onClick={() => navigate('/dashboard')}>Switch to Agency View</button>
          <button className="admin-logout" type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out"><FiLogOut /></button>
        </div>
      </header>

      <div className="admin-content">
        <section className="admin-heading-row">
          <div>
            <p className="admin-eyebrow"><FiShield /> PLATFORM OVERVIEW</p>
            <h1>Good to see you, {user.name?.split(' ')[0] || 'Founder'}.</h1>
            <p className="admin-subtitle">A clear view of SyncVault's growth, customers, and recurring revenue.</p>
          </div>
          <div className="admin-updated"><FiRefreshCw /> Updated {lastUpdated ? lastUpdated.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '—'}</div>
        </section>

        {error && <div className="admin-error" role="alert">{error}<button type="button" onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}

        <section className="admin-stat-grid" aria-label="Platform metrics">
          <article className="admin-stat-card admin-mrr-card">
            <div className="admin-stat-top"><span>Total MRR</span><i><FiDollarSign /></i></div>
            <strong>{isLoading ? <span className="admin-skeleton-number" /> : isDataUnavailable ? '—' : `$${formatNumber(metrics?.totalMRR)}`}</strong>
            <div className="admin-stat-foot"><span>Estimated monthly recurring revenue</span><span className="admin-sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span></div>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-top"><span>Total agencies</span><i><FiBriefcase /></i></div>
            <strong>{isLoading ? <span className="admin-skeleton-number" /> : isDataUnavailable ? '—' : formatNumber(totalAgencies)}</strong>
            <div className="admin-stat-foot"><span>Registered on the platform</span><span className="admin-stat-mark"><FiArrowUpRight /> Accounts</span></div>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-top"><span>Active client projects</span><i><FiLayers /></i></div>
            <strong>{isLoading ? <span className="admin-skeleton-number" /> : isDataUnavailable ? '—' : formatNumber(metrics?.activeClientProjects)}</strong>
            <div className="admin-stat-foot"><span>Currently marked in progress</span><span className="admin-stat-mark"><FiActivity /> Running</span></div>
          </article>
          <article className="admin-stat-card">
            <div className="admin-stat-top"><span>Pro / Enterprise</span><i><FiUsers /></i></div>
            <strong>{isLoading ? <span className="admin-skeleton-number" /> : isDataUnavailable ? '—' : `${conversionRate}%`}</strong>
            <div className="admin-stat-foot"><span>Paid-tier agency conversion</span><span className="admin-stat-mark">{isLoading ? '… agencies' : isDataUnavailable ? '— agencies' : `${formatNumber(premiumCount)} agencies`}</span></div>
          </article>
        </section>

        <section className="admin-plan-section">
          <div className="admin-section-title"><div><p className="admin-eyebrow">SUBSCRIPTION MIX</p><h2>Plan distribution</h2></div><span>{isLoading ? 'Loading accounts…' : isDataUnavailable ? '— total accounts' : `${formatNumber(totalAgencies)} total accounts`}</span></div>
          <div className="admin-plan-grid">
            {plans.map((plan) => (
              <article className={`admin-plan-card plan-${plan.tone}`} key={plan.id}>
                <div className="admin-plan-card-top"><span className={`admin-plan-pill plan-pill-${plan.tone}`}>{plan.label}</span><strong>{isLoading ? <span className="admin-skeleton-number admin-skeleton-small" /> : isDataUnavailable ? '—' : formatNumber(planCounts[plan.id])}</strong></div>
                <div className="admin-plan-track"><span style={{ width: `${isDataUnavailable ? 0 : (planCounts[plan.id] / maxPlanCount) * 100}%` }} /></div>
                <span className="admin-plan-share">{isLoading ? 'Loading share…' : isDataUnavailable ? '—' : `${totalAgencies ? Math.round((planCounts[plan.id] / totalAgencies) * 100) : 0}% of agencies`}</span>
              </article>
            ))}
          </div>
        </section>

        <div className="admin-lower-grid">
          <section className="admin-agencies-section">
            <div className="admin-section-title admin-agencies-title"><div><p className="admin-eyebrow">CUSTOMER DIRECTORY</p><h2>All agencies <span>{isLoading ? '…' : isDataUnavailable ? '—' : formatNumber(agencies.length)}</span></h2></div>
              <label className="admin-search"><FiSearch /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" aria-label="Search agencies" /></label>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Agency</th><th>Owner email</th><th>Active plan</th><th>Projects</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {isLoading && <tr><td className="admin-table-message" colSpan="6"><span className="admin-loading-inline"><FiRefreshCw /> Loading agency directory...</span></td></tr>}
                  {!isLoading && filteredAgencies.map((agency) => {
                    const plan = plans.find((item) => item.id === agency.plan) || plans[0]
                    return <tr key={agency._id}>
                      <td><span className="admin-agency-name">{agency.companyName || agency.name}</span><span className="admin-agency-owner">{agency.name}</span></td>
                      <td className="admin-email">{agency.email}</td>
                      <td><span className={`admin-plan-pill plan-pill-${plan.tone}`}>{plan.label}</span></td>
                      <td className="admin-project-count">{formatNumber(agency.projectCount)}</td>
                      <td className="admin-date"><FiCalendar /> {formatDate(agency.createdAt)}</td>
                      <td><label className="admin-plan-select-label"><span className="sr-only">Change plan for {agency.companyName || agency.name}</span><select value={agency.plan || 'starter'} disabled={updatingAgencyId === agency._id} onChange={(event) => handlePlanChange(agency._id, event.target.value)} aria-label={`Change plan for ${agency.companyName || agency.name}`}><option value="starter">Starter</option><option value="agency_pro">Agency Pro</option><option value="enterprise">Enterprise</option></select>{updatingAgencyId === agency._id && <span className="admin-select-progress" />}</label></td>
                    </tr>
                  })}
                  {!isLoading && filteredAgencies.length === 0 && <tr><td className="admin-table-message" colSpan="6">{error ? 'Agency data is temporarily unavailable.' : search ? 'No agencies match that search.' : 'No agencies have registered yet.'}</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="admin-activity-section">
            <div className="admin-section-title"><div><p className="admin-eyebrow">AUDIT TRAIL</p><h2>Recent activity</h2></div><span className="admin-log-live"><i /> LIVE</span></div>
            <div className="admin-activity-list">
              {(metrics?.recentActivity || []).map((activity) => {
                const plan = plans.find((item) => item.id === activity.plan) || plans[0]
                const isPlanChange = activity.type === 'plan_changed'
                return <article className="admin-activity-item" key={activity.id}>
                  <span className="admin-activity-icon"><FiArrowDownRight /></span>
                  <div><p><strong>{activity.name}</strong> {isPlanChange ? 'moved to' : 'joined SyncVault'}</p><span>{formatDate(activity.createdAt)} <i /> <b className={`plan-text-${plan.tone}`}>{plan.label}</b></span></div>
                </article>
              })}
              {isLoading && <div className="admin-activity-empty"><span className="admin-loading-inline"><FiRefreshCw /> Loading activity...</span></div>}
              {!isLoading && !metrics?.recentActivity?.length && <div className="admin-activity-empty">{error ? 'Activity log is temporarily unavailable.' : 'New agency registrations will appear here.'}</div>}
            </div>
            <div className="admin-activity-foot"><FiActivity /> Latest 10 platform events <span>Refreshes every 30s</span></div>
          </aside>
        </div>
        <footer className="admin-footer"><span>SYNCVAULT <i>/</i> FOUNDER CONSOLE</span><span>Private platform access <FiShield /></span></footer>
      </div>
    </main>
  )
}

export default SuperAdminDashboard