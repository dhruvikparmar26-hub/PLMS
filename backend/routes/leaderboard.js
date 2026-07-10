const express = require('express');
const { body, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getCategoryLeaderboard,
  toggleLeaderboardOptIn,
  getMyLeaderboardStats,
} = require('../controllers/leaderboardController');

const router = express.Router();

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];

const optInValidator = [
  body('optIn').isBoolean().withMessage('optIn must be a boolean'),
  validate,
];

/**
 * @route   GET /api/leaderboard/:category
 * @desc    Get weekly leaderboard for a specific category
 * @access  Protected
 */
router.get('/:category', protect, paginationValidator, getCategoryLeaderboard);

/**
 * @route   PATCH /api/leaderboard/opt-in
 * @desc    Opt in or out of leaderboard
 * @access  Protected
 */
router.patch('/opt-in', protect, optInValidator, toggleLeaderboardOptIn);

/**
 * @route   GET /api/leaderboard/my-stats
 * @desc    Get user's leaderboard stats
 * @access  Protected
 */
router.get('/my-stats', protect, getMyLeaderboardStats);

module.exports = router;
