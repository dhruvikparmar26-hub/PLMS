import DashboardLayout from '../components/layout/DashboardLayout';
import ReviewQueue from '../components/ReviewQueue';

export default function ReviewQueuePage() {
  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Review Queue</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Reinforce your retention parameters with targeted SM-2 interval reviews.
          </p>
        </div>

        <div className="blueprint-card" style={{ padding: '24px' }}>
          <ReviewQueue />
        </div>
      </div>
    </DashboardLayout>
  );
}
