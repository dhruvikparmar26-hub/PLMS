const express = require('express');
const { getMyEnrollments, getReviewQueue } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/enrollments/me
 * @desc    Get current user's enrollments
 * @access  Protected
 */
router.get('/me', protect, getMyEnrollments);

/**
 * @route   GET /api/enrollments/review-queue
 * @desc    Get review queue for lessons needing review
 * @access  Protected
 */
router.get('/review-queue', protect, getReviewQueue);

module.exports = router;
