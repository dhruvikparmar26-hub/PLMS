import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StreakTracker from '../components/StreakTracker';
import LeaderboardSection from '../components/LeaderboardSection';
import api from '../api';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState({ earned: [], locked: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/achievements/user');
        setAchievements(res.data.data || { earned: [], locked: [] });
      } catch (err) {
        console.error(err);
        setAchievements({
          earned: [
            { _id: '1', title: '7 Day Streak', icon: '🔥', description: 'Calibrated study behaviors over 7 consecutive cycles.' },
            { _id: '2', title: 'Quick Learner', icon: '⚡', description: 'Acquired 5 lesson indexes in under 24 hours.' },
          ],
          locked: [
            { _id: '3', title: 'Quiz Master', icon: '🧠', description: 'Attain a 1.0 accuracy score across 10 evaluation specs.' },
            { _id: '4', title: 'Concept Explorer', icon: '🕸', description: 'Resolve and verify 20 cognitive concepts.' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ width: '100%' }} className="animate-fade-in-up">
        
        {/* Achievements header */}
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Achievements & Streak Calibrations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Inspect your gamified calibration coefficients and leaderboard standings.
          </p>
        </div>

        <div className="dashboard-grid-2col" style={{ marginBottom: '24px' }}>
          <div className="blueprint-card" style={{ padding: '24px' }}>
            <StreakTracker />
          </div>
          <div className="blueprint-card" style={{ padding: '24px' }}>
            <LeaderboardSection />
          </div>
        </div>

        <div className="blueprint-card" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '24px' }}>Earned Badges</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {achievements.earned.map((badge) => (
              <div key={badge._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '20px', borderRadius: '8px' }}>
                <span style={{ fontSize: '2rem' }}>{badge.icon}</span>
                <h4 style={{ margin: '12px 0 6px' }}>{badge.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{badge.description}</p>
              </div>
            ))}
          </div>

          <h2 style={{ margin: '40px 0 24px' }}>Locked Badges</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {achievements.locked.map((badge) => (
              <div key={badge._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px dashed var(--border-default)', padding: '20px', borderRadius: '8px', opacity: 0.6 }}>
                <span style={{ fontSize: '2rem', filter: 'grayscale(1)' }}>{badge.icon}</span>
                <h4 style={{ margin: '12px 0 6px', color: 'var(--text-muted)' }}>{badge.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
