const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getDailyGoal,
  updateDailyGoal,
  awardXP,
} = require('../controllers/dailyGoalController');

const router = express.Router();

const updateGoalValidator = [
  body('goalType')
    .isIn(['time', 'lessons'])
    .withMessage('goalType must be either "time" or "lessons"'),
  body('goalValue')
    .isInt({ min: 1 })
    .withMessage('goalValue must be a positive integer'),
  validate,
];

const awardXPValidator = [
  body('amount')
    .isInt({ min: 0 })
    .withMessage('amount must be a non-negative integer'),
  body('reason')
    .optional()
    .isString()
    .withMessage('reason must be a string'),
  validate,
];

/**
 * @route   GET /api/daily-goal
 * @desc    Get user's daily goal and progress
 * @access  Protected
 */
router.get('/', protect, getDailyGoal);

/**
 * @route   PATCH /api/daily-goal
 * @desc    Update user's daily goal
 * @access  Protected
 */
router.patch('/', protect, updateGoalValidator, updateDailyGoal);

/**
 * @route   POST /api/daily-goal/award-xp
 * @desc    Award XP to user
 * @access  Protected
 */
router.post('/award-xp', protect, awardXPValidator, awardXP);

module.exports = router;
