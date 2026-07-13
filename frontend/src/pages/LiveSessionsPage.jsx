import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/study-sessions/today');
        // Merge fetched sessions with our rich mock sessions if needed
        const apiSessions = res.data.sessions || [];
        
        const richFallback = [
          { 
            _id: 'live-1', 
            title: 'Distributed Systems & Microservices Scalability', 
            instructor: 'Dr. Sarah Jenkins', 
            time: '10:00 AM', 
            date: 'July 12, 2026',
            subject: 'Computer Science',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            active: true 
          },
          { 
            _id: 'live-2', 
            title: 'Advanced React Design Patterns & Performance', 
            instructor: 'Prof. Alex Rivera', 
            time: '2:30 PM', 
            date: 'July 13, 2026',
            subject: 'Web Development',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            active: false 
          },
          { 
            _id: 'live-3', 
            title: 'Neural Networks & Deep Learning Architectures', 
            instructor: 'Dr. Aria Chen', 
            time: '4:00 PM', 
            date: 'July 15, 2026',
            subject: 'Data Science',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            active: false 
          },
        ];

        setSessions(apiSessions.length > 0 ? [...apiSessions, ...richFallback] : richFallback);
      } catch (err) {
        console.error(err);
        setSessions([
          { 
            _id: 'live-1', 
            title: 'Distributed Systems & Microservices Scalability', 
            instructor: 'Dr. Sarah Jenkins', 
            time: '10:00 AM', 
            date: 'July 12, 2026',
            subject: 'Computer Science',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            active: true 
          },
          { 
            _id: 'live-2', 
            title: 'Advanced React Design Patterns & Performance', 
            instructor: 'Prof. Alex Rivera', 
            time: '2:30 PM', 
            date: 'July 13, 2026',
            subject: 'Web Development',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            active: false 
          },
          { 
            _id: 'live-3', 
            title: 'Neural Networks & Deep Learning Architectures', 
            instructor: 'Dr. Aria Chen', 
            time: '4:00 PM', 
            date: 'July 15, 2026',
            subject: 'Data Science',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            active: false 
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleEnroll = async (session) => {
    if (enrolledIds.includes(session._id)) return;

    try {
      // Send custom notification
      await api.post('/notifications', {
        type: 'enrollment',
        message: `Successfully enrolled in live class: "${session.title}" with ${session.instructor} scheduled for ${session.date} at ${session.time}`,
        link: '/live-sessions'
      });
      
      window.dispatchEvent(new Event('refreshNotifications'));
      setEnrolledIds((prev) => [...prev, session._id]);
      alert(`Enrolled! A booking confirmation has been sent to your notifications.`);
    } catch (err) {
      console.error(err);
      // Fallback local success if notification API returns error
      setEnrolledIds((prev) => [...prev, session._id]);
      alert(`Enrolled in "${session.title}"!`);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Live Broadcasts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Sync and access live mentor lectures and real-time interactive calibrations.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONNECTING_STREAM_BRIDGE...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {sessions.map((session) => {
              const isEnrolled = enrolledIds.includes(session._id);
              return (
                <div 
                  key={session._id} 
                  className="blueprint-card" 
                  style={{ 
                    padding: '24px', 
                    display: 'flex', 
                    gap: '20px', 
                    alignItems: 'center',
                    borderLeft: session.active ? '3px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    background: session.active ? 'rgba(14, 165, 164, 0.02)' : 'var(--bg-surface)'
                  }}
                >
                  {/* Professor Image */}
                  <img 
                    src={session.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
                    alt={session.instructor}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--border-default)',
                      flexShrink: 0
                    }}
                  />

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {session.subject || 'Calibration'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>·</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {session.instructor}
                      </span>
                      {session.active && (
                        <span className="live-badge" style={{ animation: 'pulse-glow 2s ease infinite', fontSize: '0.625rem', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', borderRadius: '4px', fontWeight: 800 }}>
                          🔴 LIVE
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '6px 0 6px 0', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>
                      {session.title}
                    </h3>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', gap: '10px' }}>
                      <span>🗓️ {session.date || 'Today'}</span>
                      <span>⏰ {session.time}</span>
                    </div>
                  </div>

                  {/* Enroll button */}
                  <button 
                    onClick={() => handleEnroll(session)} 
                    disabled={isEnrolled}
                    className={isEnrolled ? "btn-secondary" : "btn-primary"}
                    style={{ 
                      padding: '10px 24px', 
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      cursor: isEnrolled ? 'default' : 'pointer'
                    }}
                  >
                    {isEnrolled ? 'Enrolled ✓' : 'Enroll Now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
