const express = require('express');
const { query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  exportCalendar,
  getCalendarEvents,
} = require('../controllers/calendarController');

const router = express.Router();

const calendarQueryValidator = [
  query('courseId').optional().isMongoId().withMessage('Invalid courseId'),
  query('daysAhead').optional().isInt({ min: 1, max: 30 }).withMessage('daysAhead must be between 1 and 30'),
  validate,
];

/**
 * @route   GET /api/calendar/export
 * @desc    Generate .ics file for study reminders
 * @access  Protected
 */
router.get('/export', protect, calendarQueryValidator, exportCalendar);

/**
 * @route   GET /api/calendar/events
 * @desc    Get calendar events as JSON (for preview)
 * @access  Protected
 */
router.get('/events', protect, calendarQueryValidator, getCalendarEvents);

module.exports = router;
