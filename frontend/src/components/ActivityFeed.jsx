import { useState } from 'react'
import { FiActivity, FiChevronDown, FiMessageSquare } from 'react-icons/fi'

const formatRelativeTime = (createdAt) => {
  if (!createdAt) return 'Just now'

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000))
  if (elapsedSeconds < 60) return 'Just now'
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)} min ago`
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)} hr${Math.floor(elapsedSeconds / 3600) === 1 ? '' : 's'} ago`
  return `${Math.floor(elapsedSeconds / 86400)} day${Math.floor(elapsedSeconds / 86400) === 1 ? '' : 's'} ago`
}

function ActivityFeed({ activities = [], title = 'Live Activity Feed' }) {
  const [isOpen, setIsOpen] = useState(false)
  const orderedActivities = [...activities].sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))

  return (
    <section className="activity-feed">
      <button className="activity-feed-toggle" type="button" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen}>
        <span><FiActivity /> {title}</span><FiChevronDown className={isOpen ? 'is-open' : ''} />
      </button>
      {isOpen && <div className="activity-feed-panel">{orderedActivities.length === 0 ? <p className="empty-inline">No activity yet.</p> : <div className="activity-list">{orderedActivities.map((activity, index) => { const hasFeedback = Boolean(activity.feedback) || /feedback:/i.test(activity.text || ''); return <article className={`activity-item ${hasFeedback ? 'activity-item-feedback' : ''}`} key={`${activity.createdAt || 'activity'}-${index}`}><span className="activity-live-dot" /><div className="activity-copy"><p>{hasFeedback && <FiMessageSquare className="activity-feedback-icon" />}{activity.text}</p><div><span className={`activity-role role-${activity.performedBy?.role || 'unknown'}`}>{activity.performedBy?.role || 'Team'}</span><time>{formatRelativeTime(activity.createdAt)}</time></div></div></article>})}</div>}</div>}
    </section>
  )
}

export default ActivityFeed
