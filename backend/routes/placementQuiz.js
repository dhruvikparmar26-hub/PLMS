const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getPlacementQuiz,
  submitPlacementQuiz,
  getPlacementQuizCategories,
} = require('../controllers/placementQuizController');

const router = express.Router();

const submitPlacementQuizValidator = [
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
 * @route   GET /api/placement-quiz/categories
 * @desc    Get all available placement quiz categories
 * @access  Protected
 */
router.get('/categories', protect, getPlacementQuizCategories);

/**
 * @route   GET /api/placement-quiz/:category
 * @desc    Get placement quiz for a specific category
 * @access  Protected
 */
router.get('/:category', protect, getPlacementQuiz);

/**
 * @route   POST /api/placement-quiz/:category/submit
 * @desc    Submit placement quiz answers
 * @access  Protected
 */
router.post('/:category/submit', protect, submitPlacementQuizValidator, submitPlacementQuiz);

module.exports = router;
