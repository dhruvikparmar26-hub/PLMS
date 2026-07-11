const ActivityLog = require('../models/ActivityLog');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');

/**
 * Get analytics data for the logged-in user
 */
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Time spent per week (last 8 weeks)
    const weeklyTimeSpent = await getTimeSpentPerWeek(userId);

    // Completion rate by category
    const completionByCategory = await getCompletionRateByCategory(userId);

    // Quiz score trend (last 10 attempts)
    const quizScoreTrend = await getQuizScoreTrend(userId);

    res.json({
      success: true,
      data: {
        weeklyTimeSpent,
        completionByCategory,
        quizScoreTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

/**
 * Get time spent per week (in minutes)
 */
const getTimeSpentPerWeek = async (userId) => {
  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000);

  const activities = await ActivityLog.find({
    user: userId,
    timestamp: { $gte: eightWeeksAgo },
  });

  const weeklyData = {};

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = 0;
    }

    if (activity.metadata?.timeSpent) {
      weeklyData[weekKey] += activity.metadata.timeSpent;
    }
  });

  // Convert to array and sort by date
  const result = Object.entries(weeklyData)
    .map(([week, seconds]) => ({
      week,
      minutes: Math.round(seconds / 60),
    }))
    .sort((a, b) => new Date(a.week) - new Date(b.week));

  return result;
};

/**
 * Get completion rate by category
 */
const getCompletionRateByCategory = async (userId) => {
  const enrollments = await Enrollment.find({ user: userId }).populate('course');

  const categoryData = {};

  enrollments.forEach((enrollment) => {
    if (!enrollment.course) return;
    const category = enrollment.course.category || 'General';
    if (!categoryData[category]) {
      categoryData[category] = {
        total: 0,
        completed: 0,
      };
    }
    categoryData[category].total++;
    if (enrollment.progressPercent === 100) {
      categoryData[category].completed++;
    }
  });

  const result = Object.entries(categoryData).map(([category, data]) => ({
    category,
    rate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
    completed: data.completed,
    total: data.total,
  }));

  return result;
};

/**
 * Get quiz score trend (last 10 attempts)
 */
const getQuizScoreTrend = async (userId) => {
  const attempts = await QuizAttempt.find({ user: userId })
    .populate('quiz')
    .sort({ attemptedAt: -1 })
    .limit(10);

  const result = attempts
    .reverse()
    .map((attempt, index) => ({
      attempt: index + 1,
      score: attempt.score,
      date: attempt.attemptedAt ? attempt.attemptedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      quizTitle: attempt.quiz ? attempt.quiz.title : 'Quiz Assessment',
    }));

  return result;
};

/**
 * Helper function to get week start (Monday)
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};
