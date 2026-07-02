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
          (enr) => enr.course._id === courseId || enr.course === courseId
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
      <aside className="w-full md:w-72 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800/80 backdrop-blur-xl flex flex-col p-6 shrink-0 sidebar-spine"
             style={{ background: 'var(--bg-surface)' }}>
        <div className="space-y-6 flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Back link */}
          <Link
            to={course ? `/courses/${course._id}` : '/dashboard'}
            className="font-mono"
            style={{
              fontSize: '0.6875rem', color: 'var(--text-muted)',
              textDecoration: 'none', fontWeight: 700
            }}
          >
            &lt; {getLabel('RETURN_TO_SPEC')}
          </Link>

          {course && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 className="font-display" style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                {course.title}
              </h2>
              <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                {getLabel('INSTRUCTOR_REF')}: {course.instructor?.name || 'System'}
              </span>
            </div>
          )}

          {/* Progress Section */}
          {enrollment && (
            <div className="blueprint-card" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {course.modules.map((mod, mIdx) => (
                <div key={mod._id || mIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span className="font-mono" style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    {mod.title?.toUpperCase()}
                  </span>
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
                            fontSize: '0.75rem', fontWeight: 600,
                            fontFamily: 'var(--font-display)',
                            background: isActive ? 'rgba(0,240,255,0.06)' : 'transparent',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            border: isActive ? '1px solid rgba(0,240,255,0.15)' : '1px solid transparent',
                            textDecoration: 'none', transition: 'all var(--transition-fast)'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                            {les.title}
                          </span>
                          {isCompleted ? (
                            <span className="font-mono" style={{ color: 'var(--success)', fontWeight: 700 }}>[✓]</span>
                          ) : (
                            <span className="font-mono" style={{ color: 'var(--text-muted)' }}>[ ]</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
              <span className="font-mono" style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                {getLabel('EVALUATION_BATTERIES')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz._id}
                    to={`/quizzes/${quiz._id}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                      padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem', fontWeight: 650,
                      background: 'rgba(255,160,58,0.02)',
                      color: 'var(--accent-secondary)',
                      border: '1px solid rgba(255,160,58,0.1)',
                      textDecoration: 'none'
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

        {/* User Card */}
        <div style={{
          padding: '12px', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px',
          marginTop: '24px'
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
                    <h4 className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 8px' }}>// TRANSCRIPT</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>
                      {lesson.transcript}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="blueprint-card" style={{
                width: '100%', aspectRatio: '16/9', display: 'flex',
                alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)'
              }}>
                <p className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                  No video content available
                </p>
              </div>
            )}

            {/* Title and Complete Button bar */}
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <span className="font-mono text-muted" style={{ fontSize: '0.625rem', display: 'block' }}>
                  {getLabel('ORDER_INDEX')}: {lesson.order}
                </span>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '2px 0 0 0' }}>
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
                    style={{ padding: '8px 20px', fontSize: '0.8125rem' }}
                  >
                    {completeLoading ? getLabel('COMPLETING') : getLabel('MARK_AS_COMPLETE')}
                  </button>
                )}
              </div>
            </div>

            {/* Lesson Content Text */}
            <section className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-default)', paddingBottom: '8px', margin: 0 }}>
                // {getLabel('LESSON_NOTES')}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
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
