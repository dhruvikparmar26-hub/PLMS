import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notes').then((res) => {
      setNotes(res.data.notes || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>My Notes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Comprehensive diagnostic notes generated across lessons.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>RETRIEVING_COMPILED_NOTES...</div>
        ) : notes.length === 0 ? (
          <div className="blueprint-card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No notes yet. Add notes while studying lessons.</p>
            <Link to="/courses" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notes.map((note) => (
              <div key={note._id} className="blueprint-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)' }}>
                      {note.course?.title}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      › {note.lesson?.title}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
