import { useState, useEffect } from 'react';
import api from '../api';

export default function ReviewQueue() {
  const [reviewItems, setReviewItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [result, setResult] = useState(null); // { isCorrect, nextReviewDate, intervalDays }
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      const response = await api.get('/spaced-repetition/review-queue');
      setReviewItems(response.data.reviewItems || []);
      setCurrentIndex(0);
      setSelectedOptionId(null);
      setResult(null);
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOptionId || submitting) return;

    const currentItem = reviewItems[currentIndex];
    setSubmitting(true);

    try {
      const response = await api.post('/spaced-repetition/record', {
        questionId: currentItem.questionId,
        quizId: currentItem.quiz._id,
        courseId: currentItem.course._id,
        selectedOptionId,
      });

      const resData = response.data;
      setResult({
        isCorrect: resData.isCorrect ?? (resData.spacedRepetition?.intervalDays > 1 || resData.spacedRepetition?.streak > 0),
        intervalDays: resData.spacedRepetition?.intervalDays,
        nextReviewDate: resData.spacedRepetition?.nextReviewDate,
      });
    } catch (error) {
      console.error('Error submitting review answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setSelectedOptionId(null);
    setResult(null);
    if (currentIndex + 1 >= reviewItems.length) {
      fetchReviewQueue();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div 
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem'
        }}
      >
        Scanning review queue...
      </div>
    );
  }

  if (reviewItems.length === 0) {
    return (
      <div 
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--success)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-xs)'
        }}
      >
        <h4 style={{ color: 'var(--success)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          ✓ All caught up — nothing due for review right now
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Excellent work. All spaced repetition targets have been successfully committed to memory.
        </p>
      </div>
    );
  }

  const currentItem = reviewItems[currentIndex];

  return (
    <div 
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Header status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-sm)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
          Review Queue: Card {currentIndex + 1} of {reviewItems.length}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          DUE: {currentItem.course?.title}
        </span>
      </div>

      {/* Card Body */}
      <div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-xs)' }}>
          {currentItem.quiz?.title || 'Quiz'}
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>
          {currentItem.questionText}
        </h3>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {currentItem.options?.map((option) => {
            const isSelected = selectedOptionId === option._id;
            const isAnswered = result !== null;
            
            let btnStyle = {
              backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.1)' : 'var(--bg-elevated)',
              border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
              color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-sm) var(--space-md)',
              textAlign: 'left',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              cursor: isAnswered ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)'
            };

            return (
              <button
                key={option._id}
                disabled={isAnswered}
                onClick={() => setSelectedOptionId(option._id)}
                style={btnStyle}
                onMouseEnter={(e) => {
                  if (!isAnswered && !isSelected) {
                    e.currentTarget.style.border = '1px solid var(--text-secondary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAnswered && !isSelected) {
                    e.currentTarget.style.border = '1px solid var(--border-default)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result feedback panel */}
      {result && (
        <div 
          style={{
            backgroundColor: result.isCorrect ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 77, 106, 0.1)',
            border: result.isCorrect ? '1px solid var(--success)' : '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)'
          }}
        >
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            fontWeight: 'bold', 
            fontSize: '0.8rem', 
            color: result.isCorrect ? 'var(--success)' : 'var(--danger)' 
          }}>
            {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {result.isCorrect 
              ? `Spaced repetition interval adjusted. Next review in ${result.intervalDays} days.`
              : 'Interval reset. This question will resurface in 1 day.'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
        {!result ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOptionId || submitting}
            style={{
              backgroundColor: selectedOptionId && !submitting ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color: selectedOptionId && !submitting ? 'var(--bg-canvas)' : 'var(--text-muted)',
              border: selectedOptionId && !submitting ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-sm) var(--space-lg)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: selectedOptionId && !submitting ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-fast)'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-canvas)',
              border: '1px solid var(--accent-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-sm) var(--space-lg)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {currentIndex + 1 >= reviewItems.length ? 'Complete' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
