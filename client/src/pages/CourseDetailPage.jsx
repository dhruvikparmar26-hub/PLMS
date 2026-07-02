import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import CourseRating from '../components/CourseRating';
import { getLabel } from '../utils/labelMap';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [paceForecast, setPaceForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 1. Fetch course details
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data.course);

        // 2. Fetch user's enrollments to check if enrolled
        const enrollmentsRes = await api.get('/enrollments/me');
        const match = enrollmentsRes.data.enrollments?.find(
          (enr) => enr.course._id === id || enr.course === id
        );
        setEnrollment(match || null);

        // 3. If enrolled, fetch quizzes and pace forecast for this course
        if (match) {
          const [quizzesRes, paceRes] = await Promise.all([
            api.get(`/quizzes/course/${id}`),
            api.get(`/pace-forecast/${id}`),
          ]);
          setQuizzes(quizzesRes.data.quizzes || []);
          setPaceForecast(paceRes.data.forecast);
        }
      } catch (err) {
        setError('Failed to load course details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndStatus();
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrollLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await api.post(`/courses/${id}/enroll`);
      setSuccessMsg(res.data.message || 'Successfully enrolled!');
      setEnrollment(res.data.enrollment);

      // Fetch quizzes for this course since we are now enrolled
      const quizzesRes = await api.get(`/quizzes/course/${id}`);
      setQuizzes(quizzesRes.data.quizzes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
      console.error(err);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner':
        return { color: 'var(--success)', border: 'rgba(52, 213, 153, 0.2)' };
      case 'intermediate':
        return { color: 'var(--accent-secondary)', border: 'rgba(255, 160, 58, 0.2)' };
      case 'advanced':
        return { color: 'var(--danger)', border: 'rgba(255, 77, 106, 0.2)' };
      default:
        return { color: 'var(--text-muted)', border: 'var(--border-default)' };
    }
  };

  const getFirstLessonId = () => {
    if (!course || !course.modules) return null;
    for (const mod of course.modules) {
      if (mod.lessons && mod.lessons.length > 0) {
        return mod.lessons[0]._id;
      }
    }
    return null;
  };

  const getFirstIncompleteLessonId = () => {
    if (!course || !course.modules || !enrollment) return getFirstLessonId();
    const completedIds = enrollment.completedLessons || [];
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        if (!completedIds.includes(les._id)) {
          return les._id;
        }
      }
    }
    return getFirstLessonId();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-3">
        <div style={{
          width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>RETRIEVING_MODULE_MANIFEST...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4">
        <p className="font-mono text-sm" style={{ color: 'var(--danger)' }}>ERROR: COURSE_NOT_FOUND</p>
        <Link to="/courses" className="btn-secondary" style={{ textDecoration: 'none' }}>
          &lt; Return to Catalog
        </Link>
      </div>
    );
  }

  const isLessonCompleted = (lessonId) => {
    if (!enrollment || !enrollment.completedLessons) return false;
    return enrollment.completedLessons.includes(lessonId);
  };

  const diff = getDifficultyColor(course.difficulty);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-canvas)' }}>
      {/* ============ Sidebar with notebook spine ============ */}
      <aside className="w-60 hidden md:flex flex-col justify-between sidebar-spine"
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

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: 'Overview', path: '/dashboard' },
              { label: 'Schedule', path: '/analytics' },
              { label: 'Library', path: '/courses', active: true },
              { label: 'Certificates', path: '/learning-log' },
              { label: 'Support', path: '/onboarding' },
            ].map((item) => (
              <Link key={item.path} to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem', fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  background: item.active ? 'rgba(242, 176, 86, 0.06)' : 'transparent',
                  color: item.active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: item.active ? '1px solid rgba(242, 176, 86, 0.15)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}>
                {item.label}
              </Link>
            ))}
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <Link to="/instructor"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem', fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-secondary)',
                  border: '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}>
                Instructor Hub
              </Link>
            )}
          </nav>

          {/* New Study Session CTA */}
          <button
            onClick={() => navigate('/courses')}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.8125rem',
              padding: '10px 16px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(242, 176, 86, 0.15)'
            }}
          >
            + New Study Session
          </button>
        </div>

        {/* User card */}
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

      {/* ============ Main Content ============ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: '56px', borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
        }}>
          <span className="tech-header">CATALOG / COURSE_SPECIFICATION</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="font-mono md:hidden" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>PLMS</span>
            <button onClick={handleLogout} className="btn-secondary"
                    style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              Sign out
            </button>
          </div>
        </header>

        {/* Content Details */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
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

            {successMsg && (
              <div style={{
                padding: '12px 16px', background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.25)', borderRadius: 'var(--radius-md)',
                color: 'var(--success)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
              }}>
                {successMsg}
              </div>
            )}

            {/* Banner block — technical spec layout */}
            <div className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', mdDirection: 'row', gap: '24px', position: 'relative' }}>
              {course.thumbnail && (
                <div style={{
                  width: '100%', maxWidth: '240px', aspectRatio: '16/9',
                  background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0
                }}>
                  <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono-badge" style={{ color: 'var(--accent-primary)', borderColor: 'rgba(0,240,255,0.2)' }}>
                    {course.category}
                  </span>
                  <span className="mono-badge" style={{ color: diff.color, borderColor: diff.border }}>
                    {course.difficulty}
                  </span>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                  {course.title}
                </h1>

                <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  INSTRUCTOR: <span style={{ color: 'var(--text-primary)' }}>{course.instructor?.name || 'SYSTEM_GEN'}</span> ({course.instructor?.email})
                </p>

                {/* Enrollment Actions / Tech metrics */}
                <div style={{ marginTop: '12px' }}>
                  {enrollment ? (
                    <div className="blueprint-card animate-pulse-glow" style={{ padding: '16px', background: 'rgba(0,240,255,0.02)', display: 'flex', flexDirection: 'column', smDirection: 'row', gap: '16px', alignItems: 'stretch', smItems: 'center', border: '1px solid rgba(0,240,255,0.15)' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>MODULE_PROGRESS</span>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{enrollment.progressPercent}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${enrollment.progressPercent}%` }} />
                        </div>
                      </div>

                      {getFirstLessonId() ? (
                        <Link
                          to={`/lessons/${getFirstIncompleteLessonId()}`}
                          className="btn-primary"
                          style={{ textDecoration: 'none', textAlign: 'center', padding: '8px 16px', fontSize: '0.75rem', display: 'inline-block' }}
                        >
                          {enrollment.progressPercent === 0 ? 'Start Learning' : 'Resume Learning'}
                        </Link>
                      ) : (
                        <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>No lessons loaded</span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrollLoading}
                      className="btn-primary"
                      style={{ fontSize: '0.8125rem', padding: '10px 20px' }}
                    >
                      {enrollLoading ? 'PROVISIONING_ENROLLMENT...' : 'INITIALIZE_ENROLLMENT'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="notebook-margin" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                // {getLabel('DESCRIPTION_SPEC')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {course.description}
              </p>
            </section>

            {/* Course Ratings */}
            <section className="blueprint-card" style={{ padding: '20px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                // STUDENT_RATINGS
              </h2>
              <CourseRating 
                courseId={course._id} 
                showForm={true} 
                enrollmentProgress={enrollment?.progressPercent || 0} 
              />
            </section>

            {/* Pace Forecast */}
            {enrollment && paceForecast && (
              <section className="blueprint-card" style={{ padding: '20px' }}>
                <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                  // PACE_FORECAST
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Estimated completion</span>
                    <span className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      {paceForecast.estimatedCompletionDate 
                        ? new Date(paceForecast.estimatedCompletionDate).toLocaleDateString() 
                        : 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Days remaining</span>
                    <span className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {paceForecast.estimatedDaysRemaining}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your pace</span>
                    <span className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                      {paceForecast.averageLessonsPerDay} lessons/day
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pace category</span>
                    <span className="font-mono" style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      color: paceForecast.pace === 'fast' ? 'var(--success)' : 
                             paceForecast.pace === 'moderate' ? 'var(--accent-secondary)' : 
                             paceForecast.pace === 'slow' ? 'var(--danger)' : 'var(--text-muted)'
                    }}>
                      {paceForecast.pace.toUpperCase()}
                    </span>
                  </div>
                  {paceForecast.confidence && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Forecast confidence</span>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {paceForecast.confidence.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Syllabus/Modules structure */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                // COURSE_SYLLABUS_INDEX
              </h2>

              {course.modules && course.modules.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {course.modules.map((mod, modIdx) => (
                    <div key={mod._id || modIdx} className="blueprint-card" style={{ overflow: 'hidden' }}>
                      <div style={{
                        background: 'rgba(0,0,0,0.15)', padding: '12px 20px',
                        borderBottom: '1px solid var(--border-default)', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <h3 className="font-display" style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                          {mod.title || `Module ${modIdx + 1}`}
                        </h3>
                        <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {mod.lessons?.length || 0} LESSONS
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {mod.lessons && mod.lessons.length > 0 ? (
                          mod.lessons.map((lesson, index) => (
                            <div
                              key={lesson._id}
                              style={{
                                padding: '12px 20px', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', gap: '16px',
                                borderBottom: index < mod.lessons.length - 1 ? '1px solid rgba(30,46,49,0.4)' : 'none',
                                background: 'transparent'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '20px', textAlign: 'right' }}>
                                  {lesson.order || (index + 1)}.
                                </span>
                                {enrollment ? (
                                  <Link
                                    to={`/lessons/${lesson._id}`}
                                    style={{
                                      fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)',
                                      textDecoration: 'none', transition: 'color var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                                    onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                                  >
                                    {lesson.title}
                                  </Link>
                                ) : (
                                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {lesson.title}
                                  </span>
                                )}
                              </div>

                              <div>
                                {isLessonCompleted(lesson._id) && (
                                  <span className="completion-stamp" style={{ fontSize: '0.5625rem', padding: '2px 8px' }}>
                                    COMPLETED
                                  </span>
                                )}
                                {!enrollment && (
                                  <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                                    [LOCKED]
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="font-mono" style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            No lessons available
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="blueprint-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    No syllabus information available
                  </p>
                </div>
              )}
            </section>

            {/* Quizzes list */}
            {enrollment && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  // COURSE_EVALUATION_BATTERY
                </h2>
                {quizzes.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="blueprint-card"
                        style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <h4 className="font-display" style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                            {quiz.title}
                          </h4>
                          <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                            MIN_PASS: <span style={{ color: 'var(--accent-secondary)' }}>{quiz.passingScore}%</span> | {quiz.questionCount} EVAL_POINTS
                          </span>
                        </div>
                        <Link
                          to={`/quizzes/${quiz._id}`}
                          className="btn-secondary"
                          style={{
                            textAlign: 'center', textDecoration: 'none', fontSize: '0.75rem',
                            padding: '6px 12px', display: 'block'
                          }}
                        >
                          RUN_EVALUATION
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="blueprint-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      No quizzes available for this course
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseDetailPage;
