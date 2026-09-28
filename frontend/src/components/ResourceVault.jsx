import { useState } from 'react'
import { FiExternalLink, FiLink, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import api, { getApiError } from '../utils/api'

const resourceTypes = [
  { value: 'link', label: 'Link' },
  { value: 'figma', label: 'Figma' },
  { value: 'video', label: 'Video Demo' },
  { value: 'drive', label: 'Drive Assets' },
  { value: 'github', label: 'GitHub' },
]

const formatResourceTime = (createdAt) => createdAt
  ? new Date(createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  : ''

function SenderBadge({ resource, currentRole }) {
  const isSent = resource.addedBy?.role ? resource.addedBy.role === currentRole : true

  return <span className={`sender-status ${isSent ? 'sender-status-sent' : 'sender-status-received'} inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${isSent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'} shadow-sm`}><span className={`sender-status-dot ${isSent ? 'sender-status-dot-sent animate-pulse' : 'sender-status-dot-received'}`} />{isSent ? 'SENT' : 'RECEIVED'}</span>
}

function ResourceVault({ project, onProjectUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [resources, setResources] = useState(project.resources || [])
  const [form, setForm] = useState({ title: '', url: '', type: 'link' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { data } = await api.post(`/projects/${project._id}/resources`, form)
      const updatedProject = { ...project, resources: [...resources, data.resource], activities: data.activities || project.activities }
      setResources(updatedProject.resources)
      onProjectUpdate?.(updatedProject)
      setForm({ title: '', url: '', type: 'link' })
    } catch (requestError) {
      setError(getApiError(requestError, 'The resource could not be added.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (resourceId) => {
    setError('')
    setDeletingId(resourceId)
    try {
      await api.delete(`/projects/${project._id}/resources/${resourceId}`)
      setResources((current) => current.filter((resource) => resource._id !== resourceId))
    } catch (requestError) {
      setError(getApiError(requestError, 'The resource could not be removed.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <button className="vault-pill" type="button" onClick={() => { setError(''); setIsOpen(true) }}><FiLink /> Shared Vault ({resources.length})</button>
      {isOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}><div className="modal-card vault-modal"><div className="modal-header"><div><p className="eyebrow">SHARED PROJECT SPACE</p><h2>Vault &amp; Resources</h2></div><button className="icon-button" type="button" onClick={() => setIsOpen(false)} aria-label="Close vault"><FiX /></button></div><div className="vault-panel">{error && <div className="form-alert" role="alert">{error}</div>}{resources.length > 0 ? <div className="resource-list">{resources.map((resource) => <div className="resource-item" key={resource._id}><a href={resource.url} target="_blank" rel="noreferrer"><span className={`resource-badge resource-${resource.type || 'link'}`}>{resourceTypes.find((option) => option.value === resource.type)?.label || 'Link'}</span><SenderBadge resource={resource} currentRole="client" /><strong>{resource.title}</strong><FiExternalLink /></a>{resource.createdAt && <time className="resource-time" dateTime={resource.createdAt}>{formatResourceTime(resource.createdAt)}</time>}<button className="icon-button" type="button" onClick={() => handleDelete(resource._id)} disabled={deletingId === resource._id} aria-label={`Remove ${resource.title}`}><FiTrash2 /></button></div>)}</div> : <p className="empty-inline">No shared resources yet.</p>}<form className="resource-form" onSubmit={handleSubmit}><input name="title" value={form.title} onChange={handleChange} placeholder="Resource title" aria-label="Resource title" required /><input name="url" type="url" value={form.url} onChange={handleChange} placeholder="https://..." aria-label="Resource URL" required /><select name="type" value={form.type} onChange={handleChange} aria-label="Resource type">{resourceTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button className="primary-button" type="submit" disabled={isSubmitting}><FiPlus /> {isSubmitting ? 'Adding...' : 'Add Resource'}</button></form></div></div></div>}
    </>
  )
}

export default ResourceVault
