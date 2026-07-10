const express = require('express');
const { completeLesson, getLessonById } = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/lessons/:id
 * @desc    Get a single lesson by ID
 * @access  Protected
 */
router.get('/:id', protect, getLessonById);

/**
 * @route   POST /api/lessons/:id/complete
 * @desc    Mark a lesson as completed
 * @access  Protected
 */
router.post('/:id/complete', protect, completeLesson);

module.exports = router;
