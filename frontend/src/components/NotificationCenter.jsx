import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s for more responsiveness
    
    window.addEventListener('refreshNotifications', fetchNotifications);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', fetchNotifications);
    };
  }, []);

  useEffect(() => {
    // Click outside handler to close dropdown
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course_match':
        return '📚';
      case 'streak_warning':
        return '⚠️';
      case 'announcement':
        return '📢';
      case 'enrollment':
        return '🎓';
      case 'quiz_completed':
        return '🎯';
      case 'lesson_completed':
        return '📖';
      case 'bookmark_added':
        return '🔖';
      case 'course_completed':
        return '🏆';
      case 'rating_submitted':
        return '⭐';
      case 'achievement_earned':
        return '🥇';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          color: isOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
          position: 'relative',
        }}
        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <svg
          style={{ width: '20px', height: '20px' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'var(--danger)',
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 800,
            borderRadius: '50%',
            width: '15px',
            height: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 6px var(--danger)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          marginTop: '10px',
          width: '320px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 1px 1px var(--border-default)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{
            maxHeight: '340px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '30px 20px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
              }}>
                ALL_SYSTEMS_CLEAR
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: !notification.read ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                >
                  {/* Left indicator line for unread */}
                  {!notification.read && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: 'var(--accent-primary)',
                    }} />
                  )}

                  <span style={{ fontSize: '1.25rem', lineHeight: 1, marginTop: '2px' }}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: 'var(--text-primary)',
                      fontSize: '0.78125rem',
                      lineHeight: 1.4,
                      margin: '0 0 4px',
                      fontWeight: !notification.read ? 600 : 400,
                    }}>
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {notification.link && (
                        <Link
                          to={notification.link}
                          onClick={() => {
                            setIsOpen(false);
                            if (!notification.read) {
                              markAsRead(notification._id);
                            }
                          }}
                          style={{
                            fontSize: '0.6875rem',
                            color: 'var(--accent-primary)',
                            textDecoration: 'none',
                            fontWeight: 700,
                          }}
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
