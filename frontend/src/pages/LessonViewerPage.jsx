import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import NoteEditor from '../components/NoteEditor';
import LessonQASection from '../components/LessonQASection';
import { getLabel } from '../utils/labelMap';

const LessonViewerPage = () => {
  const { id } = useParams(); // lesson ID
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const videoRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMsg('');

        // 1. Fetch lesson details
        const lessonRes = await api.get(`/lessons/${id}`);
        const currentLesson = lessonRes.data.lesson;
        setLesson(currentLesson);

        const courseId = currentLesson.course?._id || currentLesson.course;

        // 2. Fetch full course details (with syllabus)
        const courseRes = await api.get(`/courses/${courseId}`);
        setCourse(courseRes.data.course);

        // 3. Fetch user's enrollment for this course
        const enrollmentsRes = await api.get('/enrollments/me');
        const match = enrollmentsRes.data.enrollments?.find(
          (enr) => enr.course?._id === courseId || enr.course === courseId
        );
        
        if (!match) {
          setError('You are not enrolled in this course.');
        } else {
          setEnrollment(match);
          
          // 4. Fetch course quizzes
          const quizzesRes = await api.get(`/quizzes/course/${courseId}`);
          setQuizzes(quizzesRes.data.quizzes || []);

          // 5. Check bookmark status
          try {
            const bmRes = await api.get(`/bookmarks/check/${currentLesson._id}`);
            setBookmarked(bmRes.data.bookmarked);
          } catch (_) { /* ignore */ }
        }
      } catch (err) {
        setError('Failed to load lesson. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [id]);

  const handleMarkComplete = async () => {
    try {
      setCompleteLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await api.post(`/lessons/${id}/complete`);
      setSuccessMsg(res.data.courseCompleted ? '🎓 Course completed! Certificate issued.' : (res.data.message || 'Lesson completed!'));
      window.dispatchEvent(new Event('refreshNotifications'));
      
      // Update enrollment local state
      if (enrollment) {
        setEnrollment({
          ...enrollment,
          completedLessons: res.data.completedLessons,
          progressPercent: res.data.progressPercent,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete lesson.');
      console.error(err);
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleToggleBookmark = async () => {
    if (!lesson || !course) return;
    try {
      setBookmarkLoading(true);
      const res = await api.post('/bookmarks/toggle', {
        lessonId: lesson._id,
        courseId: course._id,
      });
      setBookmarked(res.data.bookmarked);
      window.dispatchEvent(new Event('refreshNotifications'));
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const isLessonCompleted = (lessonId) => {
    if (!enrollment || !enrollment.completedLessons) return false;
    return enrollment.completedLessons.includes(lessonId);
  };

  const getNextLesson = () => {
    if (!course || !course.modules || !lesson) return null;
    let allLessons = [];
    course.modules.forEach((mod) => {
      if (mod.lessons) {
        allLessons = [...allLessons, ...mod.lessons];
      }
    });

    const currentIndex = allLessons.findIndex((l) => l._id === lesson._id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-3">
        <div style={{
          width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{getLabel('STREAMING_CONTENT_BUFFER')}</p>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4 p-4 text-center">
        <p className="font-mono text-sm" style={{ color: 'var(--danger)' }}>ERROR: {error.toUpperCase()}</p>
        <Link to="/courses" className="btn-secondary" style={{ textDecoration: 'none' }}>
          &lt; Return to Course Catalog
        </Link>
      </div>
    );
  }

  const nextLesson = getNextLesson();

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'var(--bg-canvas)' }}>
      {/* Course Sidebar Navigation */}
      <aside style={{
        width: '280px',
        minWidth: '280px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Scrollable content area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}>
          {/* Back link */}
          <Link
            to={course ? `/courses/${course._id}` : '/dashboard'}
            className="font-mono"
            style={{
              fontSize: '0.75rem', color: 'var(--text-muted)',
              textDecoration: 'none', fontWeight: 700,
              padding: '4px 0',
              marginBottom: '16px',
              transition: 'color 0.2s',
            }}
          >
            &lt; {getLabel('RETURN_TO_SPEC')}
          </Link>

          {/* Course Title & Instructor */}
          {course && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '4px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-default)',
              marginBottom: '16px',
            }}>
              <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                {course.title}
              </h2>
              <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                {getLabel('INSTRUCTOR_REF')}: {course.instructor?.name || 'System'}
              </span>
            </div>
          )}

          {/* Progress Section */}
          {enrollment && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{getLabel('MODULE_PROGRESS')}</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{enrollment.progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${enrollment.progressPercent}%` }} />
              </div>
            </div>
          )}

          {/* Syllabus modules */}
          {course && course.modules && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {course.modules.map((mod, mIdx) => (
                <div key={mod._id || mIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Module label */}
                  <span className="font-mono" style={{
                    fontSize: '0.625rem', fontWeight: 700,
                    color: 'var(--text-muted)', letterSpacing: '0.08em',
                    padding: '0 4px 6px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    marginBottom: '2px',
                  }}>
                    {mod.title?.toUpperCase()}
                  </span>
                  {/* Lesson links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {mod.lessons?.map((les) => {
                      const isActive = les._id === lesson._id;
                      const isCompleted = isLessonCompleted(les._id);
                      return (
                        <Link
                          key={les._id}
                          to={`/lessons/${les._id}`}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                            padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8125rem', fontWeight: isActive ? 600 : 500,
                            fontFamily: 'var(--font-display)',
                            background: isActive ? 'rgba(0,240,255,0.06)' : 'transparent',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            border: isActive ? '1px solid rgba(0,240,255,0.15)' : '1px solid transparent',
                            textDecoration: 'none', transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ flex: 1, lineHeight: '1.4' }}>
                            {les.title}
                          </span>
                          {isCompleted ? (
                            <span className="font-mono" style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>[✓]</span>
                          ) : (
                            <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>[ ]</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quizzes section in Sidebar */}
          {quizzes.length > 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px',
              paddingTop: '20px', marginTop: '20px',
              borderTop: '1px solid var(--border-default)',
            }}>
              <span className="font-mono" style={{
                fontSize: '0.625rem', fontWeight: 700,
                color: 'var(--accent-secondary)',
                letterSpacing: '0.08em',
                padding: '0 4px',
              }}>
                {getLabel('EVALUATION_BATTERIES')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz._id}
                    to={`/quizzes/${quiz._id}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                      padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem', fontWeight: 600,
                      background: 'rgba(255,160,58,0.03)',
                      color: 'var(--accent-secondary)',
                      border: '1px solid rgba(255,160,58,0.1)',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.title}</span>
                    <span>✏️</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Card - pinned at bottom */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-default)',
          flexShrink: 0,
        }}>
          <div style={{
            padding: '10px 12px',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--bg-canvas)', fontWeight: 700, fontSize: '0.8125rem',
              fontFamily: 'var(--font-display)', flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user?.name}</p>
              <p className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Video & Content Viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '56px', borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
        }}>
          <span className="tech-header">LESSON / {getLabel('LESSON_STREAM_VIEWER')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleToggleBookmark}
              disabled={bookmarkLoading}
              style={{
                background: bookmarked ? 'rgba(0,240,255,0.08)' : 'transparent',
                border: `1px solid ${bookmarked ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-sm)', color: bookmarked ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                padding: '5px 12px', cursor: 'pointer',
              }}
            >
              {bookmarked ? '🔖 BOOKMARKED' : '🔖 BOOKMARK'}
            </button>
            <button onClick={handleLogout} className="btn-secondary"
                    style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              Sign out
            </button>
          </div>
        </header>

        {/* Main lesson content scrollable container */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', maxWidth: '850px', width: '100%', margin: '0 auto' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
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

            {/* Video Player with speed controls */}
            {lesson.videoUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)', overflow: 'hidden', background: '#000',
                  position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                }}>
                  <video
                    ref={videoRef}
                    src={lesson.videoUrl}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                {/* Playback speed selector */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SPEED:</span>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                        padding: '2px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        background: playbackSpeed === s ? 'rgba(0,240,255,0.1)' : 'transparent',
                        border: `1px solid ${playbackSpeed === s ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        color: playbackSpeed === s ? 'var(--accent-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                  {lesson.transcript && (
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      style={{
                        marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                        padding: '2px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        background: showTranscript ? 'rgba(0,240,255,0.1)' : 'transparent',
                        border: `1px solid ${showTranscript ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        color: showTranscript ? 'var(--accent-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                    </button>
                  )}
                </div>
                {/* Transcript panel */}
                {showTranscript && lesson.transcript && (
                  <div className="blueprint-card" style={{ padding: '16px', maxHeight: '220px', overflowY: 'auto' }}>
                    <h4 className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 8px' }}>TRANSCRIPT</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>
                      {lesson.transcript}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)', overflow: 'hidden',
                position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                background: course?.thumbnail ? `url(${course.thumbnail}) center/cover no-repeat` : 'var(--bg-surface)'
              }}>
                {/* Dark overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(8,10,20,0.95) 0%, rgba(8,10,20,0.4) 60%, rgba(8,10,20,0.2) 100%)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px'
                }}>
                  <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Interactive Lesson Guide
                  </span>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '6px 0 10px', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                    {lesson.title}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lesson.content}
                  </p>
                </div>
              </div>
            )}

            {/* Title and Complete Button bar */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <span className="font-mono text-muted" style={{ fontSize: '0.6875rem', display: 'block' }}>
                  {getLabel('ORDER_INDEX')}: {lesson.order}
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                  {lesson.title}
                </h1>
              </div>

              <div>
                {isLessonCompleted(lesson._id) ? (
                  <span className="completion-stamp">
                    COMPLETED
                  </span>
                ) : (
                  <button
                    onClick={handleMarkComplete}
                    disabled={completeLoading}
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: '0.875rem', fontWeight: 700 }}
                  >
                    {completeLoading ? getLabel('COMPLETING') : getLabel('MARK_AS_COMPLETE')}
                  </button>
                )}
              </div>
            </div>

            {/* Lesson Content Text */}
            <section className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px', margin: 0 }}>
                {getLabel('LESSON_NOTES')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                {lesson.content || 'No text materials provided for this lesson.'}
              </p>
            </section>

            {/* Personal Note Editor */}
            {course && (
              <NoteEditor lessonId={lesson._id} courseId={course._id} />
            )}

            {/* Q&A Section */}
            {course && (
              <LessonQASection lessonId={lesson._id} courseId={course._id} />
            )}

            {/* Navigation Controls bottom bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
              {course && (
                <Link
                  to={`/courses/${course._id}`}
                  className="font-mono"
                  style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700 }}
                >
                  &lt; {getLabel('BACK_TO_SYLLABUS')}
                </Link>
              )}

              {nextLesson ? (
                <Link
                  to={`/lessons/${nextLesson._id}`}
                  className="btn-secondary"
                  style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '8px 16px' }}
                >
                  {getLabel('NEXT_LESSON')} &gt;
                </Link>
              ) : (
                quizzes.length > 0 && (
                  <Link
                    to={`/quizzes/${quizzes[0]._id}`}
                    className="btn-primary"
                    style={{
                      textDecoration: 'none', fontSize: '0.75rem', padding: '8px 16px',
                      background: 'var(--accent-secondary)', color: 'var(--bg-canvas)'
                    }}
                  >
                    {getLabel('RUN_FINAL_EVALUATION')}
                  </Link>
                )
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default LessonViewerPage;
