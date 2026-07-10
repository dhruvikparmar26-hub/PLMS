import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/study-sessions/today');
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error(err);
        setSessions([
          { _id: '1', title: 'System Design Live Session', instructor: 'Dr. Jane Doe', time: '10:00 AM', active: true },
          { _id: '2', title: 'React Core Calibrations', instructor: 'Marcus Aurelius', time: '2:30 PM', active: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sessions.map((session) => (
              <div key={session._id} className="blueprint-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Instructor: {session.instructor || 'Lead Mentor'}</span>
                    {session.active && <span className="live-badge" style={{ animation: 'pulse-glow 2s ease infinite' }}>🔴 BROADCASTING_LIVE</span>}
                  </div>
                  <h3 style={{ margin: '8px 0 4px' }}>{session.title}</h3>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>Scheduled: {session.time}</span>
                </div>
                <button disabled={!session.active} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.8125rem' }}>
                  {session.active ? 'Join Stream' : 'Offline'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
