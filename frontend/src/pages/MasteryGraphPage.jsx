import DashboardLayout from '../components/layout/DashboardLayout';
import ConceptMasteryGraph from '../components/dashboard/ConceptMasteryGraph';

export default function MasteryGraphPage() {
  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Mastery Graph</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Interactive blueprint mapping of your conceptual mastery and cognitive decay metrics.
          </p>
        </div>

        <div className="blueprint-card" style={{ padding: '24px' }}>
          <ConceptMasteryGraph />
        </div>
      </div>
    </DashboardLayout>
  );
}
