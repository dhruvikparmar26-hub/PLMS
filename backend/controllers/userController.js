const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * @desc    Update current user's learning preferences
 * @route   PATCH /api/users/me/preferences
 * @access  Protected
 */
const updatePreferences = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { learningPreferences, skillLevel } = req.body;

    const updateData = {};
    if (learningPreferences) updateData.learningPreferences = learningPreferences;
    if (skillLevel) updateData.skillLevel = skillLevel;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updatePreferences };
