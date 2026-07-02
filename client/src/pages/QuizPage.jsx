import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const QuizPage = () => {
  const { id } = useParams(); // Quiz ID
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Selection state for standard mode: maps questionIndex -> selectedOptionIndex
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // Submission result state
  const [attemptResult, setAttemptResult] = useState(null);

  // Adaptive mode state variables
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentAdaptiveQuestion, setCurrentAdaptiveQuestion] = useState(null);
  const [adaptiveState, setAdaptiveState] = useState({
    currentDifficulty: 'medium',
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
  });
  const [excludedIds, setExcludedIds] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null); // { optionId, optionIdx }
  const [gradedResult, setGradedResult] = useState(null); // { isCorrect }
  const [nextQuestionBuffered, setNextQuestionBuffered] = useState(null);
  const [nextStateBuffered, setNextStateBuffered] = useState(null);
  const [adaptiveFinished, setAdaptiveFinished] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]); // [{ questionIndex, selectedOptionIndex, isCorrect }]

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      setError('');
      setAttemptResult(null);
      setSelectedAnswers({});
      setQuizStarted(false);
      setCurrentAdaptiveQuestion(null);
      setExcludedIds([]);
      setCurrentSelection(null);
      setGradedResult(null);
      setAdaptiveFinished(false);
      setAnsweredQuestions([]);

      const res = await api.get(`/quizzes/${id}`);
      setQuiz(res.data.quiz);
    } catch (err) {
      setError('Failed to fetch quiz. Please make sure you are enrolled.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Standard Mode option selection
  const handleSelectOption = (qIndex, optIndex) => {
    if (attemptResult) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIndex]: optIndex,
    });
  };

  // Standard Mode submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quiz || attemptResult) return;

    // Check if user answered all questions
    const unanswered = quiz.questions.filter((_, idx) => selectedAnswers[idx] === undefined);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have left ${unanswered.length} questions unanswered. Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitLoading(true);
      setError('');

      const answersPayload = quiz.questions.map((_, idx) => ({
        questionIndex: idx,
        selectedOptionIndex: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1,
      }));

      const res = await api.post(`/quizzes/${id}/attempt`, {
        answers: answersPayload,
        adaptiveMode: false,
      });

      setAttemptResult(res.data.attempt);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz attempt.');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Adaptive Mode helper functions
  const handleStartAdaptiveQuiz = async () => {
    try {
      setSubmitLoading(true);
      setError('');
      
      const response = await api.get(`/quizzes/${id}/adaptive-next`, {
        params: {
          exclude: '',
        }
      });

      if (response.data.finished) {
        setAdaptiveFinished(true);
      } else {
        setCurrentAdaptiveQuestion(response.data.question);
        setAdaptiveState(response.data.state);
        setQuizStarted(true);
      }
    } catch (err) {
      setError('Failed to start adaptive quiz.');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleVerifyAdaptiveAnswer = async () => {
    if (!currentSelection || submitLoading || gradedResult) return;

    setSubmitLoading(true);
    setError('');

    try {
      const nextExclude = [...excludedIds, currentAdaptiveQuestion._id].join(',');
      
      const response = await api.get(`/quizzes/${id}/adaptive-next`, {
        params: {
          exclude: nextExclude,
          currentDifficulty: adaptiveState.currentDifficulty,
          consecutiveCorrect: adaptiveState.consecutiveCorrect,
          consecutiveWrong: adaptiveState.consecutiveWrong,
          questionId: currentAdaptiveQuestion._id,
          selectedOptionId: currentSelection.optionId,
        }
      });

      const isCorrect = response.data.isCorrect;
      setGradedResult({ isCorrect });

      // Save user answer
      const updatedAnswers = [
        ...answeredQuestions,
        {
          questionIndex: currentAdaptiveQuestion.originalIndex,
          selectedOptionIndex: currentSelection.optionIdx,
          isCorrect,
        }
      ];
      setAnsweredQuestions(updatedAnswers);
      setExcludedIds([...excludedIds, currentAdaptiveQuestion._id]);

      if (response.data.finished) {
        setAdaptiveFinished(true);
      } else {
        setNextQuestionBuffered(response.data.question);
        setNextStateBuffered(response.data.state);
      }
    } catch (err) {
      setError('Failed to grade adaptive answer.');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleNextAdaptiveCard = () => {
    if (nextQuestionBuffered) {
      setCurrentAdaptiveQuestion(nextQuestionBuffered);
      setAdaptiveState(nextStateBuffered);
      setCurrentSelection(null);
      setGradedResult(null);
      setNextQuestionBuffered(null);
      setNextStateBuffered(null);
    }
  };

  const handleFinishAdaptiveQuiz = async () => {
    try {
      setSubmitLoading(true);
      setError('');

      const res = await api.post(`/quizzes/${id}/attempt`, {
        answers: answeredQuestions.map((ans) => ({
          questionIndex: ans.questionIndex,
          selectedOptionIndex: ans.selectedOptionIndex,
        })),
        adaptiveMode: true,
      });

      setAttemptResult(res.data.attempt);
    } catch (err) {
      setError('Failed to submit final adaptive evaluation score.');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRetry = () => {
    setAttemptResult(null);
    setSelectedAnswers({});
    setQuizStarted(false);
    setCurrentAdaptiveQuestion(null);
    setExcludedIds([]);
    setCurrentSelection(null);
    setGradedResult(null);
    setAdaptiveFinished(false);
    setAnsweredQuestions([]);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-3">
        <div style={{
          width: '32px', height: '32px', border: '3px solid var(--accent-primary)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>RETRIEVING_EVALUATION_SPECS...</p>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4 p-4 text-center">
        <p className="font-mono text-sm" style={{ color: 'var(--danger)' }}>ERROR: {error.toUpperCase()}</p>
        <Link to="/courses" className="btn-secondary" style={{ textDecoration: 'none' }}>
          &lt; Return to Course Catalog
        </Link>
      </div>
    );
  }

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
                  color: 'var(--text-secondary)',
                  border: '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}>
                {item.label}
              </Link>
            ))}
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
          <span className="tech-header">EVALUATION / RUN_BATTERY</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {quiz.course && (
              <Link
                to={`/courses/${quiz.course._id || quiz.course}`}
                className="btn-secondary"
                style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.75rem' }}
              >
                &lt; BACK_TO_SYLLABUS
              </Link>
            )}
            <button onClick={handleLogout} className="btn-secondary"
                    style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              Sign out
            </button>
          </div>
        </header>

        {/* Content Details */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
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

            {/* Quiz Title Header */}
            <div className="notebook-margin">
              <h1>{quiz.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                Requirement: Score <span className="font-mono text-accent" style={{ fontWeight: 700 }}>{quiz.passingScore}%</span> or higher to secure completion parameters.
              </p>
            </div>

            {/* Result Banner (if submitted) */}
            {attemptResult && (
              <div
                className="blueprint-card animate-stamp-in"
                style={{
                  padding: '24px',
                  borderColor: attemptResult.passed ? 'var(--success)' : 'var(--danger)',
                  background: attemptResult.passed ? 'rgba(52,211,153,0.03)' : 'rgba(255,77,106,0.03)',
                  display: 'flex', flexDirection: 'column', gap: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="font-display" style={{ margin: 0, fontSize: '1.25rem' }}>
                    {attemptResult.passed ? 'EVALUATION_SUCCESSFUL' : 'EVALUATION_FAILED'}
                  </h3>
                  <span className="completion-stamp" style={{
                    color: attemptResult.passed ? 'var(--success)' : 'var(--danger)',
                    borderColor: attemptResult.passed ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {attemptResult.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>SCORE_PCT</span>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '4px 0 0 0' }}>
                      {attemptResult.score}%
                    </p>
                  </div>
                  <div>
                    <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>POINTS_EARNED</span>
                    <p style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      {attemptResult.earnedPoints} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {attemptResult.totalPoints} pts</span>
                    </p>
                  </div>
                </div>

                {!attemptResult.passed && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      onClick={handleRetry}
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '8px 16px', background: 'var(--danger)', color: 'var(--text-primary)' }}
                    >
                      INITIALIZE_RETRY
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode Selector Card (only shown before starting) */}
            {!quizStarted && !attemptResult && (
              <div className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 className="font-display" style={{ fontSize: '1rem', margin: 0 }}>EVALUATION_PARAMETER_SELECTION</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Select the style of evaluation. Adaptive mode adjusts difficulty in real time based on your running answer streak, helping isolate your exact skill baseline.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                  <input
                    type="checkbox"
                    id="adaptiveModeCheckbox"
                    checked={isAdaptive}
                    onChange={(e) => setIsAdaptive(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--accent-primary)',
                      cursor: 'pointer'
                    }}
                  />
                  <label htmlFor="adaptiveModeCheckbox" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)', cursor: 'pointer' }}>
                    ACTIVATE_ADAPTIVE_ENGINE
                  </label>
                </div>
                <button
                  onClick={isAdaptive ? handleStartAdaptiveQuiz : () => setQuizStarted(true)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.85rem' }}
                >
                  START_EVALUATION
                </button>
              </div>
            )}

            {/* Adaptive Quiz Mode Render */}
            {isAdaptive && quizStarted && !attemptResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Adaptive Status HUD */}
                <div className="blueprint-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)' }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>CURRENT_DIFFICULTY</span>
                    <p className="font-mono" style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      margin: '2px 0 0 0',
                      color: adaptiveState.currentDifficulty === 'hard' ? 'var(--danger)' :
                             adaptiveState.currentDifficulty === 'medium' ? 'var(--accent-secondary)' : 'var(--success)'
                    }}>
                      {adaptiveState.currentDifficulty.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>STREAK_STATE</span>
                    <p className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                      C: {adaptiveState.consecutiveCorrect} | W: {adaptiveState.consecutiveWrong}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>TOTAL_ANSWERED</span>
                    <p className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--accent-primary)' }}>
                      {answeredQuestions.length} CARDS
                    </p>
                  </div>
                </div>

                {/* The Current Card */}
                {currentAdaptiveQuestion ? (
                  <div className="blueprint-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        ADAPTIVE_TARGET_{String(answeredQuestions.length + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                        WEIGHT: {currentAdaptiveQuestion.points || 10} PTS
                      </span>
                    </div>

                    <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {currentAdaptiveQuestion.questionText}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {currentAdaptiveQuestion.options.map((opt, optIdx) => {
                        const isSelected = currentSelection?.optionId === opt._id;
                        const isAnswered = gradedResult !== null;

                        let borderStyle = '1px solid var(--border-default)';
                        let bgStyle = 'var(--bg-canvas)';
                        let textColor = 'var(--text-secondary)';

                        if (isAnswered) {
                          const wasSelected = isSelected;
                          if (wasSelected) {
                            if (gradedResult.isCorrect) {
                              borderStyle = '1px solid var(--success)';
                              bgStyle = 'rgba(52,211,153,0.08)';
                              textColor = 'var(--success)';
                            } else {
                              borderStyle = '1px solid var(--danger)';
                              bgStyle = 'rgba(255,77,106,0.08)';
                              textColor = 'var(--danger)';
                            }
                          } else {
                            borderStyle = '1px solid rgba(30,46,49,0.3)';
                            bgStyle = 'rgba(0,0,0,0.1)';
                            textColor = 'var(--text-muted)';
                          }
                        } else if (isSelected) {
                          borderStyle = '1px solid var(--accent-primary)';
                          bgStyle = 'rgba(0,240,255,0.08)';
                          textColor = 'var(--accent-primary)';
                        }

                        return (
                          <button
                            key={opt._id || optIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => setCurrentSelection({ optionId: opt._id, optionIdx: optIdx })}
                            className="blueprint-card"
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '14px 18px',
                              border: borderStyle,
                              background: bgStyle,
                              color: textColor,
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              cursor: isAnswered ? 'default' : 'pointer',
                              borderRadius: 'var(--radius-md)',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: isSelected ? '4px solid var(--accent-primary)' : '1px solid var(--border-default)',
                                background: 'transparent',
                                flexShrink: 0
                              }}
                            />
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Verification Result */}
                    {gradedResult && (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: gradedResult.isCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(255,77,106,0.08)',
                        border: gradedResult.isCorrect ? '1px solid var(--success)' : '1px solid var(--danger)',
                        fontSize: '0.8125rem',
                        color: gradedResult.isCorrect ? 'var(--success)' : 'var(--danger)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {gradedResult.isCorrect ? '✓ CORRECT_VAL: NEXT DIFFICULTY STATE COMMITTED.' : '✗ INCORRECT_VAL: DIFFICULTY SCALING FACTOR REDUCED.'}
                      </div>
                    )}

                    {/* Action button inside card */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {!gradedResult ? (
                        <button
                          type="button"
                          disabled={!currentSelection || submitLoading}
                          onClick={handleVerifyAdaptiveAnswer}
                          className="btn-primary"
                          style={{ padding: '10px 24px', fontSize: '0.8rem' }}
                        >
                          {submitLoading ? 'VERIFYING...' : 'SUBMIT_VAL'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {!adaptiveFinished && (
                            <button
                              type="button"
                              onClick={handleNextAdaptiveCard}
                              className="btn-primary"
                              style={{ padding: '10px 24px', fontSize: '0.8rem' }}
                            >
                              NEXT_CARD
                            </button>
                          )}
                          {(adaptiveFinished || answeredQuestions.length >= 3) && (
                            <button
                              type="button"
                              onClick={handleFinishAdaptiveQuiz}
                              className="btn-primary"
                              style={{ padding: '10px 24px', fontSize: '0.8rem', backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: 'var(--bg-canvas)' }}
                            >
                              FINISH_EVALUATION
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="blueprint-card" style={{ padding: '24px', textAlign: 'center' }}>
                    <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No questions match your current level
                    </p>
                    <button onClick={handleFinishAdaptiveQuiz} className="btn-primary" style={{ marginTop: '12px' }}>
                      Finish Quiz
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Standard Quiz Mode Render */}
            {!isAdaptive && quizStarted && !attemptResult && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {quiz.questions.map((question, qIdx) => {
                  const selectedOpt = selectedAnswers[qIdx];
                  
                  return (
                    <div
                      key={question._id || qIdx}
                      className="blueprint-card"
                      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          QUESTION_{String(qIdx + 1).padStart(2, '0')}
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                          WEIGHT: {question.points || 10} PTS
                        </span>
                      </div>

                      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {question.questionText}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {question.options.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          
                          let borderStyle = '1px solid var(--border-default)';
                          let bgStyle = 'var(--bg-canvas)';
                          let textColor = 'var(--text-secondary)';
                          
                          if (isSelected) {
                            borderStyle = '1px solid var(--accent-primary)';
                            bgStyle = 'rgba(0,240,255,0.08)';
                            textColor = 'var(--accent-primary)';
                          }

                          return (
                            <button
                              key={opt._id || optIdx}
                              type="button"
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className="blueprint-card"
                              style={{
                                width: '100%', textAlign: 'left', padding: '14px 18px',
                                border: borderStyle, background: bgStyle, color: textColor,
                                fontSize: '0.8125rem', fontWeight: 600, display: 'flex',
                                alignItems: 'center', gap: '12px', cursor: 'pointer',
                                borderRadius: 'var(--radius-md)', transition: 'all var(--transition-fast)'
                              }}
                            >
                              <div
                                style={{
                                  width: '16px', height: '16px', borderRadius: '50%',
                                  border: isSelected ? '4px solid var(--accent-primary)' : '1px solid var(--border-default)',
                                  background: 'transparent', flexShrink: 0
                                }}
                              />
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Form actions */}
                <div style={{ marginTop: '12px' }}>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="btn-primary"
                    style={{ width: '100%', py: '14px', fontSize: '0.875rem' }}
                  >
                    {submitLoading ? 'SUBMITTING_TEST_DATA...' : 'SUBMIT_EVALUATION'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizPage;
