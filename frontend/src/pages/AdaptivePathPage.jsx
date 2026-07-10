import DashboardLayout from '../components/layout/DashboardLayout';
import AdaptivePath from '../components/dashboard/AdaptivePath';

export default function AdaptivePathPage() {
  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Adaptive Path</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Calibrate your skill level parameters and track progression across topics.
          </p>
        </div>

        <div className="blueprint-card" style={{ padding: '24px' }}>
          <AdaptivePath />
        </div>
      </div>
    </DashboardLayout>
  );
}
