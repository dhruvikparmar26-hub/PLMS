import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const InstructorDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageProgress: 0,
    quizPassRate: 0,
    totalQuizAttempts: 0,
  });
  const [courseBreakdown, setCourseBreakdown] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New course form state
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    thumbnail: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Authorization check
  useEffect(() => {
    if (user && user.role !== 'instructor' && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/instructor/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setCourseBreakdown(res.data.courseBreakdown);
        setRecentActivities(res.data.recentActivities);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch instructor dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'instructor' || user.role === 'admin')) {
      fetchDashboardData();
    }
  }, [user]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      const res = await api.post('/instructor/courses', newCourse);
      if (res.data.success) {
        setShowCreateModal(false);
        setNewCourse({
          title: '',
          description: '',
          category: '',
          difficulty: 'beginner',
          thumbnail: '',
        });
        navigate(`/instructor/courses/${res.data.course._id}/edit`);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create course. Please verify fields.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this course? This will remove all lessons, quizzes, attempts, and student progress.')) {
      return;
    }
    try {
      const res = await api.delete(`/instructor/courses/${courseId}`);
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete course.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <div style={{
          width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>INITIALIZING_INSTRUCTOR_PORTAL...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-canvas)' }}>
      {/* ============ Sidebar with notebook spine ============ */}
      <aside className="w-60 hidden md:flex flex-col justify-between sidebar-spine"
             style={{ background: 'var(--bg-surface)', padding: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Logo */}
          <div>
            <span className="font-display" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              PLMS
            </span>
            <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.1em' }}>
              INSTRUCTOR LAB PORTAL
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              style={{
                width: '100%', fontSize: '0.75rem', padding: '8px 12px',
                textAlign: 'left', display: 'block'
              }}
            >
              &lt; Student Dashboard
            </button>
            <button
              className="btn-primary"
              style={{
                width: '100%', fontSize: '0.75rem', padding: '8px 12px',
                textAlign: 'left', display: 'block', pointerEvents: 'none'
              }}
            >
              Instructor Analytics
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div style={{
          padding: '12px', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--bg-canvas)', fontWeight: 700, fontSize: '0.8125rem',
            fontFamily: 'var(--font-display)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user?.role}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '56px', borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
        }}>
          <span className="tech-header">INSTRUCTOR / ANALYTICS_BOARD</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.75rem' }}
            >
              + Create Course
            </button>
            <button onClick={handleLogout} className="btn-secondary"
                    style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              Sign out
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {error && (
              <div style={{
                padding: '12px 16px', background: 'rgba(255,77,106,0.08)',
                border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--radius-md)',
                color: 'var(--danger)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
              }}>
                {error}
              </div>
            )}

            {/* Title Section */}
            <div className="notebook-margin">
              <h1>Instructor Hub</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Performance metrics log and course configuration management portal.
              </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {[
                { label: 'COURSES_ACTIVE', value: stats.totalCourses, color: 'var(--accent-primary)' },
                { label: 'STUDENTS_ENROLLED', value: stats.totalStudents, color: 'var(--text-primary)' },
                { label: 'AVG_PROGRESS_PCT', value: `${stats.averageProgress}%`, color: 'var(--success)' },
                { label: 'QUIZ_PASS_RATE', value: `${stats.quizPassRate}%`, color: 'var(--accent-secondary)' },
              ].map((stat) => (
                <div key={stat.label} className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: stat.color, margin: '4px 0 0 0' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Course Breakdown Table */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                // COURSE_REGISTRY_METRICS
              </h2>

              {courseBreakdown.length === 0 ? (
                <div className="blueprint-card" style={{ padding: '40px 20px', textAlign: 'center', borderStyle: 'dashed' }}>
                  <p className="font-mono text-muted" style={{ fontSize: '0.75rem', margin: '0 0 16px 0' }}>No courses created yet — create your first course to get started</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                  >
                    PROVISION FIRST COURSE
                  </button>
                </div>
              ) : (
                <div className="blueprint-card" style={{ overflowX: 'auto', padding: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                        <th className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', padding: '12px 16px' }}>COURSE TITLE</th>
                        <th className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', padding: '12px 16px' }}>CATEGORY</th>
                        <th className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', padding: '12px 16px' }}>DIFFICULTY</th>
                        <th className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'center' }}>STUDENTS</th>
                        <th className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'center' }}>AVG PROG</th>
                        <th className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'center' }}>QUIZ PASS</th>
                        <th className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseBreakdown.map((course) => (
                        <tr key={course._id} style={{ borderBottom: '1px solid rgba(30,46,49,0.3)' }}>
                          <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{course.title}</td>
                          <td className="font-mono" style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{course.category?.toUpperCase()}</td>
                          <td style={{ padding: '16px' }}>
                            <span className="mono-badge" style={{
                              fontSize: '0.625rem',
                              color: course.difficulty === 'beginner' ? 'var(--success)' : course.difficulty === 'intermediate' ? 'var(--accent-secondary)' : 'var(--danger)',
                              borderColor: course.difficulty === 'beginner' ? 'rgba(52,211,153,0.2)' : course.difficulty === 'intermediate' ? 'rgba(255,160,58,0.2)' : 'rgba(255,77,106,0.2)'
                            }}>
                              {course.difficulty}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{course.studentsEnrolled}</td>
                          <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--success)', fontWeight: 700, textAlign: 'center' }}>{course.averageProgress}%</td>
                          <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--accent-primary)', textAlign: 'center' }}>
                            {course.quizAttemptsCount > 0 ? `${course.quizPassRate}%` : 'N/A'}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                                className="btn-secondary"
                                style={{ fontSize: '0.6875rem', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}
                              >
                                EDIT
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course._id)}
                                className="btn-secondary"
                                style={{ fontSize: '0.6875rem', padding: '4px 10px', color: 'var(--danger)', borderColor: 'rgba(255,77,106,0.15)', borderRadius: 'var(--radius-sm)' }}
                              >
                                DELETE
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Recent Student Activities */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                // TELEMETRY_STREAM_LOG
              </h2>

              {recentActivities.length === 0 ? (
                <div className="blueprint-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <p className="font-mono text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>[TELEMETRY_LOG_IS_EMPTY]</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentActivities.map((log) => (
                    <div
                      key={log._id}
                      className="blueprint-card"
                      style={{
                        padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', gap: '16px', fontSize: '0.75rem'
                      }}
                    >
                      <div className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{log.user?.name || 'STUDENT'}</span>
                        {' :: '}
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{log.action?.toUpperCase()}</span>
                        {' :: MODULE = "'}
                        <span style={{ color: 'var(--text-primary)' }}>{log.metadata?.courseId?.title || 'Unknown'}</span>
                        {'"'}
                        {log.action === 'quiz_attempted' && (
                          <span style={{ color: log.metadata?.extra?.passed ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                            {' (SCORE = '}{log.metadata?.score}{'%, STATUS = '}{log.metadata?.extra?.passed ? 'PASSED' : 'FAILED'}{')'}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-muted" style={{ fontSize: '0.6875rem' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Modal for Creating Course */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(11,15,16,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="blueprint-card" style={{ maxWidth: '440px', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
              <h3 className="font-display" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Create New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>COURSE TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CORE PYTHON LABORATORY"
                  className="input-field"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DESCRIPTION SPECIFICATION</label>
                <textarea
                  required
                  placeholder="Provide syllabus requirements..."
                  rows="3"
                  className="input-field"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CATEGORY</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React"
                    className="input-field"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DIFFICULTY</label>
                  <select
                    className="input-field"
                    value={newCourse.difficulty}
                    onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>THUMBNAIL IMAGE URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  className="input-field"
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.875rem' }}
              >
                {createLoading ? 'PROVISIONING...' : 'PROVISION_COURSE_SPEC'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboardPage;
