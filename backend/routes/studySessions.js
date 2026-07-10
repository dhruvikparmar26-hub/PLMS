const express = require('express');
const router = express.Router();
const {
  getUserStudySessions,
  getWeeklySessions,
  getTodaySessions,
  getAvailableCourses,
  createStudySession,
  updateStudySession,
  deleteStudySession,
  completeStudySession,
} = require('../controllers/studySessionController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all sessions for user
router.route('/').get(getUserStudySessions).post(createStudySession);

// Get weekly sessions
router.get('/week', getWeeklySessions);

// Get today's sessions
router.get('/today', getTodaySessions);

// Get available courses
router.get('/courses', getAvailableCourses);

// Complete a session
router.post('/:id/complete', completeStudySession);

// Update and delete individual sessions
router.route('/:id').put(updateStudySession).delete(deleteStudySession);

module.exports = router;
