const User = require('../models/User');

/**
 * @desc    Get or set accessibility preferences for the current user
 * @route   GET /api/users/accessibility
 * @access  Protected
 */
const getAccessibility = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('accessibility').lean();

    res.status(200).json({
      success: true,
      accessibility: user.accessibility || {
        fontSize: 'medium',
        highContrast: false,
        dyslexicFont: false,
        reduceMotion: false,
        playbackSpeed: 1.0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update accessibility preferences
 * @route   PATCH /api/users/accessibility
 * @access  Protected
 * @body    { fontSize, highContrast, dyslexicFont, reduceMotion, playbackSpeed }
 */
const updateAccessibility = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fontSize, highContrast, dyslexicFont, reduceMotion, playbackSpeed } = req.body;

    const accessibilityUpdate = {};
    if (fontSize !== undefined) accessibilityUpdate['accessibility.fontSize'] = fontSize;
    if (highContrast !== undefined) accessibilityUpdate['accessibility.highContrast'] = highContrast;
    if (dyslexicFont !== undefined) accessibilityUpdate['accessibility.dyslexicFont'] = dyslexicFont;
    if (reduceMotion !== undefined) accessibilityUpdate['accessibility.reduceMotion'] = reduceMotion;
    if (playbackSpeed !== undefined) accessibilityUpdate['accessibility.playbackSpeed'] = playbackSpeed;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: accessibilityUpdate },
      { new: true }
    ).select('accessibility');

    res.status(200).json({ success: true, accessibility: user.accessibility });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAccessibility, updateAccessibility };
