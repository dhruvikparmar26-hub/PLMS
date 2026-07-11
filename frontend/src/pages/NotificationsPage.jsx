import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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
      case 'course_match': return '📚';
      case 'streak_warning': return '⚠️';
      case 'announcement': return '📢';
      case 'enrollment': return '🎓';
      case 'quiz_completed': return '🎯';
      case 'lesson_completed': return '📖';
      case 'bookmark_added': return '🔖';
      case 'course_completed': return '🏆';
      case 'rating_submitted': return '⭐';
      case 'achievement_earned': return '🥇';
      default: return '🔔';
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 24px', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: '16px',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Notification Center</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Stay updated on your learning activities and course updates.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              MARK ALL READ ({unreadCount})
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
            SCANNING_NOTIFICATION_REGISTRY...
          </div>
        ) : notifications.length === 0 ? (
          <div className="blueprint-card" style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
          }}>
            NO_NOTIFICATIONS_FOUND
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="blueprint-card animate-fade-in-up"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  borderLeft: !notification.read ? '3px solid var(--accent-primary)' : '1px solid var(--border-default)',
                  background: !notification.read ? 'rgba(0, 240, 255, 0.02)' : 'var(--bg-surface)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    margin: '0 0 6px 0',
                    lineHeight: 1.4,
                    fontWeight: !notification.read ? 600 : 400,
                  }}>
                    {notification.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {notification.link && (
                      <a
                        href={notification.link}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification._id);
                        }}
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--accent-primary)',
                          textDecoration: 'none',
                          fontWeight: 700,
                        }}
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                </div>

                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
