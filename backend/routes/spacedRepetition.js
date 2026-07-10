const express = require('express');
const { body, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  recordQuestionAnswer,
  getReviewQueue,
  getSpacedRepetitionStats,
  syncQuizAttempts,
} = require('../controllers/spacedRepetitionController');

const router = express.Router();

const recordAnswerValidator = [
  body('questionId').notEmpty().withMessage('questionId is required'),
  body('quizId').notEmpty().withMessage('quizId is required'),
  body('courseId').notEmpty().withMessage('courseId is required'),
  body('isCorrect')
    .optional()
    .isBoolean()
    .withMessage('isCorrect must be a boolean'),
  body('selectedOptionId')
    .optional()
    .notEmpty()
    .withMessage('selectedOptionId must not be empty if provided'),
  validate,
];

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];

const syncValidator = [
  body('quizId').notEmpty().withMessage('quizId is required'),
  validate,
];

/**
 * @route   POST /api/spaced-repetition/record
 * @desc    Record a question answer for spaced repetition
 * @access  Protected
 */
router.post('/record', protect, recordAnswerValidator, recordQuestionAnswer);

/**
 * @route   GET /api/spaced-repetition/review-queue
 * @desc    Get review queue for spaced repetition
 * @access  Protected
 */
router.get('/review-queue', protect, paginationValidator, getReviewQueue);

/**
 * @route   GET /api/spaced-repetition/stats
 * @desc    Get spaced repetition stats for a user
 * @access  Protected
 */
router.get('/stats', protect, getSpacedRepetitionStats);

/**
 * @route   POST /api/spaced-repetition/sync-attempts
 * @desc    Sync quiz attempts to spaced repetition
 * @access  Protected
 */
router.post('/sync-attempts', protect, syncValidator, syncQuizAttempts);

module.exports = router;
