import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../api';

export default function ProgressReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const componentRef = useRef();

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [enrollmentsRes, achievementsRes, quizAttemptsRes] = await Promise.all([
        api.get('/enrollments/me'),
        api.get('/achievements/user'),
        api.get('/quizzes/my-attempts'),
      ]);

      const completedCourses = enrollmentsRes.data.enrollments?.filter(
        (e) => e.progressPercent === 100
      ) || [];

      setReportData({
        completedCourses,
        achievements: achievementsRes.data.data?.earned || [],
        quizAttempts: quizAttemptsRes.data.attempts || [],
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Learning Progress Report',
  });

  return (
    <div>
      <button
        onClick={() => {
          if (!reportData) {
            fetchReportData();
          } else {
            handlePrint();
          }
        }}
        className="btn-secondary"
        style={{ padding: '6px 16px', fontSize: '0.75rem' }}
      >
        {loading ? 'Loading...' : reportData ? 'Print Report' : 'Generate Report'}
      </button>

      {reportData && (
        <div style={{ display: 'none' }}>
          <div ref={componentRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Learning Progress Report</h1>
            <p style={{ marginBottom: '30px', color: '#666' }}>
              Generated on {new Date().toLocaleDateString()}
            </p>

            {/* Completed Courses */}
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #333' }}>
                Completed Courses ({reportData.completedCourses.length})
              </h2>
              {reportData.completedCourses.length === 0 ? (
                <p style={{ color: '#666' }}>No completed courses yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Course Title</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.completedCourses.map((enrollment) => (
                      <tr key={enrollment._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{enrollment.course.title}</td>
                        <td style={{ padding: '10px' }}>{enrollment.course.category}</td>
                        <td style={{ padding: '10px' }}>
                          {enrollment.rating ? `${enrollment.rating}/5` : 'Not rated'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Achievements */}
            <section style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #333' }}>
                Earned Achievements ({reportData.achievements.length})
              </h2>
              {reportData.achievements.length === 0 ? (
                <p style={{ color: '#666' }}>No achievements earned yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  {reportData.achievements.map((ua) => (
                    <div
                      key={ua._id}
                      style={{
                        padding: '15px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {ua.achievement.icon}
                      </div>
                      <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>
                        {ua.achievement.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        {ua.achievement.description}
                      </p>
                      <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                        Earned: {new Date(ua.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Quiz History */}
            <section>
              <h2 style={{ fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #333' }}>
                Quiz History ({reportData.quizAttempts.length})
              </h2>
              {reportData.quizAttempts.length === 0 ? (
                <p style={{ color: '#666' }}>No quiz attempts yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Quiz</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Score</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.quizAttempts.map((attempt) => (
                      <tr key={attempt._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{attempt.quiz.title}</td>
                        <td style={{ padding: '10px' }}>{attempt.score}%</td>
                        <td style={{ padding: '10px' }}>
                          {attempt.passed ? (
                            <span style={{ color: 'green', fontWeight: 'bold' }}>Passed</span>
                          ) : (
                            <span style={{ color: 'red', fontWeight: 'bold' }}>Failed</span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {new Date(attempt.attemptedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
