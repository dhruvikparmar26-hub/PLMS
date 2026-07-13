import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import CourseRating from '../components/CourseRating';
import { getLabel } from '../utils/labelMap';
import DashboardLayout from '../components/layout/DashboardLayout';

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
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      try {
        setLoading(true);
        setError('');
        
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data.course);

        const enrollmentsRes = await api.get('/enrollments/me');
        const match = enrollmentsRes.data.enrollments?.find(
          (enr) => enr.course?._id === id || enr.course === id
        );
        setEnrollment(match || null);

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
      window.dispatchEvent(new Event('refreshNotifications'));

      const quizzesRes = await api.get(`/quizzes/course/${id}`);
      setQuizzes(quizzesRes.data.quizzes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
      console.error(err);
    } finally {
      setEnrollLoading(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner':
        return { color: 'var(--success)', border: 'rgba(34, 197, 94, 0.2)', bg: 'rgba(34, 197, 94, 0.08)' };
      case 'intermediate':
        return { color: 'var(--accent-secondary)', border: 'rgba(59, 130, 246, 0.2)', bg: 'rgba(59, 130, 246, 0.08)' };
      case 'advanced':
        return { color: 'var(--danger)', border: 'rgba(239, 68, 68, 0.2)', bg: 'rgba(239, 68, 68, 0.08)' };
      default:
        return { color: 'var(--text-muted)', border: 'var(--border-default)', bg: 'transparent' };
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
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

  const toggleModule = (idx) => {
    setExpandedModules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isLessonCompleted = (lessonId) => {
    if (!enrollment || !enrollment.completedLessons) return false;
    return enrollment.completedLessons.includes(lessonId);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
          <div style={{
            width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{getLabel('RETRIEVING_MODULE_MANIFEST')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
          <p className="font-mono" style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>ERROR: {getLabel('COURSE_NOT_FOUND')}</p>
          <Link to="/courses" className="btn-secondary" style={{ textDecoration: 'none' }}>
            &lt; Return to Catalog
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const diff = getDifficultyColor(course.difficulty);
  const syllabus = course.syllabus || [];

  return (
    <DashboardLayout>
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '960px', margin: '0 auto' }}>

        {/* Back button */}
        <Link to="/courses" className="font-mono" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          ← Back to Courses
        </Link>
        
        {error && (
          <div style={{
            padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-md)',
            color: 'var(--danger)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
          }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '12px 16px', background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: 'var(--radius-md)',
            color: 'var(--success)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
          }}>
            ✅ {successMsg}
          </div>
        )}

        {/* ═══════════ HERO BANNER ═══════════ */}
        <div style={{
          position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          border: '1px solid var(--border-default)',
        }}>
          {/* 4K Background Image */}
          <div style={{
            width: '100%', height: '280px',
            background: course.thumbnail
              ? `url(${course.thumbnail}) center/cover no-repeat`
              : 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
          }} />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, var(--bg-canvas) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 100%)',
          }} />
          {/* Content overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '28px 32px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="font-mono" style={{
                fontSize: '0.625rem', fontWeight: 700, padding: '3px 10px',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)',
                letterSpacing: '0.05em',
              }}>
                {course.category?.toUpperCase()}
              </span>
              <span className="font-mono" style={{
                fontSize: '0.625rem', fontWeight: 700, padding: '3px 10px',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                borderRadius: 'var(--radius-sm)', color: diff.color,
              }}>
                {course.difficulty?.toUpperCase()}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, lineHeight: 1.2, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              {course.title}
            </h1>
            <p className="font-mono" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              By {course.instructor?.name || 'System'} · {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lessons
            </p>
          </div>
        </div>

        {/* ═══════════ ENROLL / PROGRESS BAR ═══════════ */}
        <div className="blueprint-card" style={{
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifycontent: 'space-between', gap: '20px',
          flexWrap: 'wrap',
        }}>
          {enrollment ? (
            <>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{getLabel('MODULE_PROGRESS')}</span>
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
                  style={{ textDecoration: 'none', textAlign: 'center', padding: '10px 24px', fontSize: '0.8125rem', fontWeight: 700, display: 'inline-block' }}
                >
                  {enrollment.progressPercent === 0 ? '▶ Start Learning' : '▶ Resume Learning'}
                </Link>
              ) : (
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No lessons loaded</span>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Ready to start learning?</span>
                <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Enroll now to access all course content and quizzes.</span>
              </div>
              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                className="btn-primary"
                style={{
                  fontSize: '0.9375rem', padding: '12px 32px', fontWeight: 700,
                  boxShadow: 'var(--shadow-card)',
                  whiteSpace: 'nowrap',
                }}
              >
                {enrollLoading ? '⏳ Enrolling...' : '🚀 Enroll Now — Free'}
              </button>
            </>
          )}
        </div>

        {/* ═══════════ BRIEF INTRODUCTION ═══════════ */}
        {course.briefIntro && (
          <section className="blueprint-card" style={{
            padding: '24px',
            borderLeft: '4px solid var(--accent-primary)',
          }}>
            <h2 className="font-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '10px', margin: 0 }}>
              About This Course
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7, margin: '10px 0 0 0' }}>
              {course.briefIntro}
            </p>
          </section>
        )}

        {/* ═══════════ DESCRIPTION ═══════════ */}
        <section className="notebook-margin" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {getLabel('DESCRIPTION_SPEC')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
            {course.description}
          </p>
        </section>

        {/* ═══════════ COURSE SYLLABUS (Basic → Advanced) ═══════════ */}
        {syllabus.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Course Syllabus — Basic to Advanced
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {syllabus.map((mod, idx) => {
                const modDiff = getDifficultyColor(mod.level);
                const isOpen = expandedModules[idx] !== false; // default open
                return (
                  <div key={idx} className="blueprint-card" style={{ overflow: 'hidden' }}>
                    <button
                      onClick={() => toggleModule(idx)}
                      style={{
                        width: '100%', background: 'var(--bg-elevated)', padding: '14px 20px',
                        borderBottom: isOpen ? '1px solid var(--border-default)' : 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.875rem' }}>{getLevelIcon(mod.level)}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                          Module {idx + 1}: {mod.moduleTitle}
                        </span>
                        <span className="font-mono" style={{
                          fontSize: '0.5625rem', fontWeight: 700, padding: '2px 8px',
                          border: `1px solid ${modDiff.border}`, borderRadius: 'var(--radius-sm)',
                          color: modDiff.color, textTransform: 'uppercase',
                        }}>
                          {mod.level}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </span>
                    </button>
                    {isOpen && mod.topics && (
                      <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {mod.topics.map((topic, tIdx) => (
                          <span key={tIdx} style={{
                            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                            background: modDiff.bg, border: `1px solid ${modDiff.border}`,
                            fontSize: '0.75rem', color: modDiff.color, fontWeight: 500,
                            fontFamily: 'var(--font-mono)',
                          }}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════ LEARNING FLOWCHART ═══════════ */}
        {syllabus.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Learning Path Flowchart
            </h2>
            <div className="blueprint-card" style={{ padding: '28px 24px', overflow: 'auto' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0',
                overflowX: 'auto', paddingBottom: '8px',
              }}>
                {syllabus.map((mod, idx) => {
                  const modDiff = getDifficultyColor(mod.level);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {/* Flowchart box */}
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        padding: '14px 18px', minWidth: '130px',
                        background: modDiff.bg,
                        border: `2px solid ${modDiff.border}`,
                        borderRadius: 'var(--radius-md)',
                        position: 'relative',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = `0 4px 20px ${modDiff.border}`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{getLevelIcon(mod.level)}</span>
                        <span className="font-mono" style={{ fontSize: '0.5625rem', color: modDiff.color, fontWeight: 700, textTransform: 'uppercase' }}>
                          {mod.level}
                        </span>
                        <span style={{
                          fontSize: '0.6875rem', fontWeight: 700, textAlign: 'center',
                          color: 'var(--text-primary)', lineHeight: 1.3,
                        }}>
                          {mod.moduleTitle}
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                          {mod.topics?.length || 0} topics
                        </span>
                      </div>
                      {/* Arrow connector */}
                      {idx < syllabus.length - 1 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', padding: '0 4px',
                          color: 'var(--text-muted)', fontSize: '1.25rem', flexShrink: 0,
                        }}>
                          →
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ COURSE RATINGS ═══════════ */}
        <section className="blueprint-card" style={{ padding: '20px' }}>
          <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            {getLabel('STUDENT_RATINGS')}
          </h2>
          <CourseRating 
            courseId={course._id} 
            showForm={true} 
            enrollmentProgress={enrollment?.progressPercent || 0} 
          />
        </section>

        {/* ═══════════ PACE FORECAST ═══════════ */}
        {enrollment && paceForecast && (
          <section className="blueprint-card" style={{ padding: '20px' }}>
            <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              {getLabel('PACE_FORECAST')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div className="blueprint-card" style={{ padding: '16px', textAlign: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block' }}>Est. Completion</span>
                <span className="font-mono" style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {paceForecast.estimatedCompletionDate 
                    ? new Date(paceForecast.estimatedCompletionDate).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
              <div className="blueprint-card" style={{ padding: '16px', textAlign: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block' }}>Days Remaining</span>
                <span className="font-mono" style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {paceForecast.estimatedDaysRemaining}
                </span>
              </div>
              <div className="blueprint-card" style={{ padding: '16px', textAlign: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block' }}>Your Pace</span>
                <span className="font-mono" style={{ 
                  fontSize: '1rem', fontWeight: 700,
                  color: paceForecast.pace === 'fast' ? 'var(--success)' : 
                         paceForecast.pace === 'moderate' ? 'var(--accent-secondary)' : 
                         paceForecast.pace === 'slow' ? 'var(--danger)' : 'var(--text-muted)'
                }}>
                  {paceForecast.pace?.toUpperCase()}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ LESSONS (Syllabus/Modules from DB) ═══════════ */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {getLabel('COURSE_SYLLABUS_INDEX')} — Lessons
          </h2>

          {course.modules && course.modules.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {course.modules.map((mod, modIdx) => (
                <div key={mod._id || modIdx} className="blueprint-card" style={{ overflow: 'hidden' }}>
                  <div style={{
                    background: 'var(--bg-canvas)', padding: '12px 20px',
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
                            borderBottom: index < mod.lessons.length - 1 ? '1px solid var(--border-default)' : 'none',
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

        {/* ═══════════ QUIZZES ═══════════ */}
        {enrollment && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="font-mono" style={{ fontSize: '0.8125rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {getLabel('COURSE_EVALUATION_BATTERY')}
            </h2>
            {quizzes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="blueprint-card"
                    style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifycontent: 'space-between', gap: '16px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h4 className="font-display" style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
                        {quiz.title}
                      </h4>
                      <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                        {getLabel('MIN_PASS')}: <span style={{ color: 'var(--accent-secondary)' }}>{quiz.passingScore}%</span> | {quiz.questionCount} {getLabel('EVAL_POINTS')}
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
                      {getLabel('RUN_EVALUATION')}
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

        {/* ═══════════ BOTTOM ENROLL CTA ═══════════ */}
        {!enrollment && (
          <div className="blueprint-card" style={{
            padding: '28px', textAlign: 'center',
            background: 'rgba(14, 165, 164, 0.04)',
            border: '1px solid rgba(14, 165, 164, 0.15)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              Ready to start <span style={{ color: 'var(--accent-primary)' }}>{course.title}</span>?
            </h3>
            <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, maxWidth: '500px' }}>
              Get full access to all {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lessons, quizzes, and track your progress.
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrollLoading}
              className="btn-primary"
              style={{
                fontSize: '1rem', padding: '14px 40px', fontWeight: 700,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {enrollLoading ? '⏳ Enrolling...' : '🚀 Enroll Now — Free'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseDetailPage;
