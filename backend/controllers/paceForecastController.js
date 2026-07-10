const Enrollment = require('../models/Enrollment');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get pace forecast for a course enrollment
 * @route   GET /api/pace-forecast/:courseId
 * @access  Protected
 */
const getPaceForecast = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })
      .populate('course', 'modules')
      .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    const course = enrollment.course;
    const completedLessons = enrollment.completedLessons || [];
    const progressPercent = enrollment.progressPercent || 0;

    // Calculate total lessons
    const totalLessons = course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
    const remainingLessons = totalLessons - completedLessons.length;

    if (remainingLessons <= 0 || progressPercent >= 100) {
      return res.status(200).json({
        success: true,
        forecast: {
          estimatedCompletionDate: null,
          estimatedDaysRemaining: 0,
          averageLessonsPerDay: 0,
          pace: 'completed',
        },
      });
    }

    // Get user's activity logs for this course to calculate pace
    const activityLogs = await ActivityLog.find({
      user: userId,
      action: 'lesson_completed',
      'metadata.courseId': courseId,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    if (activityLogs.length < 2) {
      // Not enough data - use default pace
      const defaultPace = 1; // 1 lesson per day
      const estimatedDays = Math.ceil(remainingLessons / defaultPace);
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

      return res.status(200).json({
        success: true,
        forecast: {
          estimatedCompletionDate: estimatedDate,
          estimatedDaysRemaining: estimatedDays,
          averageLessonsPerDay: defaultPace,
          pace: 'default',
          confidence: 'low',
        },
      });
    }

    // Calculate pace based on recent activity
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Lessons completed in last 7 days
    const recentLessons = activityLogs.filter((log) => new Date(log.createdAt) >= sevenDaysAgo);
    const lessonsLast7Days = recentLessons.length;

    // Lessons completed in last 30 days
    const monthlyLessons = activityLogs.filter((log) => new Date(log.createdAt) >= thirtyDaysAgo);
    const lessonsLast30Days = monthlyLessons.length;

    // Calculate average pace (lessons per day)
    let averagePace;
    let confidence;

    if (lessonsLast7Days >= 3) {
      // Use recent pace if enough data
      averagePace = lessonsLast7Days / 7;
      confidence = 'high';
    } else if (lessonsLast30Days >= 5) {
      // Use monthly pace
      averagePace = lessonsLast30Days / 30;
      confidence = 'medium';
    } else {
      // Not enough data - use default
      averagePace = 1;
      confidence = 'low';
    }

    // Calculate estimated completion
    const estimatedDays = Math.ceil(remainingLessons / averagePace);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

    // Determine pace category
    let paceCategory;
    if (averagePace >= 2) paceCategory = 'fast';
    else if (averagePace >= 1) paceCategory = 'moderate';
    else paceCategory = 'slow';

    res.status(200).json({
      success: true,
      forecast: {
        estimatedCompletionDate: estimatedDate,
        estimatedDaysRemaining: estimatedDays,
        averageLessonsPerDay: parseFloat(averagePace.toFixed(2)),
        lessonsLast7Days,
        lessonsLast30Days,
        remainingLessons,
        totalLessons,
        pace: paceCategory,
        confidence,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get overall learning pace across all courses
 * @route   GET /api/pace-forecast/overall
 * @access  Protected
 */
const getOverallPace = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get recent activity across all courses
    const activityLogs = await ActivityLog.find({
      user: userId,
      action: 'lesson_completed',
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    if (activityLogs.length === 0) {
      return res.status(200).json({
        success: true,
        overallPace: {
          averageLessonsPerDay: 0,
          totalLessonsCompleted: 0,
          activeCourses: 0,
          pace: 'inactive',
        },
      });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const lessonsLast7Days = activityLogs.filter((log) => new Date(log.createdAt) >= sevenDaysAgo).length;
    const lessonsLast30Days = activityLogs.filter((log) => new Date(log.createdAt) >= thirtyDaysAgo).length;

    // Get active courses (enrolled with progress > 0 and < 100)
    const activeEnrollments = await Enrollment.countDocuments({
      user: userId,
      progressPercent: { $gt: 0, $lt: 100 },
    });

    let averagePace;
    let paceCategory;

    if (lessonsLast7Days >= 3) {
      averagePace = lessonsLast7Days / 7;
    } else if (lessonsLast30Days >= 5) {
      averagePace = lessonsLast30Days / 30;
    } else {
      averagePace = lessonsLast30Days / 30 || 0;
    }

    if (averagePace >= 2) paceCategory = 'fast';
    else if (averagePace >= 1) paceCategory = 'moderate';
    else if (averagePace >= 0.5) paceCategory = 'slow';
    else paceCategory = 'inactive';

    res.status(200).json({
      success: true,
      overallPace: {
        averageLessonsPerDay: parseFloat(averagePace.toFixed(2)),
        totalLessonsCompleted: activityLogs.length,
        lessonsLast7Days,
        lessonsLast30Days,
        activeCourses: activeEnrollments,
        pace: paceCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaceForecast,
  getOverallPace,
};
