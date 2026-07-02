import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import StreakTracker from '../components/StreakTracker';
import AchievementBadge from '../components/AchievementBadge';
import NotificationCenter from '../components/NotificationCenter';
import ReviewQueue from '../components/ReviewQueue';
import ProgressReport from '../components/ProgressReport';
import LeaderboardSection from '../components/LeaderboardSection';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [achievements, setAchievements] = useState({ earned: [], locked: [] });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && (!user.learningPreferences || user.learningPreferences.length === 0)) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.learningPreferences || user.learningPreferences.length === 0) return;
      try {
        setLoadingData(true);
        setError('');
        const [enrollmentsRes, recsRes, achievementsRes] = await Promise.all([
          api.get('/enrollments/me'),
          api.get('/adaptive/learning-path'),
          api.get('/achievements/user'),
        ]);
        setEnrollments(enrollmentsRes.data.enrollments || []);
        setRecommendations(recsRes.data.courses || []);
        setAchievements(achievementsRes.data.data || { earned: [], locked: [] });
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getTotalLessons = (course) => {
    if (!course || !course.modules) return 0;
    return course.modules.reduce((sum, mod) => sum + (mod.lessons ? mod.lessons.length : 0), 0);
  };

  if (!user || !user.learningPreferences || user.learningPreferences.length === 0) return null;

  const completedCount = enrollments.filter((e) => e.progressPercent === 100).length;
  const inProgressCount = enrollments.length - completedCount;

  const diffBadge = (diff) => {
    const colors = {
      beginner: { color: 'var(--success)', border: 'rgba(52,211,153,0.3)' },
      intermediate: { color: 'var(--accent-secondary)', border: 'rgba(255,160,58,0.3)' },
      advanced: { color: 'var(--danger)', border: 'rgba(255,77,106,0.3)' },
    };
    const c = colors[diff] || colors.beginner;
    return { color: c.color, border: `1px solid ${c.border}` };
  };

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
              { label: 'Overview', path: '/dashboard', active: true },
              { label: 'Schedule', path: '/analytics' },
              { label: 'Library', path: '/courses' },
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
          <span className="tech-header">DASHBOARD / LEARNING_LOG</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="font-mono md:hidden" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Momentum</span>
            <ProgressReport />
            <NotificationCenter />
            <button onClick={handleLogout} className="btn-secondary"
                    style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              Sign out
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
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

            {/* ============ BENTO GRID ============ */}
            <div className="bento-grid">

              {/* ---- ROW 1: Hero (2×2) + 3 Stat cells (1×1 each) ---- */}

              {/* Hero Welcome Cell — 2×2 */}
              <div className="bento-cell bento-cell--hero bento-2x2">
                <div className="notebook-margin" style={{ marginBottom: 'var(--space-md)' }}>
                  <h1>
                    Welcome back, <span style={{ color: 'var(--accent-primary)' }}>{user?.name}</span>
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                    Level: <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 700, textTransform: 'uppercase' }}>{user?.skillLevel}</span>
                    {' · '}Interests: <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{user?.learningPreferences?.join(', ')}</span>
                  </p>
                </div>
                <StreakTracker compact />
              </div>

              {/* Enrolled Stat — 1×1 */}
              <div className="bento-cell bento-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="bento-stat-label" style={{ textTransform: 'uppercase' }}>Enrolled</span>
                <p className="bento-stat-value" style={{ color: 'var(--accent-primary)' }}>
                  {enrollments.length}
                </p>
                <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                  Active courses
                </span>
              </div>

              {/* In Progress Stat — 1×1 */}
              <div className="bento-cell bento-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="bento-stat-label" style={{ textTransform: 'uppercase' }}>In Progress</span>
                <p className="bento-stat-value" style={{ color: 'var(--accent-secondary)' }}>
                  {inProgressCount}
                </p>
                <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                  In progress
                </span>
              </div>

              {/* Mastered Stat — 1×1 */}
              <div className="bento-cell bento-1x1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="bento-stat-label" style={{ textTransform: 'uppercase' }}>Mastered</span>
                <p className="bento-stat-value" style={{ color: 'var(--success)' }}>
                  {completedCount}
                </p>
                <span className="font-mono" style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                  Completed
                </span>
              </div>

              {/* ---- ROW 2: Current Work — full-width ---- */}
              {loadingData ? (
                <div className="bento-cell bento-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                  <div style={{
                    width: '24px', height: '24px', margin: '0 auto 12px',
                    border: '3px solid var(--accent-primary)', borderTopColor: 'transparent',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                  <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Loading data...</p>
                </div>
              ) : (
                <>
                  {/* Current Work section */}
                  <div className="bento-cell bento-full" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--space-lg)' }}>
                      <div className="bento-section-header">
                        <h2>Current work</h2>
                        <span className="mono-badge">{enrollments.length} active</span>
                      </div>

                      {enrollments.length === 0 ? (
                        <div style={{
                          padding: '32px', textAlign: 'center',
                          border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-md)',
                        }}>
                          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No courses yet — here's where to start.</p>
                          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>
                            Browse the catalog or check the recommendations below.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                          {enrollments.map((enr) => {
                            const course = enr.course;
                            const totalLessons = getTotalLessons(course);
                            const completed = enr.completedLessons?.length || 0;
                            return (
                              <div key={enr._id} style={{
                                padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
                                background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-default)',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <span className="mono-badge" style={diffBadge(course.difficulty)}>
                                    {course.difficulty}
                                  </span>
                                  <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                                    {course.category}
                                  </span>
                                </div>
                                <div>
                                  <h3 style={{ fontSize: '1rem', lineHeight: 1.3 }}>{course.title}</h3>
                                </div>
                                {/* Progress */}
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                      {completed}/{totalLessons} lessons
                                    </span>
                                    <span className="font-mono" style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                      {enr.progressPercent}%
                                    </span>
                                  </div>
                                  <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${enr.progressPercent}%` }} />
                                  </div>
                                </div>
                                <button onClick={() => navigate(`/courses/${course._id}`)} className="btn-secondary"
                                        style={{ width: '100%', fontSize: '0.8125rem', padding: '8px' }}>
                                  {enr.progressPercent === 0 ? 'Start course' : 'Resume course'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ---- ROW 3: Review Queue (2×2) + Achievements (2×2) ---- */}

                  {/* Review Queue — 2×2 */}
                  <div className="bento-cell bento-2x2" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="bento-section-header">
                      <h2>Review Queue</h2>
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                      <ReviewQueue />
                    </div>
                  </div>

                  {/* Achievements — 2×2 */}
                  <div className="bento-cell bento-2x2" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="bento-section-header">
                      <h2>Achievements</h2>
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: '12px', flex: 1,
                    }}>
                      {achievements.earned.map((ua) => (
                        <AchievementBadge key={ua._id} achievement={ua.achievement} earned={true} />
                      ))}
                      {achievements.locked.map((achievement) => (
                        <AchievementBadge key={achievement._id} achievement={achievement} earned={false} />
                      ))}
                      {achievements.earned.length === 0 && achievements.locked.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          <span className="font-mono" style={{ fontSize: '0.75rem' }}>No badges yet — complete courses to earn achievements</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ---- ROW 4: Leaderboard — full-width ---- */}
                  <div className="bento-cell bento-full">
                    <div className="bento-section-header">
                      <h2>Community Leaderboard</h2>
                      <Link to="/learning-log" className="font-mono"
                            style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        Learning Log →
                      </Link>
                    </div>
                    <LeaderboardSection user={user} />
                  </div>

                  {/* ---- ROW 5: Recommendations ---- */}

                  {/* Section header — full width, not a cell */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Recommended for you</h2>
                    <Link to="/onboarding" className="font-mono"
                          style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                      Adjust preferences →
                    </Link>
                  </div>

                  {recommendations.length === 0 ? (
                    <div className="bento-cell bento-cell--empty bento-full" style={{ minHeight: '120px' }}>
                      <p style={{ color: 'var(--text-secondary)' }}>No matches right now.</p>
                      <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>
                        Update your interests in Preferences to get fresh results.
                      </p>
                    </div>
                  ) : (
                    <>
                      {recommendations.map((course, idx) => (
                        <div key={course._id} className={`bento-cell ${idx === 0 ? 'bento-2x1' : 'bento-1x1'}`}
                             style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                          {idx === 0 && (
                            <span className="font-mono" style={{
                              fontSize: '0.5625rem', color: 'var(--accent-primary)',
                              letterSpacing: '0.1em', fontWeight: 700,
                            }}>
                              ★ Top recommendation
                            </span>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <span className="mono-badge" style={diffBadge(course.difficulty)}>
                                {course.difficulty}
                              </span>
                              <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                                {course.category}
                              </span>
                            </div>
                            <h3 style={{ fontSize: idx === 0 ? '1.0625rem' : '0.9375rem', lineHeight: 1.3, marginBottom: '6px' }}>{course.title}</h3>
                            <p style={{
                              fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                              display: '-webkit-box', WebkitLineClamp: idx === 0 ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                            }}>
                              {course.description}
                            </p>
                          </div>
                          <button onClick={() => navigate(`/courses/${course._id}`)} className="btn-primary"
                                  style={{ width: '100%', fontSize: '0.8125rem', padding: '8px' }}>
                            View course
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
            {/* ============ END BENTO GRID ============ */}

          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
