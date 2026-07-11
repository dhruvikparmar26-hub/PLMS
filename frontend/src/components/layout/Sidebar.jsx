import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

/**
 * Sidebar — Grouped navigation matching the Learnova dashboard design.
 */
const Sidebar = ({ mobileOpen, onClose, onOpenAI }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const sidebarDesktopRef = useRef(null);
  const sidebarMobileRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Restore sidebar scroll position across route re-mounts
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('sidebar-scroll');
    if (savedScroll) {
      const parsed = parseInt(savedScroll, 10);
      setTimeout(() => {
        if (sidebarDesktopRef.current) sidebarDesktopRef.current.scrollTop = parsed;
        if (sidebarMobileRef.current) sidebarMobileRef.current.scrollTop = parsed;
      }, 0);
    }
  }, []);

  const handleScroll = (e) => {
    sessionStorage.setItem('sidebar-scroll', e.target.scrollTop);
  };

  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications');
        setUnreadCount(response.data.data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching unread count for sidebar:', error);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    
    window.addEventListener('refreshNotifications', fetchUnreadCount);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', fetchUnreadCount);
    };
  }, [user]);

  const navGroups = [
    {
      label: 'LEARN',
      items: [
        { label: 'Courses', path: '/courses', icon: '▦' },
        { label: 'Flashcards', path: '/flashcards', icon: '🎴' },
        { label: 'Review Queue', path: '/review-queue', icon: '🔁' },
        { label: 'Quizzes', path: '/quizzes', icon: '📝' },
        { label: 'Concept Map', path: '/mastery-graph', icon: '🕸️' },
      ],
    },
    {
      label: 'ENGAGE',
      items: [
        { label: 'Live Sessions', path: '/live-sessions', icon: '📹', badge: 'LIVE' },
        { label: 'Q&A Forum', path: '/community', icon: '💬' },
        { label: 'Study Groups', path: '/study-groups', icon: '👥' },
        { label: 'Mentor Match', path: '/mentor-match', icon: '🤝' },
      ],
    },
    {
      label: 'PROGRESS',
      items: [
        { label: 'Achievements', path: '/achievements', icon: '🏆' },
        { label: 'Certificates', path: '/learning-log', icon: '🎓' },
        { label: 'Leaderboard', path: '/leaderboard', icon: '📊' },
        { label: 'Analytics', path: '/analytics', icon: '📈' },
      ],
    },
    {
      label: 'TOOLS',
      items: [
        { label: 'Notes', path: '/notes', icon: '📒' },
        { label: 'Bookmarks', path: '/bookmarks', icon: '🔖' },
        { label: 'Notifications', path: '/notifications', icon: '🔔', badgeCount: unreadCount },
        { label: 'Settings', path: '/settings', icon: '⚙️' },
      ],
    },
  ];

  if (user?.role === 'instructor' || user?.role === 'admin') {
    navGroups.push({
      label: 'INSTRUCTOR',
      items: [
        { label: 'Instructor Hub', path: '/instructor', icon: '⊞' },
      ],
    });
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark" style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
          <span style={{ fontSize: '1.25rem' }}>★</span>
        </div>
        <div>
          <div className="sidebar-brand" style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>Momentum</div>
          <div className="sidebar-tagline" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Learn. Master. Progress.</div>
        </div>
        {mobileOpen && (
          <button onClick={onClose} className="sidebar-close-btn" aria-label="Close menu">✕</button>
        )}
      </div>

      {/* Main standalone navigation: Dashboard */}
      <div style={{ padding: '0 4px', marginBottom: '8px' }}>
        <Link
          to="/dashboard"
          onClick={onClose}
          className={`sidebar-link ${isActive('/dashboard') ? 'sidebar-link--active' : ''}`}
          style={isActive('/dashboard') ? {
            background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
          } : {}}
        >
          <span className="sidebar-link-icon">◫</span>
          <span className="sidebar-link-label">Dashboard</span>
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-label" style={{ fontSize: '0.625rem', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, paddingLeft: '12px', marginBottom: '4px' }}>
              {group.label}
            </div>
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`sidebar-link ${isActive(item.path) ? 'sidebar-link--active' : ''}`}
                style={isActive(item.path) ? {
                  background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                } : {}}
              >
                <span className="sidebar-link-icon" style={{ fontSize: '0.95rem' }}>{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
                {item.badge && (
                  <span className="sidebar-badge-live" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa', fontSize: '0.55rem', fontWeight: 800 }}>
                    <span className="sidebar-badge-dot" style={{ backgroundColor: '#a78bfa' }}></span>
                    {item.badge}
                  </span>
                )}
                {item.badgeCount && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: '#EF4444',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    marginLeft: 'auto'
                  }}>
                    {item.badgeCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* AI Tutor CTA */}
      <button 
        onClick={onOpenAI} 
        className="sidebar-ai-btn"
        style={{
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
          color: '#fff',
          fontWeight: 700,
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          width: '100%',
          marginTop: 'auto'
        }}
      >
        <span className="sidebar-ai-icon" style={{ fontSize: '1rem' }}>✦</span>
        AI Tutor
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Mobile Sidebar */}
      <aside 
        ref={sidebarMobileRef} 
        onScroll={handleScroll} 
        className={`sidebar sidebar--mobile ${mobileOpen ? 'sidebar--open' : ''}`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        ref={sidebarDesktopRef} 
        onScroll={handleScroll} 
        className="sidebar sidebar--desktop"
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
