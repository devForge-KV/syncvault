import { useEffect, useState } from 'react'
import { FiArrowUpRight, FiCheck, FiChevronRight, FiClock, FiExternalLink, FiMail, FiMessageSquare, FiX } from 'react-icons/fi'
import WorkspaceShell from '../components/WorkspaceShell'
import ActivityFeed from '../components/ActivityFeed'
import ResourceVault from '../components/ResourceVault'
import api, { getApiError } from '../utils/api'

const statusLabels = {
  planning: 'Planning',
  active: 'In progress',
  'in-review': 'In review',
  completed: 'Completed',
}

const readStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('syncvault_user')) || null } catch { return null }
}

function ClientPortal() {
  const [user] = useState(readStoredUser)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [feedback, setFeedback] = useState({})
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(null)
  const [error, setError] = useState('')
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [isContactSubmitting, setIsContactSubmitting] = useState(false)
  const [contactSuccess, setContactSuccess] = useState('')

  const loadProject = async (project) => {
    setSelectedProject(project)
    try {
      const { data } = await api.get(`/milestones/project/${project._id}`)
      setMilestones(data.milestones || [])
    } catch (requestError) {
      setError(getApiError(requestError, 'Milestones could not be loaded.'))
    }
  }

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects')
      const nextProjects = data.projects || []
      setProjects(nextProjects)
      if (nextProjects.length > 0) await loadProject(nextProjects[0])
    } catch (requestError) {
      setError(getApiError(requestError, 'Projects could not be loaded.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleApprove = async (milestone) => {
    setIsUpdating(milestone._id)
    setError('')
    try {
      await api.patch(`/milestones/${milestone._id}/status`, {
        status: 'approved',
        clientFeedback: feedback[milestone._id] || '',
      })
      await loadProjects()
    } catch (requestError) {
      setError(getApiError(requestError, 'This milestone could not be approved.'))
    } finally {
      setIsUpdating(null)
    }
  }

  const updateSelectedProject = (project) => {
    setSelectedProject(project)
    setProjects((current) => current.map((item) => item._id === project._id ? project : item))
  }

  const handleContactSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setContactSuccess('')
    setIsContactSubmitting(true)
    try {
      const { data } = await api.post(`/projects/${selectedProject._id}/activities`, { message: contactMessage })
      updateSelectedProject({ ...selectedProject, activities: data.activities })
      setContactMessage('')
      setContactSuccess('Your urgent query was added to the live activity feed.')
    } catch (requestError) {
      setError(getApiError(requestError, 'Your message could not be sent.'))
    } finally {
      setIsContactSubmitting(false)
    }
  }

  const completedMilestones = milestones.filter((milestone) => milestone.status === 'approved').length

  return (
    <WorkspaceShell role="client" user={user} onContactAgency={() => { setContactSuccess(''); setIsContactOpen(true) }}>
      <section className="dashboard-content client-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CLIENT PORTAL</p>
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'}.</h1>
            <p>A focused view of the work your team is shaping together.</p>
          </div>
          <div className="client-status"><span className="live-dot">●</span> {completedMilestones} milestones approved</div>
        </div>
        {error && <div className="form-alert" role="alert">{error}</div>}
        {loading ? (
          <div className="empty-state">Loading your project space...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <FiClock />
            <h3>No projects yet.</h3>
            <p>Your agency will add your first project here.</p>
          </div>
        ) : (
          <div className="client-grid">
            <aside className="project-list">
              <div className="section-heading compact-heading">
                <div><p className="eyebrow">YOUR PROJECTS</p><h2>Workspace <span>{projects.length}</span></h2></div>
              </div>
              {projects.map((project) => (
                <button key={project._id} className={`project-list-item ${selectedProject?._id === project._id ? 'selected' : ''}`} onClick={() => loadProject(project)}>
                  <span><strong>{project.title}</strong><small>{statusLabels[project.status] || project.status}</small></span>
                  <FiChevronRight />
                </button>
              ))}
            </aside>

            <section className="project-detail">
              {selectedProject && (
                <>
                  <div className="detail-header">
                    <div>
                      <span className={`status-badge status-${selectedProject.status}`}>{statusLabels[selectedProject.status] || selectedProject.status}</span>
                      <h2>{selectedProject.title}</h2>
                      <p>{selectedProject.description || 'Your project details and next steps will appear here.'}</p>
                    </div>
                    <div className="detail-progress"><strong>{selectedProject.overallProgress || 0}%</strong><span>complete</span></div>
                  </div>
                  <div className="large-progress"><span style={{ width: `${selectedProject.overallProgress || 0}%` }} /></div>
                  <ResourceVault project={selectedProject} onProjectUpdate={updateSelectedProject} />
                  <ActivityFeed activities={selectedProject.activities} />
                  <div className="timeline-heading">
                    <div><p className="eyebrow">PROJECT ROADMAP</p><h3>Milestones <span>{completedMilestones}/{milestones.length}</span></h3></div>
                    <span className="section-note">{milestones.length ? `${milestones.length} total` : 'No milestones yet'}</span>
                  </div>
                  {milestones.length === 0 ? (
                    <div className="empty-inline">Your agency has not added milestones yet.</div>
                  ) : (
                    <div className="milestone-list">
                      {milestones.map((milestone, index) => {
                        const approved = milestone.status === 'approved'
                        return (
                          <article className={`milestone-item ${approved ? 'approved' : ''}`} key={milestone._id}>
                            <div className="timeline-marker">{approved ? <FiCheck /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div>
                            <div className="milestone-body">
                              <div className="milestone-heading">
                                <div><span className="milestone-status">{approved ? 'Approved' : (milestone.status || 'Pending')}</span><h4>{milestone.title}</h4></div>
                                <span className="milestone-date">{milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Open date'}</span>
                              </div>
                              {milestone.description && <p>{milestone.description}</p>}
                              {milestone.deliverableUrl && <a className="deliverable-link" href={milestone.deliverableUrl} target="_blank" rel="noreferrer"><FiExternalLink /> View deliverable <FiArrowUpRight /></a>}
                              {!approved && (
                                <div className="approval-box">
                                  <div className="feedback-input"><FiMessageSquare /><input value={feedback[milestone._id] || ''} onChange={(event) => setFeedback((current) => ({ ...current, [milestone._id]: event.target.value }))} placeholder="Add feedback before approving (optional)" /></div>
                                  <button className="approve-button" onClick={() => handleApprove(milestone)} disabled={isUpdating === milestone._id}>{isUpdating === milestone._id ? 'Approving...' : 'Approve milestone'} <FiCheck /></button>
                                </div>
                              )}
                              {approved && milestone.clientFeedback && <div className="feedback-note"><FiMessageSquare /> “{milestone.clientFeedback}”</div>}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </section>
      {isContactOpen && selectedProject && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsContactOpen(false) }}><div className="modal-card contact-modal"><div className="modal-header"><div><p className="eyebrow">DIRECT LINE</p><h2>Contact Agency</h2><p className="vault-project-title">{selectedProject.title}</p></div><button className="icon-button" type="button" onClick={() => setIsContactOpen(false)} aria-label="Close contact agency"><FiX /></button></div><div className="agency-contact-card"><strong>{selectedProject.agencyId?.name || 'Your Agency'}</strong><span>{selectedProject.agencyId?.companyName || 'SyncVault partner'}</span><a href={`mailto:${selectedProject.agencyId?.email || ''}`}><FiMail /> {selectedProject.agencyId?.email || 'Email agency'}</a></div><form className="contact-form" onSubmit={handleContactSubmit}>{contactSuccess && <div className="form-success" role="status">{contactSuccess}</div>}<label className="field-label" htmlFor="contact-message">Quick message</label><textarea id="contact-message" value={contactMessage} onChange={(event) => setContactMessage(event.target.value)} placeholder="Tell your agency what needs attention..." rows="5" required /><button className="primary-button" type="submit" disabled={isContactSubmitting}>{isContactSubmitting ? 'Sending...' : 'Send urgent query'} <FiArrowUpRight /></button></form></div></div>}
    </WorkspaceShell>
  )
}

export default ClientPortal
