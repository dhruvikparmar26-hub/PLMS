import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [dueCards, setDueCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [createError, setCreateError] = useState('');

  const fetchFlashcards = async () => {
    try {
      const [allRes, dueRes] = await Promise.all([
        api.get('/flashcards'),
        api.get('/flashcards/due'),
      ]);
      setFlashcards(allRes.data.flashcards || []);
      setDueCards(dueRes.data.flashcards || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleCreate = async () => {
    if (!newFront.trim() || !newBack.trim()) {
      setCreateError('Both front and back are required.');
      return;
    }
    try {
      setCreateError('');
      await api.post('/flashcards', { front: newFront, back: newBack });
      setNewFront('');
      setNewBack('');
      setCreating(false);
      fetchFlashcards();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create flashcard.');
    }
  };

  const handleReview = async (quality) => {
    if (currentIdx >= dueCards.length) return;
    const card = dueCards[currentIdx];
    try {
      await api.post(`/flashcards/${card._id}/review`, { quality });
      setFlipped(false);
      setCurrentIdx((i) => i + 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div className="notebook-margin">
            <h1>Flashcards</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
              Spaced repetition flashcards with SM-2 algorithm calibration.
            </p>
          </div>
          <button 
            onClick={() => setCreating(!creating)} 
            className="btn-primary"
            style={{ fontSize: '0.8125rem', padding: '10px 16px', minHeight: '36px' }}
          >
            {creating ? 'Cancel' : '+ Create Flashcard'}
          </button>
        </div>

        {creating && (
          <div className="blueprint-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Create New Flashcard</h3>
            {createError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginBottom: '12px' }}>{createError}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>FRONT (QUESTION / PROMPT)</label>
                <textarea 
                  className="input-field" 
                  value={newFront} 
                  onChange={(e) => setNewFront(e.target.value)} 
                  style={{ width: '100%', minHeight: '80px', background: 'var(--bg-canvas)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>BACK (ANSWER / EXPLANATION)</label>
                <textarea 
                  className="input-field" 
                  value={newBack} 
                  onChange={(e) => setNewBack(e.target.value)} 
                  style={{ width: '100%', minHeight: '80px', background: 'var(--bg-canvas)' }}
                />
              </div>
              <button onClick={handleCreate} className="btn-primary">Save Flashcard</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SCANNING_QUEUE...</div>
        ) : reviewMode ? (
          <div className="blueprint-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {currentIdx < dueCards.length ? (
              <>
                <span className="mono-badge">Card {currentIdx + 1} of {dueCards.length}</span>
                <div 
                  onClick={() => setFlipped(!flipped)}
                  style={{
                    width: '100%', minHeight: '200px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                    cursor: 'pointer', textAlign: 'center', position: 'relative'
                  }}
                >
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {flipped ? dueCards[currentIdx].back : dueCards[currentIdx].front}
                  </p>
                  <span style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {flipped ? 'Click to show front' : 'Click to flip and reveal answer'}
                  </span>
                </div>

                {flipped && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', width: '100%' }}>
                    {[
                      { val: 0, label: 'Forgot (0)' },
                      { val: 1, label: 'Incorrect (1)' },
                      { val: 2, label: 'Hard (2)' },
                      { val: 3, label: 'Medium (3)' },
                      { val: 4, label: 'Good (4)' },
                      { val: 5, label: 'Easy (5)' },
                    ].map((q) => (
                      <button 
                        key={q.val} 
                        onClick={() => handleReview(q.val)}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'var(--success)' }}>Review Session Complete!</h3>
                <button onClick={() => { setReviewMode(false); setCurrentIdx(0); fetchFlashcards(); }} className="btn-primary" style={{ marginTop: '16px' }}>Done</button>
              </div>
            )}
          </div>
        ) : (
          <div className="blueprint-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span className="mono-badge">{flashcards.length} TOTAL · {dueCards.length} DUE</span>
              {dueCards.length > 0 && (
                <button onClick={() => setReviewMode(true)} className="btn-primary">Start Review Session</button>
              )}
            </div>

            {flashcards.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No flashcards yet. Create one to get started!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {flashcards.map((card) => (
                  <div key={card._id} style={{ border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{card.front}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.back}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
