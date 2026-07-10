const ActivityLog = require('../models/ActivityLog');

/**
 * Fire-and-forget activity logger.
 * Writes an entry to ActivityLog without blocking the request-response cycle.
 *
 * @param {string} userId  - The user's ObjectId
 * @param {string} action  - One of: lesson_viewed, lesson_completed, quiz_attempted,
 *                           course_enrolled, course_completed, login, logout
 * @param {object} metadata - Optional metadata: { courseId, lessonId, quizId, score, timeSpent, extra }
 */
const logActivity = (userId, action, metadata = {}) => {
  // Don't await — fire and forget so the main request isn't delayed
  ActivityLog.create({
    user: userId,
    action,
    metadata,
  }).catch((err) => {
    // Log to console but never crash the app
    console.error('[ActivityLogger] Failed to write log:', err.message);
  });
};

module.exports = logActivity;
