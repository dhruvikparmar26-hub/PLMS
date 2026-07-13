import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../NotificationCenter';
import api from '../../api';

/**
 * TopBar — Top navigation bar with search, streak, XP, notifications, and profile.
 */
const TopBar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [streakCount, setStreakCount] = useState(0);
  useEffect(() => {
    if (user) {
      api.get('/streak')
        .then((res) => setStreakCount(res.data.currentStreak || 0))
        .catch(() => setStreakCount(0));
    } else {
      setStreakCount(0);
    }
  }, [user]);

  const xp = user?.xp || 0;
  const level = Math.floor(xp / 500) + 1;

  return (
    <header className="topbar">
      {/* Mobile hamburger */}
      <button className="topbar-hamburger" onClick={onMenuToggle} aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>

      {/* Search */}
      <form className="topbar-search" onSubmit={handleSearch}>
        <span className="topbar-search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search courses, lessons, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="topbar-search-input"
        />
      </form>

      {/* Right section */}
      <div className="topbar-actions" style={{ gap: '20px', marginLeft: 'auto' }}>
        {user ? (
          <>
            {/* Streak */}
            <div className="topbar-stat" title={`${streakCount} day streak`}>
              <span className="topbar-stat-icon topbar-stat-icon--fire">🔥</span>
              <div>
                <span className="topbar-stat-value" style={{ display: 'block', fontWeight: 800 }}>{streakCount}</span>
                <span className="topbar-stat-label" style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)' }}>Current Streak</span>
              </div>
            </div>

            {/* XP */}
            <div className="topbar-stat" title={`${xp} XP — Level ${level}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="topbar-stat-icon topbar-stat-icon--xp" style={{ color: 'var(--accent-primary)', fontSize: '1.25rem' }}>🔶</span>
              <div>
                <span className="topbar-stat-value" style={{ display: 'block', fontWeight: 800 }}>{xp.toLocaleString()} XP</span>
                <span className="topbar-stat-label" style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)' }}>Level {level}</span>
              </div>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* Username */}
            <span className="topbar-profile-name" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 700 }}>
              {user.name}
            </span>

            {/* Profile Avatar */}
            <div className="topbar-profile-wrapper" ref={profileRef} style={{ position: 'relative' }}>
              <button
                className="topbar-profile-btn"
                onClick={() => setShowProfile(!showProfile)}
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0 }}
              >
                <div className="topbar-avatar" style={{ margin: 0, width: '34px', height: '34px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </button>
              {showProfile && (
                <div className="topbar-profile-dropdown" style={{ position: 'absolute', top: '120%', right: 0, zIndex: 100, minWidth: '150px' }}>
                  <Link to="/settings" className="topbar-dropdown-item" onClick={() => setShowProfile(false)}>
                    ⚙ Settings
                  </Link>
                  <Link to="/analytics" className="topbar-dropdown-item" onClick={() => setShowProfile(false)}>
                    ◉ My Insights
                  </Link>
                </div>
              )}
            </div>

            {/* Logout option */}
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                minHeight: '34px',
                cursor: 'pointer',
                background: 'transparent',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          /* Non-logged-in buttons */
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8125rem', textDecoration: 'none', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Login
            </Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem', textDecoration: 'none', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-primary)', border: 'none' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};


export default TopBar;
