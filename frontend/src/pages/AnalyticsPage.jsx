import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import DashboardLayout from '../components/layout/DashboardLayout';
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
  const [enrollments, setEnrollments] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isInstructorOrAdmin = user && ['instructor', 'admin'].includes(user.role);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch student analytics, enrollments, and quiz attempts in parallel, catching errors individually
      const [sRes, enrollRes, quizRes] = await Promise.all([
        api.get('/analytics').catch(err => {
          console.error('Error fetching general analytics:', err);
          return { data: { data: null } };
        }),
        api.get('/enrollments/me').catch(err => {
          console.error('Error fetching enrollments:', err);
          return { data: { enrollments: [] } };
        }),
        api.get('/quizzes/my-attempts').catch(err => {
          console.error('Error fetching quiz attempts:', err);
          return { data: { attempts: [] } };
        })
      ]);

      const sData = sRes.data.data || { weeklyTimeSpent: [], completionByCategory: [], quizScoreTrend: [] };
      setStudentData(sData);
      setEnrollments(enrollRes.data.enrollments || []);
      setQuizAttempts(quizRes.data.attempts || []);

      // If instructor/admin, fetch instructor analytics
      if (isInstructorOrAdmin) {
        try {
          const iRes = await api.get('/instructor/analytics');
          setInstructorData(iRes.data);
        } catch (err) {
          console.error('Error fetching instructor analytics:', err);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load insights datasets.');
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
      <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center flex-col gap-3">
        <div style={{
          width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>COMPUTING_METRIC_AGGREGATES...</p>
      </div>
    );
  }

  const COLORS = ['#0EA5A4', '#3B82F6', '#22C55E', '#EF4444', '#a78bfa'];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
        {/* Analytics Top Control Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
          <h1 className="dashboard-greeting-title">My Insights</h1>
          {isInstructorOrAdmin && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('student')}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
                  padding: '4px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: activeTab === 'student' ? 'rgba(14,165,164,0.08)' : 'transparent',
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
                  background: activeTab === 'instructor' ? 'rgba(59,130,246,0.08)' : 'transparent',
                  border: `1px solid ${activeTab === 'instructor' ? 'var(--accent-secondary)' : 'var(--border-default)'}`,
                  color: activeTab === 'instructor' ? 'var(--accent-secondary)' : 'var(--text-muted)',
                }}
              >
                INSTRUCTOR_VIEW
              </button>
            </div>
          )}
        </div>
          
          {error && (
            <div className="blueprint-card" style={{ padding: '16px', borderColor: 'var(--danger)', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              ERROR: {error}
            </div>
          )}

          {/* Student Tab view */}
          {activeTab === 'student' && studentData && (
            <>
              {/* Top Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Total Learning Time</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {studentData.weeklyTimeSpent?.reduce((acc, curr) => acc + (curr.minutes || 0), 0) || 0}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>mins recorded</span>
                  </div>
                </div>

                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Quizzes Attempted</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {studentData.quizScoreTrend?.length || 0}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>total attempts</span>
                  </div>
                </div>

                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Average Quiz Score</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {studentData.quizScoreTrend?.length > 0
                        ? Math.round(studentData.quizScoreTrend.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentData.quizScoreTrend.length)
                        : 0}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>across all quizzes</span>
                  </div>
                </div>
              </div>

              {/* Time Spent Chart */}
              <div className="blueprint-card" style={{ padding: '16px' }}>
                <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 12px' }}>
                  Weekly Study Time
                </h3>
                <div style={{ width: '100%', height: '200px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div className="blueprint-card" style={{ padding: '16px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 12px' }}>
                    Completion by Category
                  </h3>
                  <div style={{ width: '100%', height: '200px' }}>
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
                <div className="blueprint-card" style={{ padding: '16px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 12px' }}>
                    Quiz Performance Trend
                  </h3>
                  <div style={{ width: '100%', height: '200px' }}>
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

              {/* Course Registries & Progress Analytics */}
              <div className="blueprint-card" style={{ padding: '24px', marginTop: '16px' }}>
                <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Course Registries & Progress Analytics
                </h3>
                {enrollments.length === 0 ? (
                  <p className="font-mono text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>No course enrollments detected — enroll in a course to view details</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {enrollments.map((e) => (
                      <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', padding: '12px 16px', borderRadius: '4px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem' }}>{e.course?.title}</p>
                          <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {e.course?.category} · {e.course?.difficulty}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                          <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{e.progressPercent}% Complete</span>
                          <div className="progress-track" style={{ height: '4px', marginTop: '4px', width: '100%' }}>
                            <div className="progress-fill" style={{ width: `${e.progressPercent}%`, height: '100%' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quiz Calibration Records & Scores */}
              <div className="blueprint-card" style={{ padding: '24px', marginTop: '16px' }}>
                <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Quiz Calibration Records & Scores
                </h3>
                {quizAttempts.length === 0 ? (
                  <p className="font-mono text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>No quiz attempts recorded — attempt a calibration quiz to begin tracking</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '10px 8px' }}>Quiz Title</th>
                          <th style={{ padding: '10px 8px' }}>Attempt Date</th>
                          <th style={{ padding: '10px 8px' }}>Score</th>
                          <th style={{ padding: '10px 8px' }}>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizAttempts.map((attempt) => (
                          <tr key={attempt._id} style={{ borderBottom: '1px solid var(--border-default)', fontSize: '0.8125rem' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{attempt.quiz?.title || 'Quiz Assessment'}</td>
                            <td className="font-mono" style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{new Date(attempt.attemptedAt).toLocaleDateString()}</td>
                            <td className="font-mono" style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--accent-secondary)' }}>{attempt.score}%</td>
                            <td style={{ padding: '10px 8px' }}>
                              <span className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', background: attempt.passed ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: attempt.passed ? 'var(--success)' : 'var(--danger)' }}>
                                {attempt.passed ? 'PASSED ✓' : 'FAILED ✗'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Instructor Tab view */}
          {activeTab === 'instructor' && instructorData && (
            <>
              {/* Top Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Active Courses</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {instructorData.totalCourses || 0}
                    </span>
                  </div>
                </div>

                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Unique Students</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {instructorData.totalStudents || 0}
                    </span>
                  </div>
                </div>

                <div className="blueprint-card" style={{ padding: '20px' }}>
                  <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Potential Drop-offs</span>
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
                  Course Engagement Registry
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px 8px' }}>Course Title</th>
                        <th style={{ padding: '12px 8px' }}>Enrolled</th>
                        <th style={{ padding: '12px 8px' }}>Avg Progress</th>
                        <th style={{ padding: '12px 8px' }}>Completions</th>
                        <th style={{ padding: '12px 8px' }}>Quiz Avg</th>
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
                    Student Progress Distributions
                  </h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={instructorData.dropOffData}>
                        <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" />
                        <XAxis dataKey="courseTitle" stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" />
                        <YAxis stroke="var(--text-muted)" fontSize={11} fontFamily="Space Mono" />
                        <Tooltip contentStyle={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
                        <Legend />
                        <Bar dataKey="buckets.0-25" fill="var(--danger)" name="0-25% progress" />
                        <Bar dataKey="buckets.25-50" fill="var(--accent-secondary)" name="25-50% progress" />
                        <Bar dataKey="buckets.50-75" fill="var(--accent-primary)" name="50-75% progress" />
                        <Bar dataKey="buckets.75-100" fill="var(--success)" name="75-100% progress" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Inactive students list */}
                <div className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                    Inactive Students Alert
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
    </DashboardLayout>
  );
}
