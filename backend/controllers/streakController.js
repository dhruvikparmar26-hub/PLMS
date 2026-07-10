const ActivityLog = require('../models/ActivityLog');

/**
 * Get user's current streak and longest streak
 * Streak is computed from consecutive days with at least one lesson view, lesson completion, or quiz attempt
 */
const getUserStreak = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all relevant activity logs for the user
    const activities = await ActivityLog.find({
      user: userId,
      action: { $in: ['lesson_viewed', 'lesson_completed', 'quiz_attempted'] },
    }).sort({ timestamp: 1 });

    if (activities.length === 0) {
      return res.status(200).json({
        success: true,
        currentStreak: 0,
        longestStreak: 0,
      });
    }

    // Group activities by date (UTC date)
    const activityDates = new Set();
    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const dateStr = date.toISOString().split('T')[0];
      activityDates.add(dateStr);
    });

    // Convert to sorted array
    const sortedDates = Array.from(activityDates).sort();

    // Calculate current streak (consecutive days ending today or yesterday)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const prev = new Date(prevDate);
        const curr = new Date(currentDate);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = currentDate;
    }

    // Calculate current streak (must include today or yesterday)
    const hasActivityToday = activityDates.has(today);
    const hasActivityYesterday = activityDates.has(yesterday);

    if (!hasActivityToday && !hasActivityYesterday) {
      currentStreak = 0;
    } else {
      currentStreak = 1;
      let checkDate = hasActivityToday ? today : yesterday;
      let index = sortedDates.indexOf(checkDate);

      while (index > 0) {
        const currentDate = sortedDates[index];
        const prevDateStr = sortedDates[index - 1];
        const curr = new Date(currentDate);
        const prev = new Date(prevDateStr);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          currentStreak++;
          index--;
        } else {
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserStreak,
};
