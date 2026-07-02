const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getPaceForecast,
  getOverallPace,
} = require('../controllers/paceForecastController');

const router = express.Router();

/**
 * @route   GET /api/pace-forecast/:courseId
 * @desc    Get pace forecast for a course enrollment
 * @access  Protected
 */
router.get('/:courseId', protect, getPaceForecast);

/**
 * @route   GET /api/pace-forecast/overall
 * @desc    Get overall learning pace across all courses
 * @access  Protected
 */
router.get('/overall', protect, getOverallPace);

module.exports = router;
