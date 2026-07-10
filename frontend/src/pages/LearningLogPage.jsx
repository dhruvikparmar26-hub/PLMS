import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import DashboardLayout from '../components/layout/DashboardLayout';

// ── Sub-components ──────────────────────────────────────────────────

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: active ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
        border: active ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid transparent',
        borderRadius: 'var(--radius-sm)',
        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '6px 16px',
        cursor: 'pointer',
        letterSpacing: '0.05em',
        transition: 'all var(--transition-fast)',
      }}
    >
      {children}
    </button>
  );
}

// ── Notes Tab ───────────────────────────────────────────────────────

function NotesTab() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notes').then((res) => {
      setNotes(res.data.notes || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>LOADING_NOTES...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {notes.length === 0 ? (
        <div className="blueprint-card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No notes yet. Take notes while viewing lessons.</p>
          <Link to="/courses" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', fontSize: '0.875rem', padding: '8px 20px', textDecoration: 'none' }}>
            Browse courses
          </Link>
        </div>
      ) : (
        notes.map((note) => (
          <div key={note._id} className="blueprint-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-primary)' }}>
                  {note.course?.title || 'COURSE'}
                </span>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  › {note.lesson?.title || 'LESSON'}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {note.content}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

// ── Flashcards Tab ──────────────────────────────────────────────────

function FlashcardsTab() {
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

  if (loading) return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>LOADING_FLASHCARDS...</div>;

  if (reviewMode) {
    const card = dueCards[currentIdx];
    if (!card || currentIdx >= dueCards.length) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: '2rem', marginBottom: '16px' }}>✅</p>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--success)', marginBottom: '8px' }}>Review Session Complete!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>{dueCards.length} cards reviewed.</p>
          <button onClick={() => { setReviewMode(false); setCurrentIdx(0); fetchFlashcards(); }} className="btn-primary">
            Done
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '24px 0' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {currentIdx + 1} / {dueCards.length} DUE
        </div>
        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            width: '100%', maxWidth: '500px', minHeight: '200px',
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', padding: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', transition: 'transform var(--transition-base)',
          }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: flipped ? 'var(--success)' : 'var(--accent-primary)', marginBottom: '12px' }}>
              {flipped ? 'ANSWER' : 'QUESTION'} — Click to flip
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {flipped ? card.back : card.front}
            </p>
          </div>
        </div>

        {flipped && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Again', quality: 0, color: 'var(--danger)' },
              { label: 'Hard', quality: 2, color: 'var(--accent-secondary)' },
              { label: 'Good', quality: 3, color: 'var(--accent-primary)' },
              { label: 'Easy', quality: 5, color: 'var(--success)' },
            ].map(({ label, quality, color }) => (
              <button
                key={label}
                onClick={() => handleReview(quality)}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: `1px solid ${color}`,
                  borderRadius: 'var(--radius-sm)',
                  color, fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                  fontWeight: 700, padding: '8px 20px', cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <button onClick={() => setReviewMode(false)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
          Exit Review
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {dueCards.length > 0 && (
            <button onClick={() => setReviewMode(true)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
              Review {dueCards.length} Due
            </button>
          )}
          <button onClick={() => setCreating(!creating)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
            {creating ? 'Cancel' : '+ New Card'}
          </button>
        </div>
        <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {flashcards.length} TOTAL · {dueCards.length} DUE
        </span>
      </div>

      {/* Create form */}
      {creating && (
        <div className="blueprint-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {createError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{createError}</p>}
          <textarea
            value={newFront}
            onChange={(e) => setNewFront(e.target.value)}
            placeholder="Front (question/term)..."
            rows={3}
            style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px', resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}
          />
          <textarea
            value={newBack}
            onChange={(e) => setNewBack(e.target.value)}
            placeholder="Back (answer/definition)..."
            rows={4}
            style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '10px', resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}
          />
          <button onClick={handleCreate} className="btn-primary" style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '6px 18px' }}>
            Create Card
          </button>
        </div>
      )}

      {/* Flashcards list */}
      {flashcards.length === 0 ? (
        <div className="blueprint-card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No flashcards yet. Create your first one above!</p>
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '12px' }}>
            Tip: you can also generate flashcards from your lesson notes
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {flashcards.map((card) => (
            <div key={card._id} className="blueprint-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="font-mono" style={{ fontSize: '0.65rem', color: card.dueDate <= new Date() ? 'var(--accent-secondary)' : 'var(--success)' }}>
                {card.dueDate <= new Date() ? '⚡ DUE NOW' : `✓ NEXT: ${new Date(card.dueDate).toLocaleDateString()}`}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>{card.front}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, borderTop: '1px solid var(--border-default)', paddingTop: '8px' }}>{card.back}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bookmarks Tab ────────────────────────────────────────────────────

function BookmarksTab() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookmarks').then((res) => {
      setBookmarks(res.data.bookmarks || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const removeBookmark = async (id) => {
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>LOADING_BOOKMARKS...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {bookmarks.length === 0 ? (
        <div className="blueprint-card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No bookmarks yet. Bookmark lessons to save them here.</p>
          <Link to="/courses" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', fontSize: '0.875rem', padding: '8px 20px', textDecoration: 'none' }}>
            Browse courses
          </Link>
        </div>
      ) : (
        bookmarks.map((bm) => (
          <div key={bm._id} className="blueprint-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-primary)' }}>
                  {bm.course?.title}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {bm.lesson?.title}
              </p>
              {bm.note && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{bm.note}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <Link
                to={`/lessons/${bm.lesson?._id}`}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '5px 12px', textDecoration: 'none' }}
              >
                Resume
              </Link>
              <button
                onClick={() => removeBookmark(bm._id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Certificates Tab ─────────────────────────────────────────────────

function CertificatesTab() {
  const [certificates, setCertificates] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certsRes, enrollmentsRes, recsRes] = await Promise.all([
          api.get('/certificates'),
          api.get('/enrollments/me'),
          api.get('/adaptive/learning-path'),
        ]);
        setCertificates(certsRes.data.certificates || []);
        setEnrollments(enrollmentsRes.data.enrollments || []);
        setRecommendedCourses(recsRes.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>LOADING_CERTIFICATES...</div>;

  // Get 3 nearest-to-complete enrolled courses (highest progress, not 100%)
  const nearCompleteCourses = enrollments
    .filter(e => e.progressPercent < 100)
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, 3);

  // If no enrollments, use recommended beginner courses
  const suggestionCourses = nearCompleteCourses.length > 0 
    ? nearCompleteCourses.map(e => e.course)
    : recommendedCourses.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {certificates.length === 0 ? (
        <div className="blueprint-card" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No certificates yet. Complete a course to earn your first one!</p>
          <Link to="/courses" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', fontSize: '0.875rem', padding: '8px 20px', textDecoration: 'none' }}>
            Browse courses
          </Link>
          
          {suggestionCourses.length > 0 && (
            <div style={{ marginTop: '32px', textAlign: 'left' }}>
              <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {nearCompleteCourses.length > 0 ? 'NEAR TO COMPLETE:' : 'RECOMMENDED FOR YOU:'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suggestionCourses.map((course, idx) => (
                  <Link 
                    key={course._id || idx}
                    to={`/courses/${course._id}`}
                    className="blueprint-card"
                    style={{ 
                      padding: '12px 16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      textDecoration: 'none',
                      background: 'var(--bg-canvas)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {course.title}
                      </p>
                      <p className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {course.category} · {course.difficulty}
                      </p>
                    </div>
                    {nearCompleteCourses.length > 0 && (
                      <span className="font-mono" style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--accent-primary)', 
                        fontWeight: 700,
                        marginLeft: '12px'
                      }}>
                        {enrollments.find(e => e.course._id === course._id)?.progressPercent || 0}%
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        certificates.map((cert) => (
          <div key={cert._id} className="blueprint-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎓</span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: cert.grade === 'Distinction' ? 'var(--accent-secondary)' : cert.grade === 'Merit' ? 'var(--accent-primary)' : 'var(--success)',
                    border: `1px solid currentColor`,
                    padding: '1px 6px',
                    borderRadius: '3px',
                  }}
                >
                  {cert.grade}
                </span>
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {cert.course?.title}
              </h4>
              <p className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {cert.course?.category} · Issued {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
            </div>
            <Link to={`/certificates/${cert._id}`} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 16px', textDecoration: 'none', flexShrink: 0 }}>
              View
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function LearningLogPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');

  const tabs = [
    { id: 'notes', label: 'NOTES' },
    { id: 'flashcards', label: 'FLASHCARDS' },
    { id: 'bookmarks', label: 'BOOKMARKS' },
    { id: 'certificates', label: 'CERTIFICATES' },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        {/* Title */}
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Learning Log</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Your notes, flashcards, bookmarks, and certificates in one place.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
          {tabs.map((tab) => (
            <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </TabButton>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'notes' && <NotesTab />}
        {activeTab === 'flashcards' && <FlashcardsTab />}
        {activeTab === 'bookmarks' && <BookmarksTab />}
        {activeTab === 'certificates' && <CertificatesTab />}
      </div>
    </DashboardLayout>
  );
}
