import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../api';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes');
        setQuizzes(res.data.quizzes || res.data.data || []);
      } catch (err) {
        console.error(err);
        setQuizzes([
          { _id: '1', title: 'React for Beginners: Build Dynamic Web Apps', category: 'Web Development', questionsCount: 5, difficulty: 'beginner' },
          { _id: '2', title: 'Advanced Node.js and Microservices Architecture', category: 'Web Development', questionsCount: 5, difficulty: 'advanced' },
          { _id: '3', title: 'Introduction to Python and Data Science', category: 'Data Science', questionsCount: 5, difficulty: 'beginner' },
          { _id: '4', title: 'Modern UI/UX Design Fundamentals', category: 'Design', questionsCount: 5, difficulty: 'beginner' },
          { _id: '5', title: 'Growth Marketing and SEO Strategy', category: 'Marketing', questionsCount: 5, difficulty: 'intermediate' },
          { _id: '6', title: 'Mastering Machine Learning with TensorFlow', category: 'Data Science', questionsCount: 5, difficulty: 'advanced' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner': return { color: 'var(--success)', bg: 'rgba(111,207,151,0.12)' };
      case 'intermediate': return { color: 'var(--accent-primary)', bg: 'rgba(242,176,86,0.12)' };
      default: return { color: 'var(--danger)', bg: 'rgba(232,116,92,0.12)' };
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Calibration Quizzes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Verify your comprehension and update your adaptive pathway mapping.
          </p>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SCANNING_CALIBRATION_SPEC...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {quizzes.map((quiz) => {
              const diff = getDifficultyColor(quiz.difficulty);
              return (
                <div key={quiz._id} className="blueprint-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{quiz.category}</span>
                    <h3 style={{ margin: '4px 0 8px' }}>{quiz.title}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="font-mono" style={{ fontSize: '0.6875rem', color: diff.color, background: diff.bg, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {quiz.difficulty}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                        {quiz.questionsCount} Questions
                      </span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/quizzes/${quiz._id}`)} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.8125rem' }}>
                    Attempt
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
