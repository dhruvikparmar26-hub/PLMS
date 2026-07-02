const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

/**
 * Helper function to award XP to a user
 */
const awardXP = async (userId, amount, reason) => {
  await User.findByIdAndUpdate(userId, { $inc: { xp: amount } });
};

/**
 * @desc    Get current user's enrollments with course details and progress
 * @route   GET /api/enrollments/me
 * @access  Protected
 */
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' },
      })
      .sort({ lastAccessed: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get review queue - lessons tied to quizzes with scores below passing threshold
 * @route   GET /api/enrollments/review-queue
 * @access  Protected
 */
const getReviewQueue = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get quiz attempts with scores below passing threshold (assuming 70% is passing)
    const failedAttempts = await QuizAttempt.find({
      user: userId,
      passed: false,
    })
      .populate('quiz')
      .sort({ attemptedAt: -1 });

    const reviewItems = [];

    for (const attempt of failedAttempts) {
      const quiz = await Quiz.findById(attempt.quiz._id).populate('lesson');
      if (quiz && quiz.lesson) {
        const lesson = await Lesson.findById(quiz.lesson._id).populate('course');
        if (lesson) {
          reviewItems.push({
            _id: attempt._id,
            lessonId: lesson._id,
            lessonTitle: lesson.title,
            courseId: lesson.course._id,
            courseTitle: lesson.course.title,
            score: attempt.score,
            attemptedAt: attempt.attemptedAt,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: reviewItems,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyEnrollments, getReviewQueue };
