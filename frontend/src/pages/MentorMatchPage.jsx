import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function MentorMatchPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/users/mentors');
        setMentors(res.data.mentors || []);
      } catch (err) {
        console.error(err);
        setMentors([
          { _id: '1', name: 'Dr. Jane Doe', expertise: 'Web Architecture', rating: 4.9, bio: 'Former Senior Architect at Google. Loves explaining system design.' },
          { _id: '2', name: 'Devon Webb', expertise: 'UI Design Systems', rating: 4.8, bio: 'Design lead with 8+ years experience building SaaS UI frameworks.' },
          { _id: '3', name: 'Aria Chen', expertise: 'Data Science & PyTorch', rating: 5.0, bio: 'Machine learning scientist specializing in natural language models.' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Mentor Match</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Book 1-on-1 diagnostic sessions with verified domain experts to calibrate your learning path.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LOCATING_AVAILABLE_MENTORS...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mentors.map((mentor) => (
              <div key={mentor._id} className="blueprint-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7B68EE, #F2B056)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0
                }}>
                  {mentor.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{mentor.name}</h3>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>Expertise: {mentor.expertise}</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--success)' }}>★ {mentor.rating} Rating</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>{mentor.bio}</p>
                  <button className="btn-primary" style={{ marginTop: '16px', padding: '8px 16px', fontSize: '0.8125rem' }}>
                    Book Calibrations Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
