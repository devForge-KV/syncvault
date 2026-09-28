import { NavLink, useNavigate } from 'react-router-dom'
import { FiGrid, FiLogOut, FiMessageSquare, FiPlusCircle, FiSettings, FiZap } from 'react-icons/fi'

function WorkspaceShell({ children, role, user, onNewProject, onOpenSettings, onFocusProjects, onContactAgency }) {
  const navigate = useNavigate()
  const isAgency = role === 'agency'
  const planName = { starter: 'Starter', agency_pro: 'Agency Pro', enterprise: 'Enterprise' }[user?.plan] || 'Starter'

  const handleLogout = () => {
    localStorage.removeItem('syncvault_token')
    localStorage.removeItem('syncvault_user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="workspace-layout">
      <aside className="sidebar">
        <div className="brand-mark sidebar-brand">S<span>/</span>V</div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink to={isAgency ? '/dashboard' : '/portal'} className={({ isActive }) => `side-nav-link ${isActive ? 'active' : ''}`}><FiGrid /> Overview</NavLink>
          {isAgency && <button className="side-nav-link" type="button" onClick={onFocusProjects}><FiGrid /> All Projects</button>}
          {isAgency && <button className="side-nav-link" type="button" onClick={onOpenSettings}><FiSettings /> Workspace Settings</button>}
          {!isAgency && <button className="side-nav-link" type="button" onClick={onContactAgency}><FiMessageSquare /> Contact Agency</button>}
        </nav>
        <div className="sidebar-bottom">
          {user?.role === 'superadmin' && <button className="side-nav-link founder-nav-link" type="button" onClick={() => navigate('/admin')}><FiZap /> Founder Control Room</button>}
          <div className="profile-mini">
            <div className="avatar">{user?.name?.slice(0, 1).toUpperCase() || 'S'}</div>
            <div className="profile-copy"><strong>{user?.name || 'SyncVault user'}</strong><span>{isAgency ? 'Agency workspace' : 'Client workspace'}</span></div>
          </div>
          {isAgency && <div className="sidebar-plan"><span>Current plan</span><strong>{planName}</strong></div>}
          <button className="logout-button" type="button" onClick={handleLogout}><FiLogOut /> Sign out</button>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-header">
          <div className="mobile-brand">
            <span className="mobile-brand-symbol">S<span>/</span>V</span>
            <span className="mobile-brand-name">SyncVault</span>
          </div>
          <div className="header-actions">
            <span className="live-dot">LIVE</span>
            {isAgency && <button className="secondary-button" onClick={onNewProject}><FiPlusCircle /> New project</button>}
          </div>
          <button className="mobile-logout-button" type="button" onClick={handleLogout}><FiLogOut /> Logout</button>
        </header>
        {children}
      </main>
    </div>
  )
}

export default WorkspaceShell
