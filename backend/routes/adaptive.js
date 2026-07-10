const express = require('express');
const { query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getDynamicLearningPath,
  getNextRecommendedLesson,
} = require('../controllers/adaptiveLearningController');

const router = express.Router();

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];

/**
 * @route   GET /api/adaptive/learning-path
 * @desc    Get dynamic learning path - personalized course recommendations
 * @access  Protected
 */
router.get('/learning-path', protect, paginationValidator, getDynamicLearningPath);

/**
 * @route   GET /api/adaptive/next-lesson/:courseId
 * @desc    Get next recommended lesson for a course
 * @access  Protected
 */
router.get('/next-lesson/:courseId', protect, getNextRecommendedLesson);

module.exports = router;
