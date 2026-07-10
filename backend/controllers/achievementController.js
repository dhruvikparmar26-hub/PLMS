const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

/**
 * Seed default achievements
 */
const seedAchievements = async () => {
  const count = await Achievement.countDocuments();
  if (count === 0) {
    await Achievement.create([
      {
        key: 'first_course_completed',
        title: 'First Steps',
        description: 'Complete your first course',
        icon: '🎯',
      },
      {
        key: 'seven_day_streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
      },
      {
        key: 'perfect_quiz_score',
        title: 'Perfectionist',
        description: 'Score 100% on a quiz',
        icon: '💯',
      },
      {
        key: 'five_courses_completed',
        title: 'Dedicated Learner',
        description: 'Complete 5 courses',
        icon: '🏆',
      },
      {
        key: 'xp_milestone_100',
        title: 'XP Initiate',
        description: 'Earn 100 XP',
        icon: '⚡',
      },
      {
        key: 'xp_milestone_500',
        title: 'XP Specialist',
        description: 'Earn 500 XP',
        icon: '⚡',
      },
      {
        key: 'xp_milestone_1000',
        title: 'XP Master',
        description: 'Earn 1000 XP',
        icon: '⚡',
      },
    ]);
  } else {
    // If achievements exist but not the new ones, insert them
    const newKeys = ['xp_milestone_100', 'xp_milestone_500', 'xp_milestone_1000'];
    for (const key of newKeys) {
      const exists = await Achievement.findOne({ key });
      if (!exists) {
        let title = 'XP Initiate';
        let desc = 'Earn 100 XP';
        if (key === 'xp_milestone_500') {
          title = 'XP Specialist';
          desc = 'Earn 500 XP';
        } else if (key === 'xp_milestone_1000') {
          title = 'XP Master';
          desc = 'Earn 1000 XP';
        }
        await Achievement.create({
          key,
          title,
          description: desc,
          icon: '⚡',
        });
      }
    }
  }
};

/**
 * Get all achievements (for reference)
 */
const getAllAchievements = async (req, res, next) => {
  try {
    await seedAchievements();
    const achievements = await Achievement.find();
    res.status(200).json({
      success: true,
      achievements,
      data: achievements, // backward compatibility
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's earned achievements
 */
const getUserAchievements = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    await seedAchievements();

    const userAchievements = await UserAchievement.find({ user: userId })
      .populate('achievement')
      .sort({ earnedAt: -1 });

    const allAchievements = await Achievement.find();

    const earnedKeys = userAchievements.map((ua) => ua.achievement.key);
    const lockedAchievements = allAchievements.filter(
      (a) => !earnedKeys.includes(a.key)
    );

    res.status(200).json({
      success: true,
      earned: userAchievements,
      locked: lockedAchievements,
      data: {
        earned: userAchievements,
        locked: lockedAchievements,
      }, // backward compatibility
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check and award achievements based on user activity
 * This should be called after relevant actions (course completion, quiz attempt, etc.)
 */
const checkAndAwardAchievements = async (userId) => {
  try {
    await seedAchievements();

    // Check for first course completed
    const completedCourses = await Enrollment.countDocuments({
      user: userId,
      progressPercent: 100,
    });

    if (completedCourses >= 1) {
      const achievement = await Achievement.findOne({
        key: 'first_course_completed',
      });
      if (achievement) {
        await UserAchievement.findOneAndUpdate(
          { user: userId, achievement: achievement._id },
          {},
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    // Check for 5 courses completed
    if (completedCourses >= 5) {
      const achievement = await Achievement.findOne({
        key: 'five_courses_completed',
      });
      if (achievement) {
        await UserAchievement.findOneAndUpdate(
          { user: userId, achievement: achievement._id },
          {},
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    // Check for perfect quiz score
    const perfectQuiz = await QuizAttempt.findOne({
      user: userId,
      score: 100,
    });
    if (perfectQuiz) {
      const achievement = await Achievement.findOne({
        key: 'perfect_quiz_score',
      });
      if (achievement) {
        await UserAchievement.findOneAndUpdate(
          { user: userId, achievement: achievement._id },
          {},
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    // Check for 7-day streak
    const activities = await ActivityLog.find({
      user: userId,
      action: { $in: ['lesson_viewed', 'lesson_completed', 'quiz_attempted'] },
    }).sort({ timestamp: 1 });

    if (activities.length > 0) {
      const activityDates = new Set();
      activities.forEach((activity) => {
        const date = new Date(activity.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        activityDates.add(dateStr);
      });

      const sortedDates = Array.from(activityDates).sort();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const hasActivityToday = activityDates.has(today);
      const hasActivityYesterday = activityDates.has(yesterday);

      if (hasActivityToday || hasActivityYesterday) {
        let streak = 1;
        let checkDate = hasActivityToday ? today : yesterday;
        let index = sortedDates.indexOf(checkDate);

        while (index > 0) {
          const currentDate = sortedDates[index];
          const prevDateStr = sortedDates[index - 1];
          const curr = new Date(currentDate);
          const prev = new Date(prevDateStr);
          const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

          if (diffDays === 1) {
            streak++;
            index--;
          } else {
            break;
          }
        }

        if (streak >= 7) {
          const achievement = await Achievement.findOne({
            key: 'seven_day_streak',
          });
          if (achievement) {
            await UserAchievement.findOneAndUpdate(
              { user: userId, achievement: achievement._id },
              {},
              { upsert: true, setDefaultsOnInsert: true }
            );
          }
        }
      }
    }

    // Check for XP achievements
    const user = await User.findById(userId).select('xp');
    if (user) {
      if (user.xp >= 100) {
        const achievement = await Achievement.findOne({ key: 'xp_milestone_100' });
        if (achievement) {
          await UserAchievement.findOneAndUpdate(
            { user: userId, achievement: achievement._id },
            {},
            { upsert: true, setDefaultsOnInsert: true }
          );
        }
      }
      if (user.xp >= 500) {
        const achievement = await Achievement.findOne({ key: 'xp_milestone_500' });
        if (achievement) {
          await UserAchievement.findOneAndUpdate(
            { user: userId, achievement: achievement._id },
            {},
            { upsert: true, setDefaultsOnInsert: true }
          );
        }
      }
      if (user.xp >= 1000) {
        const achievement = await Achievement.findOne({ key: 'xp_milestone_1000' });
        if (achievement) {
          await UserAchievement.findOneAndUpdate(
            { user: userId, achievement: achievement._id },
            {},
            { upsert: true, setDefaultsOnInsert: true }
          );
        }
      }
    }
  } catch (error) {
    console.error('Error awarding achievements:', error);
  }
};

module.exports = {
  getAllAchievements,
  getUserAchievements,
  checkAndAwardAchievements,
};
