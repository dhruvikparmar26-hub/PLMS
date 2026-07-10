import DashboardLayout from '../components/layout/DashboardLayout';
import LeaderboardSection from '../components/LeaderboardSection';

export default function LeaderboardPage() {
  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Global Standings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Real-time standings calibrated across the learning platform.
          </p>
        </div>

        <div className="blueprint-card" style={{ padding: '24px' }}>
          <LeaderboardSection />
        </div>
      </div>
    </DashboardLayout>
  );
}
