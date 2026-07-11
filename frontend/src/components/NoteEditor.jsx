import { useState, useEffect } from 'react';
import api from '../api';

export default function NoteEditor({ lessonId, courseId }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchNote();
  }, [lessonId]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/lesson/${lessonId}`);
      if (response.data.data) {
        setNote(response.data.data.content);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.post('/notes', {
        lessonId,
        courseId,
        content: note,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>Loading notes...</div>;
  }

  return (
    <div className="blueprint-card" style={{ padding: '20px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 className="font-display" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        📝 Notes
      </h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your private notes for this lesson here..."
        className="input-field"
        style={{
          width: '100%',
          height: '120px',
          padding: '12px',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {saved ? (
          <span className="font-mono" style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>
            [✓] SAVED SUCCESSFULLY
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{
            fontSize: '0.75rem',
            padding: '8px 20px',
            cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
