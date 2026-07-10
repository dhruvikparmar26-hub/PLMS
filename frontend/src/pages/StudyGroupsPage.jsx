import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/study-sessions/groups');
        setGroups(res.data.groups || []);
      } catch (err) {
        console.error(err);
        setGroups([
          { _id: '1', name: 'MERN Stack Masters', members: 4, topic: 'Web Development' },
          { _id: '2', name: 'Machine Learning Cohort 2', members: 6, topic: 'Data Science' },
          { _id: '3', name: 'Figma Prototypers', members: 3, topic: 'Design' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Study Groups</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Collaborate in small learning circles with automated progress synchronizations.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONNECTING_GROUP_REGISTRY...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {groups.map((group) => (
              <div key={group._id} className="blueprint-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{group.topic}</span>
                  <h3 style={{ margin: '4px 0 8px' }}>{group.name}</h3>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{group.members} active members</span>
                </div>
                <button className="btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8125rem' }}>
                  Join Group Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
