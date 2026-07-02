import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import { getLabel } from '../utils/labelMap';

const SchedulePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [weekStart, setWeekStart] = useState(null);
  const [weekEnd, setWeekEnd] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWeeklySessions();
    loadAvailableCourses();
  }, [currentWeek]);

  const loadWeeklySessions = async () => {
    try {
      setLoading(true);
      const weekStartStr = getStartOfWeek(currentWeek).toISOString();
      const res = await api.get(`/study-sessions/week?weekStart=${weekStartStr}`);
      setSessions(res.data.sessions);
      setWeekStart(new Date(res.data.weekStart));
      setWeekEnd(new Date(res.data.weekEnd));
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCourses = async () => {
    try {
      const res = await api.get('/study-sessions/courses');
      setCourses(res.data.courses);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getDaysOfWeek = () => {
    const days = [];
    const start = getStartOfWeek(currentWeek);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSessionsForDay = (date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
  };

  const handlePreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
    setSelectedDay(new Date());
  };

  const handlePreviousDay = () => {
    const newDay = new Date(selectedDay);
    newDay.setDate(newDay.getDate() - 1);
    setSelectedDay(newDay);
  };

  const handleNextDay = () => {
    const newDay = new Date(selectedDay);
    newDay.setDate(newDay.getDate() + 1);
    setSelectedDay(newDay);
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({
      courseId: '',
      title: '',
      description: '',
      scheduledDate: '',
      duration: 60,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/study-sessions', formData);
      handleCloseModal();
      loadWeeklySessions();
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await api.post(`/study-sessions/${sessionId}/complete`);
      loadWeeklySessions();
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await api.delete(`/study-sessions/${sessionId}`);
      loadWeeklySessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  };

  const days = getDaysOfWeek();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-canvas)' }}>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 999,
          }}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`md:hidden fixed left-0 top-0 bottom-0 z-[1000] transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-surface)', padding: '24px', width: '280px', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
                Momentum
              </span>
              <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.1em' }}>
                EST. 2026
              </span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', minWidth: '44px', minHeight: '44px' }}
            >
              ✕
            </button>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Overview', path: '/dashboard' },
              { label: 'Schedule', path: '/schedule' },
              { label: 'Library', path: '/courses' },
              { label: 'Certificates', path: '/learning-log' },
              { label: 'Support', path: '/onboarding' },
            ].map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px', borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem', fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  background: item.path === '/schedule' ? 'rgba(0,240,255,0.08)' : 'transparent',
                  color: item.path === '/schedule' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: item.path === '/schedule' ? '1px solid rgba(0,240,255,0.2)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                  minHeight: '44px',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button 
            onClick={handleLogout}
            className="btn-secondary"
            style={{ padding: '12px', fontSize: '0.875rem', minHeight: '44px' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between sidebar-spine w-60"
             style={{ background: 'var(--bg-surface)', padding: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
              Momentum
            </span>
            <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.1em' }}>
              EST. 2026
            </span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Overview', path: '/dashboard' },
              { label: 'Schedule', path: '/schedule' },
              { label: 'Library', path: '/courses' },
              { label: 'Certificates', path: '/learning-log' },
              { label: 'Support', path: '/onboarding' },
            ].map((item) => (
              <Link key={item.path} to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  fontSize: '0.8125rem', fontWeight: 500,
                  background: item.path === '/schedule' ? 'rgba(0,240,255,0.08)' : 'transparent',
                  border: item.path === '/schedule' ? '1px solid rgba(0,240,255,0.2)' : '1px solid transparent',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <button onClick={handleLogout} className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
          Sign out
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '56px', borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
              style={{ 
                background: 'none', border: 'none', fontSize: '1.5rem', 
                color: 'var(--text-primary)', cursor: 'pointer', 
                padding: '8px', minWidth: '44px', minHeight: '44px' 
              }}
            >
              ☰
            </button>
            <span className="tech-header hidden sm:block">SCHEDULE // WEEKLY_VIEW</span>
            <span className="tech-header sm:hidden">SCHEDULE</span>
          </div>
          <button
            onClick={handleOpenModal}
            className="btn-primary"
            style={{ padding: '6px 16px', fontSize: '0.75rem', minHeight: '36px' }}
          >
            + New Study Session
          </button>
        </header>

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          {/* Week Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={handlePreviousWeek} className="btn-secondary hidden sm:block" style={{ padding: '6px 12px', fontSize: '0.75rem', minHeight: '44px' }}>
                ← Previous
              </button>
              <button onClick={handlePreviousDay} className="btn-secondary sm:hidden" style={{ padding: '6px 12px', fontSize: '0.75rem', minHeight: '44px' }}>
               Previous Day
              </button>
              <button onClick={handleToday} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', minHeight: '44px' }}>
                Today
              </button>
              <button onClick={handleNextWeek} className="btn-secondary hidden sm:block" style={{ padding: '6px 12px', fontSize: '0.75rem', minHeight: '44px' }}>
                Next →
              </button>
              <button onClick={handleNextDay} className="btn-secondary sm:hidden" style={{ padding: '6px 12px', fontSize: '0.75rem', minHeight: '44px' }}>
                Next Day
              </button>
            </div>
            <h2 className="font-mono hidden sm:block" style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
              {weekStart && weekEnd && `${formatDate(weekStart)} - ${formatDate(weekEnd)}`}
            </h2>
            <h2 className="font-mono sm:hidden" style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
              {formatDate(selectedDay)}
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
              <div style={{
                width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : sessions.length === 0 ? (
            /* Empty State */
            <div className="blueprint-card" style={{ padding: '64px 32px', textAlign: 'center', borderStyle: 'dashed' }}>
              <span className="font-mono" style={{ fontSize: '1.5rem', display: 'block', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Nothing scheduled this week
              </span>
              <p className="font-display" style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Plan your first study session
              </p>
              <button
                onClick={handleOpenModal}
                className="btn-primary"
                style={{ fontSize: '0.875rem', padding: '10px 24px' }}
              >
                + New Study Session
              </button>
            </div>
          ) : (
            <>
              {/* Desktop: Weekly Calendar Grid */}
              <div className="hidden sm:block" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px' }}>
                {days.map((day, idx) => {
                  const daySessions = getSessionsForDay(day);
                  const isTodayDate = isToday(day);

                  return (
                    <div key={idx} style={{
                      background: 'var(--bg-surface)',
                      border: isTodayDate ? '2px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      minHeight: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <div style={{
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-default)',
                        marginBottom: '12px',
                        textAlign: 'center',
                      }}>
                        <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block' }}>
                          {dayNames[idx]}
                        </span>
                        <span className="font-display" style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: isTodayDate ? 'var(--accent-primary)' : 'var(--text-primary)',
                        }}>
                          {day.getDate()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        {daySessions.length === 0 ? (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                              —
                            </span>
                          </div>
                        ) : (
                          daySessions.map(session => (
                            <div key={session._id} className="blueprint-card" style={{
                              padding: '8px',
                              background: session.status === 'completed' ? 'rgba(52,211,153,0.08)' : 'rgba(0,240,255,0.05)',
                              border: session.status === 'completed' ? '1px solid var(--success)' : '1px solid var(--border-default)',
                              cursor: 'pointer',
                            }}>
                              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {session.title}
                              </div>
                              <div className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                {formatTime(session.scheduledDate)} · {session.duration}m
                              </div>
                              <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                {session.course?.title}
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {session.status === 'completed' ? (
                                  <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--success)', fontWeight: 700 }}>
                                    ✓ Done
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleCompleteSession(session._id)}
                                      style={{
                                        padding: '6px 12px',
                                        fontSize: '0.6875rem',
                                        background: 'var(--success)',
                                        color: 'var(--bg-canvas)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        minHeight: '36px',
                                      }}
                                    >
                                      Complete
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSession(session._id)}
                                      style={{
                                        padding: '6px 12px',
                                        fontSize: '0.6875rem',
                                        background: 'var(--danger)',
                                        color: 'var(--text-primary)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        minHeight: '36px',
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile: Single Day View */}
              <div className="sm:hidden">
                <div className="blueprint-card" style={{ padding: '16px', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {dayNames[selectedDay.getDay() === 0 ? 6 : selectedDay.getDay() - 1]}
                    </span>
                    <span className="font-display" style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: isToday(selectedDay) ? 'var(--accent-primary)' : 'var(--text-primary)',
                    }}>
                      {selectedDay.getDate()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {getSessionsForDay(selectedDay).length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center' }}>
                        <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          No sessions scheduled
                        </span>
                      </div>
                    ) : (
                      getSessionsForDay(selectedDay).map(session => (
                        <div key={session._id} className="blueprint-card" style={{
                          padding: '12px',
                          background: session.status === 'completed' ? 'rgba(52,211,153,0.08)' : 'rgba(0,240,255,0.05)',
                          border: session.status === 'completed' ? '1px solid var(--success)' : '1px solid var(--border-default)',
                        }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            {session.title}
                          </div>
                          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            {formatTime(session.scheduledDate)} · {session.duration}m
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            {session.course?.title}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {session.status === 'completed' ? (
                              <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--success)', fontWeight: 700 }}>
                                ✓ Done
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleCompleteSession(session._id)}
                                  style={{
                                    padding: '8px 16px',
                                    fontSize: '0.8125rem',
                                    background: 'var(--success)',
                                    color: 'var(--bg-canvas)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    minHeight: '44px',
                                  }}
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleDeleteSession(session._id)}
                                  style={{
                                    padding: '8px 16px',
                                    fontSize: '0.8125rem',
                                    background: 'var(--danger)',
                                    color: 'var(--text-primary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    minHeight: '44px',
                                  }}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="blueprint-card" style={{
            background: 'var(--bg-surface)',
            maxWidth: '500px', width: '90%',
            padding: '32px',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 className="font-display" style={{ fontSize: '1.25rem', margin: '0 0 24px 0' }}>
              New Study Session
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Course
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Study Chapter 3"
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Notes (optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this session..."
                  rows="3"
                  className="input-field"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.875sm', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}
                >
                  {submitting ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
