import { useState, useEffect } from 'react';
import api from '../api';

export default function CourseRating({ courseId, showForm = false, enrollmentProgress = 0 }) {
  const [ratings, setRatings] = useState({ averageRating: 0, reviewCount: 0 });
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [userReview, setUserReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchRatings();
  }, [courseId]);

  const fetchRatings = async () => {
    try {
      const [summaryRes, reviewsRes] = await Promise.all([
        api.get(`/ratings/course/${courseId}/summary`),
        api.get(`/ratings/course/${courseId}/reviews`),
      ]);
      setRatings(summaryRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!userRating || userRating < 1 || userRating > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/ratings/course/${courseId}`, {
        rating: userRating,
        review: userReview,
      });
      window.dispatchEvent(new Event('refreshNotifications'));
      await fetchRatings();
      setUserRating(null);
      setUserReview('');
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    const activeRating = interactive && hoverRating > 0 ? hoverRating : rating;
    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setUserRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            disabled={!interactive}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: interactive ? 'pointer' : 'default',
              padding: '2px',
              transition: 'transform 0.15s ease',
              transform: interactive && hoverRating >= star ? 'scale(1.15)' : 'scale(1)',
              opacity: star <= Math.round(activeRating) ? 1 : 0.4,
            }}
          >
            {star <= Math.round(activeRating) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Loading ratings...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Average rating display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {renderStars(ratings.averageRating)}
        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {ratings.averageRating.toFixed(1)}
        </span>
        <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          ({ratings.reviewCount} reviews)
        </span>
      </div>

      {/* Rating form for completed courses */}
      {showForm && enrollmentProgress === 100 && (
        <div className="blueprint-card" style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            fontFamily: 'var(--font-display)',
          }}>
            Rate this course
          </h4>

          {/* Star rating input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your Rating
            </label>
            {renderStars(userRating || 0, true)}
          </div>

          {/* Review text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="font-mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your Review (optional)
            </label>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Share your experience with this course..."
              rows={3}
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '10px 12px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>

          <button
            onClick={handleSubmitRating}
            disabled={submitting || !userRating}
            className="btn-primary"
            style={{
              alignSelf: 'flex-start',
              padding: '8px 20px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              opacity: submitting || !userRating ? 0.5 : 1,
              cursor: submitting || !userRating ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      )}

      {/* Progress message for incomplete courses */}
      {showForm && enrollmentProgress < 100 && (
        <p className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Complete the course to rate it ({enrollmentProgress}% done)
        </p>
      )}

      {/* Reviews list */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 className="font-mono" style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: 0,
          }}>
            Recent Reviews
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
            {reviews.slice(0, 5).map((review, idx) => (
              <div key={idx} className="blueprint-card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  {/* User avatar */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--bg-canvas)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-display)',
                    flexShrink: 0,
                  }}>
                    {review.user?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                    {review.user}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                {review.review && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>
                    {review.review}
                  </p>
                )}
                <p className="font-mono" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
                  {new Date(review.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
