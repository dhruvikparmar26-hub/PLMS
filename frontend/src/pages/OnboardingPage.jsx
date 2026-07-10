import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const CATEGORIES = [
  { id: 'Web Development', name: 'Web Development', tag: 'WEB' },
  { id: 'Data Science', name: 'Data Science & AI', tag: 'DATA' },
  { id: 'Design', name: 'UI/UX Design', tag: 'DSN' },
  { id: 'Marketing', name: 'Growth Marketing', tag: 'MKT' },
  { id: 'Business', name: 'Business & Management', tag: 'BIZ' },
];

const SKILL_LEVELS = [
  { id: 'beginner', title: 'Beginner', desc: 'Starting fresh. Looking for fundamentals.' },
  { id: 'intermediate', title: 'Intermediate', desc: 'Have some ground. Ready to build projects.' },
  { id: 'advanced', title: 'Advanced', desc: 'Experienced. Seeking deep dives and best practices.' },
];

const OnboardingPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('beginner');
  const [step, setStep] = useState(1);
  const [placementQuizData, setPlacementQuizData] = useState(null);
  const [placementAnswers, setPlacementAnswers] = useState([]);
  const [placementResults, setPlacementResults] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const toggleCategory = (id) => {
    setError('');
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      setError('Select at least one interest to calibrate your recommendations.');
      return;
    }
    setStep(2);
  };

  const handleStartPlacementQuiz = async (category) => {
    setLoadingQuiz(true);
    setError('');
    try {
      const res = await api.get(`/placement-quiz/${encodeURIComponent(category)}`);
      setPlacementQuizData(res.data.quiz);
      setPlacementAnswers(new Array(res.data.quiz.questions.length).fill(null));
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load placement quiz.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handlePlacementAnswer = (questionIndex, optionIndex) => {
    const newAnswers = [...placementAnswers];
    newAnswers[questionIndex] = optionIndex;
    setPlacementAnswers(newAnswers);
  };

  const handleSkipPlacement = async () => {
    setStep(4);
  };

  const handleSubmitPlacementQuiz = async () => {
    const hasUnanswered = placementAnswers.some((a) => a === null);
    if (hasUnanswered) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/placement-quiz/${encodeURIComponent(placementQuizData.category)}/submit`, {
        answers: placementAnswers.map((optIdx, qIdx) => ({ questionIndex: qIdx, selectedOptionIndex: optIdx })),
      });
      setPlacementResults([...placementResults, res.data]);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit placement quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.patch('/users/me/preferences', {
        learningPreferences: selectedCategories,
        skillLevel: selectedSkill,
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4"
         style={{ background: 'var(--bg-canvas)' }}>
      <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">

        {/* Header */}
        <div>
          <span className="tech-header">CONFIG:PROFILE / CALIBRATE</span>
          <h1 style={{ marginTop: '8px' }}>
            Configure your lab, <span style={{ color: 'var(--accent-primary)' }}>{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            {step === 1 && 'Tell us what you want to learn and your current level. We use this to surface relevant courses.'}
            {step === 2 && 'Take a quick placement quiz to help us personalize your learning path (optional).'}
            {step === 3 && `Placement Quiz: ${placementQuizData?.category}`}
            {step === 4 && 'Review your results and complete setup.'}
          </p>
        </div>

        {/* Card */}
        <div className="blueprint-card" style={{ padding: '32px' }}>
          {error && (
            <div style={{
              marginBottom: '20px', padding: '12px 16px',
              background: 'rgba(255, 77, 106, 0.08)',
              border: '1px solid rgba(255, 77, 106, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)', fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Step 1: Categories and Skill Level */}
          {step === 1 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Step 1: Categories */}
            <div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid var(--border-default)', paddingBottom: '8px', marginBottom: '16px',
              }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-mono" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>01</span>
                  Pick your interests
                </h3>
                <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  SELECT ALL THAT APPLY
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px', textAlign: 'left',
                        background: isSelected ? 'rgba(242, 176, 86, 0.06)' : 'var(--bg-canvas)',
                        border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
                      }}
                    >
                      <span className="font-mono" style={{
                        fontSize: '0.625rem', fontWeight: 700,
                        padding: '2px 6px',
                        border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        borderRadius: '3px', letterSpacing: '0.06em',
                        minWidth: '36px', textAlign: 'center',
                      }}>
                        {cat.tag}
                      </span>
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Skill level */}
            <div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid var(--border-default)', paddingBottom: '8px', marginBottom: '16px',
              }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-mono" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>02</span>
                  Set experience level
                </h3>
                <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  SELECT ONE
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {SKILL_LEVELS.map((level) => {
                  const isSelected = selectedSkill === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setSelectedSkill(level.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: '6px',
                        padding: '16px', textAlign: 'left',
                        background: isSelected ? 'rgba(242, 176, 86, 0.06)' : 'var(--bg-canvas)',
                        border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.875rem',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      }}>
                        {level.title}
                      </span>
                      <span style={{
                        fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                      }}>
                        {level.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Calibrating recommendations…' : 'Continue to placement quiz'}
              </button>
            </div>
          </form>
          )}

          {/* Step 2: Placement Quiz Selection */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Take Placement Quizzes</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Take a quick diagnostic quiz for each category to help us personalize your learning path. This is optional but recommended.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedCategories.map((category) => {
                  const hasResult = placementResults.find((r) => r.category === category);
                  return (
                    <div key={category} className="blueprint-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{category}</span>
                        {hasResult && (
                          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--success)', marginLeft: '8px' }}>
                            ✓ {hasResult.skillLevel} ({hasResult.score}%)
                          </span>
                        )}
                      </div>
                      {hasResult ? (
                        <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COMPLETED</span>
                      ) : (
                        <button
                          onClick={() => handleStartPlacementQuiz(category)}
                          disabled={loadingQuiz}
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '6px 16px' }}
                        >
                          {loadingQuiz ? 'Loading...' : 'Start Quiz'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={handleSkipPlacement}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                >
                  Skip placement quizzes
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                >
                  {isSubmitting ? 'Saving...' : 'Complete setup'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Placement Quiz */}
          {step === 3 && placementQuizData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {placementQuizData.questions.length} questions · Passing score: {placementQuizData.passingScore}%
              </div>

              {placementQuizData.questions.map((question, qIdx) => (
                <div key={qIdx} className="blueprint-card" style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--accent-primary)' }}>
                      Q{qIdx + 1}
                    </span>
                    <p style={{ fontSize: '0.875rem', marginTop: '8px', fontWeight: 600 }}>{question.questionText}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {question.options.map((option, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handlePlacementAnswer(qIdx, oIdx)}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          background: placementAnswers[qIdx] === oIdx ? 'rgba(242, 176, 86, 0.1)' : 'var(--bg-canvas)',
                          border: `1px solid ${placementAnswers[qIdx] === oIdx ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                          borderRadius: 'var(--radius-md)',
                          color: placementAnswers[qIdx] === oIdx ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitPlacementQuiz}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit quiz'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review Results */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Placement Quiz Results</h3>
                {placementResults.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    You skipped the placement quizzes. We'll use your self-reported skill level for recommendations.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {placementResults.map((result, idx) => (
                      <div key={idx} className="blueprint-card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{result.category}</span>
                          <span className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                            {result.score}%
                          </span>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Assessed level: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{result.skillLevel.toUpperCase()}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.8125rem', padding: '12px' }}
                >
                  {isSubmitting ? 'Saving configuration…' : 'Complete setup & open dashboard'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
