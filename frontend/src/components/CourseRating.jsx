import { useState, useEffect } from 'react';
import api from '../api';

export default function CourseRating({ courseId, showForm = false, enrollmentProgress = 0 }) {
  const [ratings, setRatings] = useState({ averageRating: 0, reviewCount: 0 });
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [userReview, setUserReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setUserRating(star) : undefined}
            disabled={!interactive}
            className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            {star <= Math.round(rating) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading ratings...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {renderStars(ratings.averageRating)}
        <span className="text-sm font-semibold">{ratings.averageRating.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({ratings.reviewCount} reviews)</span>
      </div>

      {showForm && enrollmentProgress === 100 && !userRating && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-2">Rate this course</h4>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Your Rating</label>
            {renderStars(userRating || 0, true)}
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Your Review (optional)</label>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Share your experience with this course..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <button
            onClick={handleSubmitRating}
            disabled={submitting || !userRating}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      )}

      {showForm && enrollmentProgress < 100 && (
        <p className="mt-2 text-sm text-gray-500">
          Complete the course to rate it ({enrollmentProgress}% done)
        </p>
      )}

      {reviews.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Recent Reviews</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {reviews.slice(0, 3).map((review, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{review.user}</span>
                  <span className="text-yellow-500 text-sm">
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                {review.review && (
                  <p className="text-sm text-gray-600">{review.review}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
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
