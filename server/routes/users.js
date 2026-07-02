const express = require('express');
const { body } = require('express-validator');
const { updatePreferences } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { getAccessibility, updateAccessibility } = require('../controllers/accessibilityController');

const router = express.Router();

/**
 * @route   PATCH /api/users/me/preferences
 * @desc    Update current user's learning preferences
 * @access  Protected
 */
router.patch(
  '/me/preferences',
  protect,
  [
    body('learningPreferences')
      .optional()
      .isArray()
      .withMessage('learningPreferences must be an array'),
    body('skillLevel')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('skillLevel must be beginner, intermediate, or advanced'),
  ],
  updatePreferences
);

/**
 * @route   GET /api/users/accessibility
 * @route   PATCH /api/users/accessibility
 * @access  Protected
 */
router.route('/accessibility')
  .get(protect, getAccessibility)
  .patch(protect, updateAccessibility);

module.exports = router;

