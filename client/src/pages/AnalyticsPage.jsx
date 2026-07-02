import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'instructor'
  const [studentData, setStudentData] = useState(null);
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isInstructorOrAdmin = user && ['instructor', 'admin'].includes(user.role);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch student analytics
      const sRes = await api.get('/analytics');
      setStudentData(sRes.data.data);

      // If instructor/admin, fetch instructor analytics
      if (isInstructorOrAdmin) {
        const iRes = await api.get('/instructor/analytics');
        setInstructorData(iRes.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-3">
        <div style={{
          width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>COMPUTING_METRIC_AGGREGATES...</p>
      </div>
    );
  }

  const COLORS = ['#00F0FF', '#FFA03A', '#34D399', '#FF4D6A', '#a78bfa'];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-canvas)' }}>
      {/* Sidebar */}
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
              { label: 'Schedule', path: '/analytics', active: true },
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
            {isInstructorOrAdmin && (
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

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '56px', borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
        }}>
          <span className="tech-header">ANALYTICS // REPORT_DASHBOARD</span>
          {isInstructorOrAdmin && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('student')}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                  padding: '4px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: activeTab === 'student' ? 'rgba(0,240,255,0.08)' : 'transparent',
                  border: `1px solid ${activeTab === 'student' ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  color: activeTab === 'student' ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
              >
                STUDENT_VIEW
              </button>
              <button
                onClick={() => setActiveTab('instructor')}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                  padding: '4px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: activeTab === 'instructor' ? 'rgba(255,160,58,0.08)' : 'transparent',
                  border: `1px solid ${activeTab === 'instructor' ? 'var(--accent-secondary)' : 'var(--border-default)'}`,
                  color: activeTab === 'instructor' ? 'var(--accent-secondary)' : 'var(--text-muted)',
                }}
              >
                INSTRUCTOR_VIEW
              </button>
            </div>
          )}
        </header>

        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          
          {error && (
            <div className="blueprint-card" style={{ padding: '16px', borderColor: 'var(--danger)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              ERROR: {error}
            </div>
          )}

          {/* Student Tab view */}
          {activeTab === 'student' && studentData && (
            <>
              {/* Top Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TOTAL_LEARNING_TIME</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {studentData.weeklyTimeSpent?.reduce((acc, curr) => acc + (curr.minutes || 0), 0) || 0}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MINS</span>
                  </div>
                </div>

                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>QUIZZES_ATTEMPTED</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {studentData.quizScoreTrend?.length || 0}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ATTEMPTS</span>
                  </div>
                </div>

                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AVERAGE_QUIZ_SCORE</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {studentData.quizScoreTrend?.length > 0
                        ? Math.round(studentData.quizScoreTrend.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentData.quizScoreTrend.length)
                        : 0}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
              </div>

              {/* Time Spent Chart */}
              <div className="blueprint-card" style={{ padding: '24px' }}>
                <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  // WEEKLY_STUDY_TIME
                </h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={studentData.weeklyTimeSpent}>
                      <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
                      <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" />
                      <YAxis stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                      <Bar dataKey="minutes" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} name="Mins Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="blueprint-card" style={{ padding: '24px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 16px' }}>
                    // COMPLETION_BY_CATEGORY
                  </h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={studentData.completionByCategory} layout="vertical">
                        <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" />
                        <YAxis dataKey="category" type="category" stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" width={90} />
                        <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                        <Bar dataKey="rate" fill="var(--success)" radius={[0, 4, 4, 0]} name="Completion Rate (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quiz score trend */}
                <div className="blueprint-card" style={{ padding: '24px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 16px' }}>
                    // QUIZ_PERFORMANCE_TREND
                  </h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart data={studentData.quizScoreTrend}>
                        <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
                        <XAxis dataKey="attempt" stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" />
                        <YAxis stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                        <Line type="monotone" dataKey="score" stroke="var(--accent-secondary)" strokeWidth={2} activeDot={{ r: 8 }} name="Score (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Instructor Tab view */}
          {activeTab === 'instructor' && instructorData && (
            <>
              {/* Top Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ACTIVE_COURSES</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {instructorData.totalCourses || 0}
                    </span>
                  </div>
                </div>

                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>UNIQUE_STUDENTS</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {instructorData.totalStudents || 0}
                    </span>
                  </div>
                </div>

                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>POTENTIAL_DROP_OFFS</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>
                      {instructorData.inactiveStudents?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Course detailed table */}
              <div className="blueprint-card" style={{ padding: '24px' }}>
                <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  // COURSE_ENGAGEMENT_REGISTRY
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px 8px' }}>COURSE_TITLE</th>
                        <th style={{ padding: '12px 8px' }}>ENROLLED</th>
                        <th style={{ padding: '12px 8px' }}>AVG_PROGRESS</th>
                        <th style={{ padding: '12px 8px' }}>COMPLETIONS</th>
                        <th style={{ padding: '12px 8px' }}>QUIZ_AVG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructorData.courses?.map((c) => (
                        <tr key={c._id} style={{ borderBottom: '1px solid var(--border-default)', fontSize: '0.85rem' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{c.totalEnrolled}</td>
                          <td style={{ padding: '12px 8px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{c.avgProgress}%</td>
                          <td style={{ padding: '12px 8px', color: 'var(--success)' }}>{c.completedCount} ({c.completionRate}%)</td>
                          <td style={{ padding: '12px 8px', color: 'var(--accent-secondary)' }}>{c.avgQuizScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Drop off & Inactive row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: 'repeat(2, 1fr)', gap: '20px' }}>
                {/* Drop-off chart */}
                <div className="blueprint-card" style={{ padding: '24px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 16px' }}>
                    // student_progress_distributions
                  </h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={instructorData.dropOffData}>
                        <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
                        <XAxis dataKey="courseTitle" stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" />
                        <YAxis stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" />
                        <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                        <Legend />
                        <Bar dataKey="buckets.0-25" fill="#FF4D6A" name="0-25% progress" />
                        <Bar dataKey="buckets.25-50" fill="#FFA03A" name="25-50% progress" />
                        <Bar dataKey="buckets.50-75" fill="#00F0FF" name="50-75% progress" />
                        <Bar dataKey="buckets.75-100" fill="#34D399" name="75-100% progress" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Inactive students list */}
                <div className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                    // inactive_students_alert
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
                    Students with no registered activity logs in the last 14 days.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
                    {instructorData.inactiveStudents?.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '16px 0' }}>
                        No inactive students detected. Awesome!
                      </div>
                    ) : (
                      instructorData.inactiveStudents?.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.studentName}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{s.courseName}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{s.progressPercent}% prog</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>
                              Last access: {new Date(s.lastAccessed).toLocaleDateString()}
                            </span>
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
      </main>
    </div>
  );
}
