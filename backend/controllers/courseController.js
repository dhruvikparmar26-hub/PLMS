const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const ActivityLog = require('../models/ActivityLog');
const logActivity = require('../utils/activityLogger');

/**
 * @desc    Get recommended courses for the current user
 *          v1: courses where category matches user.learningPreferences
 *          and the user isn't already enrolled
 * @route   GET /api/courses/recommended
 * @access  Protected
 */
const getRecommendedCourses = async (req, res, next) => {
  try {
    const user = req.user;

    // Get IDs of courses the user is already enrolled in
    const enrollments = await Enrollment.find({ user: user._id }).select('course');
    const enrolledCourseIds = enrollments.map((e) => e.course);

    // Build filter: category in learningPreferences AND not already enrolled
    const filter = {
      _id: { $nin: enrolledCourseIds },
    };

    // Only filter by preferences if the user has set some
    if (user.learningPreferences && user.learningPreferences.length > 0) {
      filter.category = { $in: user.learningPreferences };
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recommendation v2 — weighted by recent activity, not just preferences
 *          Combines learningPreferences with ActivityLog data.
 *          - Onboarding preferences: +2 per category
 *          - lesson_viewed / lesson_completed: +1 to that course's category
 *          - quiz passed: +1 to that course's category
 *          - quiz FAILED: +4 to that course's category (boost remediation)
 *          Deprioritizes categories that have zero activity in recent logs.
 * @route   GET /api/courses/recommended/v2
 * @access  Protected
 */
const getRecommendedCoursesV2 = async (req, res, next) => {
  try {
    const user = req.user;

    // 1. Get IDs of courses the user is already enrolled in
    const enrollments = await Enrollment.find({ user: user._id }).select('course');
    const enrolledCourseIds = enrollments.map((e) => e.course);

    // 2. Build base category weights from onboarding preferences
    const categoryWeights = {};
    if (user.learningPreferences && user.learningPreferences.length > 0) {
      user.learningPreferences.forEach((cat) => {
        categoryWeights[cat] = (categoryWeights[cat] || 0) + 2;
      });
    }

    // 3. Fetch recent activity logs (last 30 entries)
    const recentLogs = await ActivityLog.find({ user: user._id })
      .sort({ timestamp: -1 })
      .limit(30)
      .populate({
        path: 'metadata.courseId',
        select: 'category',
      });

    // 4. Weight categories from activity
    for (const log of recentLogs) {
      const courseCategory = log.metadata?.courseId?.category;
      if (!courseCategory) continue;

      switch (log.action) {
        case 'lesson_viewed':
        case 'lesson_completed':
        case 'course_enrolled':
          categoryWeights[courseCategory] = (categoryWeights[courseCategory] || 0) + 1;
          break;
        case 'quiz_attempted':
          if (log.metadata?.extra?.passed) {
            categoryWeights[courseCategory] = (categoryWeights[courseCategory] || 0) + 1;
          } else {
            // Failed quiz — boost this category heavily for remediation
            categoryWeights[courseCategory] = (categoryWeights[courseCategory] || 0) + 4;
          }
          break;
        default:
          break;
      }
    }

    // 5. Get all unenrolled courses
    const unenrolledCourses = await Course.find({
      _id: { $nin: enrolledCourseIds },
    })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    // 6. Score each course by its category weight, then sort descending
    const scoredCourses = unenrolledCourses.map((course) => ({
      ...course.toObject(),
      _score: categoryWeights[course.category] || 0,
    }));

    scoredCourses.sort((a, b) => b._score - a._score);

    // 7. Take top 10
    const topCourses = scoredCourses.slice(0, 10);

    res.status(200).json({
      success: true,
      count: topCourses.length,
      courses: topCourses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all courses (with optional search/filter)
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = async (req, res, next) => {
  try {
    const { search, category, difficulty, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single course by ID with populated lessons sorted by order
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('modules.lessons');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Sort lessons within each module by their order field
    if (course.modules && course.modules.length > 0) {
      course.modules.forEach((mod) => {
        if (mod.lessons && mod.lessons.length > 0) {
          mod.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      });
    }

    // Count total lessons for this course
    const totalLessons = await Lesson.countDocuments({ course: course._id });

    res.status(200).json({
      success: true,
      course,
      totalLessons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enroll the current user in a course
 * @route   POST /api/courses/:id/enroll
 * @access  Protected
 */
const enrollInCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course.',
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      completedLessons: [],
      progressPercent: 0,
    });

    // Push course into User.enrolledCourses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    // Log activity
    logActivity(userId, 'course_enrolled', {
      courseId: courseId,
    });

    // Create enrollment notification
    const { createNotification } = require('./notificationController');
    await createNotification(
      userId,
      'enrollment',
      `You enrolled in the course: "${course.title}"`,
      `/courses/${course._id}`
    );

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled!',
      enrollment,
    });
  } catch (error) {
    // Handle duplicate key error from compound unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course.',
      });
    }
    next(error);
  }
};

module.exports = { getRecommendedCourses, getRecommendedCoursesV2, getCourses, getCourseById, enrollInCourse };
