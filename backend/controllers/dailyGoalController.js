const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get user's daily goal and progress
 * @route   GET /api/daily-goal
 * @access  Protected
 */
const getDailyGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('dailyGoal xp').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if we need to reset the daily goal (new day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(user.dailyGoal.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    let needsReset = false;
    let progress = user.dailyGoal.currentProgress;

    if (lastReset.getTime() < today.getTime()) {
      needsReset = true;
      progress = 0;
      
      // Update the user's last reset date
      await User.findByIdAndUpdate(userId, {
        'dailyGoal.currentProgress': 0,
        'dailyGoal.lastResetDate': new Date(),
      });
    }

    // Calculate today's actual progress based on activity logs
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    if (user.dailyGoal.goalType === 'lessons') {
      const lessonsCompleted = await ActivityLog.countDocuments({
        user: userId,
        action: 'lesson_completed',
        createdAt: { $gte: startOfDay },
      });
      progress = lessonsCompleted;
    } else {
      // Time-based goal - calculate minutes spent
      const timeLogs = await ActivityLog.find({
        user: userId,
        action: 'lesson_viewed',
        createdAt: { $gte: startOfDay },
      }).lean();

      const totalMinutes = timeLogs.reduce((sum, log) => {
        return sum + (log.extra?.duration || 0);
      }, 0);
      progress = totalMinutes;
    }

    const percentage = user.dailyGoal.goalValue > 0 
      ? Math.min(100, Math.round((progress / user.dailyGoal.goalValue) * 100))
      : 0;

    res.status(200).json({
      success: true,
      dailyGoal: {
        goalType: user.dailyGoal.goalType,
        goalValue: user.dailyGoal.goalValue,
        currentProgress: progress,
        percentage,
        completed: progress >= user.dailyGoal.goalValue,
        xp: user.xp,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user's daily goal
 * @route   PATCH /api/daily-goal
 * @access  Protected
 */
const updateDailyGoal = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { goalType, goalValue } = req.body;

    if (!goalType || !goalValue) {
      return res.status(400).json({
        success: false,
        message: 'goalType and goalValue are required',
      });
    }

    if (!['time', 'lessons'].includes(goalType)) {
      return res.status(400).json({
        success: false,
        message: 'goalType must be either "time" or "lessons"',
      });
    }

    if (goalValue < 1) {
      return res.status(400).json({
        success: false,
        message: 'goalValue must be at least 1',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        'dailyGoal.goalType': goalType,
        'dailyGoal.goalValue': goalValue,
        'dailyGoal.currentProgress': 0,
        'dailyGoal.lastResetDate': new Date(),
      },
      { new: true }
    ).select('dailyGoal');

    res.status(200).json({
      success: true,
      dailyGoal: user.dailyGoal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Award XP to user
 * @route   POST /api/daily-goal/award-xp
 * @access  Protected
 */
const awardXP = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { amount, reason } = req.body;

    if (!amount || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: amount } },
      { new: true }
    ).select('xp learningPreferences');

    const io = req.app?.get('io');
    if (io && user.learningPreferences) {
      user.learningPreferences.forEach((cat) => {
        io.to(`category:${cat}`).emit('leaderboard_updated', { category: cat });
      });
    }

    res.status(200).json({
      success: true,
      xp: user.xp,
      awarded: amount,
      reason,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyGoal,
  updateDailyGoal,
  awardXP,
};
