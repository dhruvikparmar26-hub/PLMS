const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * @desc    Get weekly leaderboard for a specific category
 * @route   GET /api/leaderboard/:category
 * @access  Protected
 */
const getCategoryLeaderboard = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    // Check if user has opted in to leaderboard
    const user = await User.findById(userId).select('leaderboardOptIn xp');
    if (!user.leaderboardOptIn) {
      return res.status(403).json({
        success: false,
        message: 'You must opt in to the leaderboard to view it.',
      });
    }

    // Calculate the start of the current week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get all users who have opted in and have learning preferences matching the category
    const optedInUsers = await User.find({
      leaderboardOptIn: true,
      learningPreferences: category,
    })
      .select('_id name xp')
      .lean();

    const userIds = optedInUsers.map((u) => u._id);

    // Get enrollments for these users in courses of this category
    const enrollments = await Enrollment.find({
      user: { $in: userIds },
    })
      .populate('course', 'category')
      .lean();

    // Filter enrollments by category and calculate weekly XP
    const categoryEnrollments = enrollments.filter((e) => e.course.category === category);

    // Calculate XP earned this week (simplified - using total XP as proxy)
    // In a real implementation, you'd track weekly XP separately
    const userWeeklyXP = {};
    categoryEnrollments.forEach((enrollment) => {
      const uid = enrollment.user.toString();
      if (!userWeeklyXP[uid]) {
        userWeeklyXP[uid] = 0;
      }
      // Award XP based on progress (10 XP per lesson completed)
      userWeeklyXP[uid] += Math.floor(enrollment.progressPercent / 10);
    });

    // Build leaderboard
    const leaderboard = optedInUsers
      .map((u) => ({
        _id: u._id,
        name: u.name,
        weeklyXP: userWeeklyXP[u._id.toString()] || 0,
        totalXP: u.xp || 0,
      }))
      .sort((a, b) => b.weeklyXP - a.weeklyXP);

    // Add rank
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Find current user's rank
    const currentUserIndex = leaderboard.findIndex((entry) => entry._id.toString() === userId);
    const currentUserRank = currentUserIndex >= 0 ? leaderboard[currentUserIndex].rank : null;

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedLeaderboard = leaderboard.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      leaderboard: paginatedLeaderboard,
      currentUserRank,
      page: parseInt(page),
      limit: parseInt(limit),
      total: leaderboard.length,
      totalPages: Math.ceil(leaderboard.length / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Opt in or out of leaderboard
 * @route   PATCH /api/leaderboard/opt-in
 * @access  Protected
 */
const toggleLeaderboardOptIn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { optIn } = req.body;

    if (typeof optIn !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'optIn must be a boolean value',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { leaderboardOptIn: optIn },
      { new: true }
    ).select('leaderboardOptIn learningPreferences');

    const io = req.app?.get('io');
    if (io && user.learningPreferences) {
      user.learningPreferences.forEach((cat) => {
        io.to(`category:${cat}`).emit('leaderboard_updated', { category: cat });
      });
    }

    res.status(200).json({
      success: true,
      leaderboardOptIn: user.leaderboardOptIn,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's leaderboard stats
 * @route   GET /api/leaderboard/my-stats
 * @access  Protected
 */
const getMyLeaderboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('leaderboardOptIn xp learningPreferences');

    if (!user.leaderboardOptIn) {
      return res.status(200).json({
        success: true,
        optedIn: false,
        stats: null,
      });
    }

    // Get user's enrollments
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'category')
      .lean();

    // Calculate stats per category
    const categoryStats = {};
    enrollments.forEach((enrollment) => {
      const category = enrollment.course.category;
      if (!categoryStats[category]) {
        categoryStats[category] = {
          totalXP: 0,
          coursesCompleted: 0,
          totalProgress: 0,
        };
      }
      categoryStats[category].totalXP += Math.floor(enrollment.progressPercent / 10);
      categoryStats[category].totalProgress += enrollment.progressPercent;
      if (enrollment.progressPercent === 100) {
        categoryStats[category].coursesCompleted += 1;
      }
    });

    res.status(200).json({
      success: true,
      optedIn: true,
      stats: {
        totalXP: user.xp,
        categoryStats,
        learningPreferences: user.learningPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategoryLeaderboard,
  toggleLeaderboardOptIn,
  getMyLeaderboardStats,
};
