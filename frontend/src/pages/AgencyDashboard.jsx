import { useEffect, useState } from 'react'
import { FiArrowUpRight, FiCalendar, FiCheckCircle, FiClock, FiDollarSign, FiEdit3, FiExternalLink, FiGrid, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import WorkspaceShell from '../components/WorkspaceShell'
import ActivityFeed from '../components/ActivityFeed'
import WorkspaceSettingsModal from '../components/WorkspaceSettingsModal'
import api, { getApiError } from '../utils/api'

const emptyForm = { title: '', description: '', clientEmail: '', budget: '', currency: 'USD', deadline: '', milestoneTitle: '', milestoneDescription: '', milestoneDueDate: '' }

const statusLabels = { planning: 'Planning', active: 'In progress', 'in-review': 'In review', completed: 'Completed' }
const resourceTypes = [
  { value: 'figma', label: 'Figma' },
  { value: 'video', label: 'Video' },
  { value: 'drive', label: 'Drive' },
  { value: 'github', label: 'GitHub' },
  { value: 'link', label: 'Link' },
]

const formatResourceTime = (createdAt) => createdAt
  ? new Date(createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  : ''

function SenderBadge({ resource, currentRole }) {
  const isSent = resource.addedBy?.role ? resource.addedBy.role === currentRole : true

  return <span className={`sender-status ${isSent ? 'sender-status-sent' : 'sender-status-received'} inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${isSent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'} shadow-sm`}><span className={`sender-status-dot ${isSent ? 'sender-status-dot-sent animate-pulse' : 'sender-status-dot-received'}`} />{isSent ? 'SENT' : 'RECEIVED'}</span>
}

function MilestoneFeedbackNote({ milestone }) {
  const feedback = milestone.feedback || milestone.clientFeedback

  if (!feedback) return null

  return <div className="mt-2 flex items-start gap-2 text-xs text-neutral-400 bg-neutral-900/60 border border-neutral-800 rounded-lg p-2.5 milestone-feedback-note"><span className="text-lime-400">💬 Client Feedback:</span><span className="italic text-neutral-200 font-normal">"{feedback}"</span></div>
}

const readStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('syncvault_user')) || null } catch { return null }
}

function ProgressBar({ value = 0 }) {
  return <div className="progress-track"><span style={{ width: `${value}%` }} /></div>
}

function ProjectCard({ project, onEdit, onDelete, onOpenVault, onAddMilestone }) {
  return (
    <article className="project-card">
      <div className="card-topline"><span className={`status-badge status-${project.status}`}>{statusLabels[project.status] || project.status}</span><div className="card-actions"><button className="icon-button" type="button" onClick={() => onEdit(project)} aria-label={`Edit ${project.title}`}><FiEdit3 /></button><button className="icon-button danger-icon" type="button" onClick={() => onDelete(project)} aria-label={`Delete ${project.title}`}><FiTrash2 /></button></div></div>
      <h3>{project.title}</h3>
      <p className="project-description">{project.description || 'No description added yet.'}</p>
      <div className="project-meta"><span><FiDollarSign /> {project.currency || 'USD'} {Number(project.budget || 0).toLocaleString()}</span><span><FiCalendar /> {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No deadline'}</span></div>
      <div className="progress-heading"><span>Overall progress</span><strong>{project.overallProgress || 0}%</strong></div>
      <ProgressBar value={project.overallProgress || 0} />
      <div className="card-footer"><span>Client</span><strong>{project.clientId?.name || 'Assigned client'}</strong></div>
      <button className="vault-pill" type="button" onClick={() => onOpenVault(project)}>📁 Shared Vault ({project.resources?.length || 0})</button>
      {project.status === 'active' && <button className="milestone-action" type="button" onClick={() => onAddMilestone(project)}><FiPlus /> Add Milestone</button>}
    </article>
  )
}

function AgencyDashboard() {
  const [projects, setProjects] = useState([])
  const [user, setUser] = useState(readStoredUser)
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', budget: '', deadline: '' })
  const [activeVaultProject, setActiveVaultProject] = useState(null)
  const [vaultForm, setVaultForm] = useState({ title: '', url: '', type: 'link' })
  const [vaultError, setVaultError] = useState('')
  const [isVaultSubmitting, setIsVaultSubmitting] = useState(false)
  const [deletingResourceId, setDeletingResourceId] = useState(null)
  const [activeMilestoneProject, setActiveMilestoneProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [milestoneForm, setMilestoneForm] = useState({ title: '', dueDate: '' })
  const [milestoneError, setMilestoneError] = useState('')
  const [isMilestoneLoading, setIsMilestoneLoading] = useState(false)
  const [isMilestoneSubmitting, setIsMilestoneSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data.projects || [])
      if (data.user) {
        setUser((current) => {
          const updatedUser = { ...current, ...data.user }
          localStorage.setItem('syncvault_user', JSON.stringify(updatedUser))
          return updatedUser
        })
      }
    } catch (requestError) {
      setError(getApiError(requestError, 'Projects could not be loaded.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeoutId = window.setTimeout(() => setToast(''), 4500)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const openEditModal = (project) => {
    setError('')
    setEditingProject(project)
    setEditForm({
      title: project.title || '',
      description: project.description || '',
      budget: project.budget || '',
      deadline: project.deadline ? project.deadline.slice(0, 10) : '',
    })
  }

  const handleEditChange = (event) => setEditForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const openVault = (project) => {
    setVaultError('')
    setVaultForm({ title: '', url: '', type: 'link' })
    setActiveVaultProject(project)
  }

  const handleVaultChange = (event) => setVaultForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleAddResource = async (event) => {
    event.preventDefault()
    setVaultError('')
    setIsVaultSubmitting(true)
    try {
      const { data } = await api.post(`/projects/${activeVaultProject._id}/resources`, vaultForm)
      const updatedProject = { ...activeVaultProject, resources: [...(activeVaultProject.resources || []), data.resource], activities: data.activities || activeVaultProject.activities }
      setActiveVaultProject(updatedProject)
      setProjects((current) => current.map((project) => project._id === updatedProject._id ? updatedProject : project))
      setVaultForm({ title: '', url: '', type: 'link' })
    } catch (requestError) {
      setVaultError(getApiError(requestError, 'The resource could not be added.'))
    } finally {
      setIsVaultSubmitting(false)
    }
  }

  const handleDeleteResource = async (resourceId) => {
    setVaultError('')
    setDeletingResourceId(resourceId)
    try {
      await api.delete(`/projects/${activeVaultProject._id}/resources/${resourceId}`)
      const updatedProject = { ...activeVaultProject, resources: activeVaultProject.resources.filter((resource) => resource._id !== resourceId) }
      setActiveVaultProject(updatedProject)
      setProjects((current) => current.map((project) => project._id === updatedProject._id ? updatedProject : project))
    } catch (requestError) {
      setVaultError(getApiError(requestError, 'The resource could not be removed.'))
    } finally {
      setDeletingResourceId(null)
    }
  }

  const openMilestoneModal = async (project) => {
    setActiveMilestoneProject(project)
    setMilestoneForm({ title: '', dueDate: '' })
    setMilestoneError('')
    setMilestones([])
    setIsMilestoneLoading(true)
    try {
      const { data } = await api.get(`/milestones/project/${project._id}`)
      setMilestones(data.milestones || [])
    } catch (requestError) {
      setMilestoneError(getApiError(requestError, 'Milestones could not be loaded.'))
    } finally {
      setIsMilestoneLoading(false)
    }
  }

  const handleMilestoneChange = (event) => setMilestoneForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleAddMilestone = async (event) => {
    event.preventDefault()
    setMilestoneError('')
    setIsMilestoneSubmitting(true)
    try {
      const { data } = await api.post('/milestones', {
        projectId: activeMilestoneProject._id,
        title: milestoneForm.title,
        dueDate: milestoneForm.dueDate || undefined,
      })
      setMilestones((current) => [...current, data.milestone])
      const updatedProject = { ...activeMilestoneProject, overallProgress: data.overallProgress }
      setActiveMilestoneProject(updatedProject)
      setProjects((current) => current.map((project) => project._id === updatedProject._id ? updatedProject : project))
      setMilestoneForm({ title: '', dueDate: '' })
    } catch (requestError) {
      setMilestoneError(getApiError(requestError, 'The milestone could not be added.'))
    } finally {
      setIsMilestoneSubmitting(false)
    }
  }

  const handleDelete = async (project) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    setError('')
    try {
      await api.delete(`/projects/${project._id}`)
      setProjects((current) => current.filter((item) => item._id !== project._id))
    } catch (requestError) {
      setError(getApiError(requestError, 'The project could not be deleted.'))
    }
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await api.put(`/projects/${editingProject._id}`, {
        title: editForm.title,
        description: editForm.description,
        budget: editForm.budget ? Number(editForm.budget) : undefined,
        deadline: editForm.deadline || undefined,
      })
      setEditingProject(null)
      await loadProjects()
    } catch (requestError) {
      setError(getApiError(requestError, 'The project could not be updated.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const { data } = await api.post('/projects', {
        title: form.title,
        description: form.description,
        clientEmail: form.clientEmail,
        budget: form.budget ? Number(form.budget) : undefined,
        currency: form.currency,
        deadline: form.deadline || undefined,
      })
      if (form.milestoneTitle.trim()) {
        await api.post('/milestones', {
          projectId: data.project._id,
          title: form.milestoneTitle,
          description: form.milestoneDescription,
          dueDate: form.milestoneDueDate || undefined,
        })
      }
      setForm(emptyForm)
      setIsModalOpen(false)
      await loadProjects()
    } catch (requestError) {
      if (requestError.response?.status === 403) {
        setIsModalOpen(false)
        setToast(getApiError(requestError, 'Your current plan does not allow another project.'))
      } else {
        setError(getApiError(requestError, 'The project could not be created.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const focusProjects = () => document.getElementById('all-projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const startProjectCreation = () => {
    setError('')
    if (user?.plan === 'starter' && projects.length >= 3) {
      setIsUpgradeOpen(true)
      return
    }
    setIsModalOpen(true)
  }

  const activeCount = projects.filter((project) => project.status === 'active').length
  const reviewCount = projects.filter((project) => project.status === 'in-review').length

  return (
    <WorkspaceShell role="agency" user={user} onNewProject={startProjectCreation} onOpenSettings={() => setIsSettingsOpen(true)} onFocusProjects={focusProjects}>
      {toast && <div className="error-toast" role="alert">{toast}<button type="button" onClick={() => setToast('')} aria-label="Dismiss notification"><FiX /></button></div>}
      <section className="dashboard-content">
        <div className="page-heading"><div><p className="eyebrow">AGENCY OVERVIEW</p><h1>Good morning, {user?.name?.split(' ')[0] || 'there'}.</h1><p>Keep your client work moving with a clear view of every project.</p></div><button className="primary-button compact-button" onClick={startProjectCreation}><FiPlus /> New project</button></div>
          {isUpgradeOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsUpgradeOpen(false) }}><div className="modal-card upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="upgrade-title"><div className="modal-header"><div><p className="eyebrow">PLAN LIMIT REACHED</p><h2 id="upgrade-title">Starter Limit Reached</h2></div><button className="icon-button" type="button" onClick={() => setIsUpgradeOpen(false)} aria-label="Close upgrade dialog"><FiX /></button></div><p className="upgrade-copy">You have reached the maximum of 3 client workspaces on the Starter plan. Upgrade to Agency Pro to manage unlimited clients, customize your branding, and unlock priority workflows.</p><div className="upgrade-actions"><a className="primary-button" href="/#pricing">View Pricing Plans <FiArrowUpRight /></a><button className="secondary-button" type="button" onClick={() => setIsUpgradeOpen(false)}>Close</button></div></div></div>}
        {error && !isModalOpen && <div className="form-alert dashboard-error-banner" role="alert">{error}</div>}
        <div className="metric-grid"><div className="metric-card"><span className="metric-icon accent-lime"><FiGrid /></span><div><strong>{projects.length}</strong><span>Total projects</span></div></div><div className="metric-card"><span className="metric-icon accent-cyan"><FiClock /></span><div><strong>{activeCount}</strong><span>In progress</span></div></div><div className="metric-card"><span className="metric-icon accent-amber"><FiCheckCircle /></span><div><strong>{reviewCount}</strong><span>Awaiting review</span></div></div></div>
        <div className="section-heading" id="all-projects"><div><p className="eyebrow">YOUR WORK</p><h2>All projects <span>{projects.length}</span></h2></div><span className="section-note">Updated just now</span></div>
        {isLoading ? <div className="empty-state">Loading your project space...</div> : projects.length === 0 ? <div className="empty-state agency-empty-state"><span className="agency-empty-icon"><FiPlus /></span><h3>Your workspace is ready.</h3><p>Create the first project to bring a client into SyncVault.</p><button className="primary-button agency-create-button" onClick={startProjectCreation}>Create project <FiArrowUpRight /></button></div> : <><div className="project-grid">{projects.map((project) => <ProjectCard key={project._id} project={project} onEdit={openEditModal} onDelete={handleDelete} onOpenVault={openVault} onAddMilestone={openMilestoneModal} />)}</div><div className="activity-feed-grid">{projects.map((project) => <ActivityFeed key={`activity-${project._id}`} activities={project.activities} title={`Live Activity Feed · ${project.title}`} />)}</div></>}
      </section>

      <footer className="agency-help-footer mt-14 grid gap-5 border-t border-white/10 px-[5%] py-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="agency-help-copy">
          {!isLoading && projects.length === 0 && <p className="agency-help-message">Your workspace is ready. Create the first project to bring a client into SyncVault.</p>}
          <p className="agency-help-caption">Talk with the SyncVault team about your workspace, subscription, or a technical issue.</p>
        </div>
        <a className="agency-help-link inline-flex items-center justify-center gap-2 bg-[#c8f53d] px-5 py-3 font-bold text-[#10120b]" href="/contact">GET HELP <FiArrowUpRight /></a>
      </footer>

      {isModalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false) }}><div className="modal-card"><div className="modal-header"><div><p className="eyebrow">NEW WORKSPACE ITEM</p><h2>Create a project</h2></div><button className="icon-button" onClick={() => setIsModalOpen(false)} aria-label="Close modal"><FiX /></button></div><form className="modal-form" onSubmit={handleCreate}>{error && <div className="form-alert">{error}</div>}<div className="form-grid"><div className="form-wide"><label className="field-label" htmlFor="project-title">Project title</label><input id="project-title" name="title" value={form.title} onChange={handleChange} placeholder="Brand refresh / Q4 launch" required /></div><div><label className="field-label" htmlFor="project-client">Client Email</label><input id="project-client" name="clientEmail" type="email" value={form.clientEmail} onChange={handleChange} placeholder="client@company.com" required /></div><div><label className="field-label" htmlFor="project-budget">Budget</label><input id="project-budget" name="budget" type="number" min="0" value={form.budget} onChange={handleChange} placeholder="12000" /></div><div className="form-wide"><label className="field-label" htmlFor="project-description">Description</label><textarea id="project-description" name="description" value={form.description} onChange={handleChange} placeholder="What are you making together?" rows="3" /></div><div><label className="field-label" htmlFor="project-deadline">Deadline</label><input id="project-deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} /></div></div><div className="modal-divider"><FiPlus /><span>Optional first milestone</span></div><div className="form-grid"><div className="form-wide"><label className="field-label" htmlFor="milestone-title">Milestone title</label><input id="milestone-title" name="milestoneTitle" value={form.milestoneTitle} onChange={handleChange} placeholder="First review" /></div><div><label className="field-label" htmlFor="milestone-date">Due date</label><input id="milestone-date" name="milestoneDueDate" type="date" value={form.milestoneDueDate} onChange={handleChange} /></div></div><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create project'} <FiArrowUpRight /></button></form></div></div>}
    {editingProject && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingProject(null) }}><div className="modal-card"><div className="modal-header"><div><p className="eyebrow">PROJECT DETAILS</p><h2>Edit project</h2></div><button className="icon-button" type="button" onClick={() => setEditingProject(null)} aria-label="Close edit modal"><FiX /></button></div><form className="modal-form" onSubmit={handleUpdate}>{error && <div className="form-alert">{error}</div>}<div className="form-grid"><div className="form-wide"><label className="field-label" htmlFor="edit-project-title">Project title</label><input id="edit-project-title" name="title" value={editForm.title} onChange={handleEditChange} required /></div><div><label className="field-label" htmlFor="edit-project-budget">Budget</label><input id="edit-project-budget" name="budget" type="number" min="0" value={editForm.budget} onChange={handleEditChange} /></div><div className="form-wide"><label className="field-label" htmlFor="edit-project-description">Description</label><textarea id="edit-project-description" name="description" value={editForm.description} onChange={handleEditChange} rows="4" /></div><div><label className="field-label" htmlFor="edit-project-deadline">Deadline</label><input id="edit-project-deadline" name="deadline" type="date" value={editForm.deadline} onChange={handleEditChange} /></div></div><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save changes'} <FiArrowUpRight /></button></form></div></div>}
    {activeVaultProject && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 modal-backdrop vault-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveVaultProject(null) }}><div className="bg-[#111111] border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative modal-card vault-modal-container"><div className="modal-header"><div><p className="eyebrow">SHARED PROJECT SPACE</p><h2>Vault &amp; Resources</h2><p className="vault-project-title">{activeVaultProject.title}</p></div><button className="icon-button" type="button" onClick={() => setActiveVaultProject(null)} aria-label="Close vault"><FiX /></button></div><div className="vault-modal-body">{vaultError && <div className="form-alert" role="alert">{vaultError}</div>}{activeVaultProject.resources?.length ? <div className="resource-list">{activeVaultProject.resources.map((resource) => <div className="resource-item" key={resource._id}><a href={resource.url} target="_blank" rel="noreferrer"><span className={`resource-badge resource-${resource.type || 'link'}`}>{resourceTypes.find((option) => option.value === resource.type)?.label || 'Link'}</span><SenderBadge resource={resource} currentRole="agency" /><strong>{resource.title}</strong><FiExternalLink /></a>{resource.createdAt && <time className="resource-time" dateTime={resource.createdAt}>{formatResourceTime(resource.createdAt)}</time>}<button className="icon-button" type="button" onClick={() => handleDeleteResource(resource._id)} disabled={deletingResourceId === resource._id} aria-label={`Remove ${resource.title}`}><FiTrash2 /></button></div>)}</div> : <p className="empty-inline">No shared resources yet.</p>}<form className="resource-form vault-resource-form" onSubmit={handleAddResource}><label><span className="field-label">Title</span><input name="title" value={vaultForm.title} onChange={handleVaultChange} placeholder="Figma Design System" required /></label><label><span className="field-label">URL</span><input name="url" type="url" value={vaultForm.url} onChange={handleVaultChange} placeholder="https://..." required /></label><label><span className="field-label">Type</span><select name="type" value={vaultForm.type} onChange={handleVaultChange}>{resourceTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><button className="primary-button" type="submit" disabled={isVaultSubmitting}><FiPlus /> {isVaultSubmitting ? 'Adding...' : 'Add Resource'}</button></form></div></div></div>}
    {activeMilestoneProject && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveMilestoneProject(null) }}><div className="modal-card milestone-modal"><div className="modal-header"><div><p className="eyebrow">PROJECT MANAGEMENT</p><h2>Milestones</h2><p className="vault-project-title">{activeMilestoneProject.title}</p></div><button className="icon-button" type="button" onClick={() => setActiveMilestoneProject(null)} aria-label="Close milestone manager"><FiX /></button></div><div className="milestone-manager">{milestoneError && <div className="form-alert" role="alert">{milestoneError}</div>}{isMilestoneLoading ? <p className="empty-inline">Loading milestones...</p> : milestones.length === 0 ? <p className="empty-inline">No milestones yet. Add the next project checkpoint below.</p> : <div className="agency-milestone-list">{milestones.map((milestone, index) => <div className="agency-milestone-item" key={milestone._id}><span className="timeline-marker">{String(index + 1).padStart(2, '0')}</span><div><strong>{milestone.title}</strong><MilestoneFeedbackNote milestone={milestone} /><span>{milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</span></div><span className={`milestone-status status-${milestone.status}`}>{String(milestone.status || 'pending').toUpperCase()}</span></div>)}</div>}<form className="milestone-add-form" onSubmit={handleAddMilestone}><label><span className="field-label">Milestone title</span><input name="title" value={milestoneForm.title} onChange={handleMilestoneChange} placeholder="Final review" required /></label><label><span className="field-label">Due date</span><input name="dueDate" type="date" value={milestoneForm.dueDate} onChange={handleMilestoneChange} /></label><button className="primary-button" type="submit" disabled={isMilestoneSubmitting}><FiPlus /> {isMilestoneSubmitting ? 'Adding...' : 'Add Milestone'}</button></form></div></div></div>}
    {activeMilestoneProject && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveMilestoneProject(null) }}><div className="modal-card milestone-modal"><div className="modal-header"><div><p className="eyebrow">PROJECT MANAGEMENT</p><h2>Milestones</h2><p className="vault-project-title">{activeMilestoneProject.title}</p></div><button className="icon-button" type="button" onClick={() => setActiveMilestoneProject(null)} aria-label="Close milestone manager"><FiX /></button></div><div className="milestone-manager">{milestoneError && <div className="form-alert" role="alert">{milestoneError}</div>}{isMilestoneLoading ? <p className="empty-inline">Loading milestones...</p> : milestones.length === 0 ? <p className="empty-inline">No milestones yet. Add the next project checkpoint below.</p> : <div className="agency-milestone-list">{milestones.map((milestone, index) => <div className="agency-milestone-item" key={milestone._id}><span className="timeline-marker">{String(index + 1).padStart(2, '0')}</span><div><strong>{milestone.title}</strong><MilestoneFeedbackNote milestone={milestone} /><span>{milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</span></div><span className={`milestone-status status-${milestone.status}`}>{String(milestone.status || 'pending').toUpperCase()}</span></div>)}</div>}<form className="milestone-add-form" onSubmit={handleAddMilestone}><label><span className="field-label">Milestone title</span><input name="title" value={milestoneForm.title} onChange={handleMilestoneChange} placeholder="Final review" required /></label><label><span className="field-label">Due date</span><input name="dueDate" type="date" value={milestoneForm.dueDate} onChange={handleMilestoneChange} /></label><button className="primary-button" type="submit" disabled={isMilestoneSubmitting}><FiPlus /> {isMilestoneSubmitting ? 'Adding...' : 'Add Milestone'}</button></form></div></div></div>}
    {isSettingsOpen && <WorkspaceSettingsModal user={user} projects={projects} onClose={() => setIsSettingsOpen(false)} onUserUpdated={setUser} />}
    </WorkspaceShell>
  )
}

export default AgencyDashboard
