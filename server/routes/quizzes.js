const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { getQuiz, attemptQuiz, getQuizzesByCourse, getMyQuizAttempts, getAdaptiveNextQuestion } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const attemptQuizValidator = [
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionIndex')
    .isInt({ min: 0 })
    .withMessage('Question index must be a non-negative integer'),
  body('answers.*.selectedOptionIndex')
    .isInt({ min: 0 })
    .withMessage('Selected option index must be a non-negative integer'),
  validate,
];

/**
 * @route   GET /api/quizzes/course/:courseId
 * @desc    Get quiz summaries for a specific course
 * @access  Protected
 */
router.get('/course/:courseId', protect, getQuizzesByCourse);

/**
 * @route   GET /api/quizzes/:id/adaptive-next
 * @desc    Get the next question dynamically for adaptive quiz mode
 * @access  Protected
 */
router.get('/:id/adaptive-next', protect, getAdaptiveNextQuestion);

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get a single quiz (options stripped of isCorrect)
 * @access  Protected
 */
router.get('/:id', protect, getQuiz);

/**
 * @route   POST /api/quizzes/:id/attempt
 * @desc    Submit quiz answers for server-side grading
 * @access  Protected
 */
router.post('/:id/attempt', protect, attemptQuizValidator, attemptQuiz);

/**
 * @route   GET /api/quizzes/my-attempts
 * @desc    Get current user's quiz attempts
 * @access  Protected
 */
router.get('/my-attempts', protect, getMyQuizAttempts);

module.exports = router;
