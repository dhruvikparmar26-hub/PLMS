const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');
const { checkAndAwardAchievements } = require('./achievementController');
const { issueCertificate } = require('./certificateController');
const { createNotification } = require('./notificationController');

/**
 * @desc    Mark a lesson as complete for the current user
 *          Adds the lesson to Enrollment.completedLessons (if not already there)
 *          and recalculates progressPercent = completedLessons / totalLessons * 100
 * @route   POST /api/lessons/:id/complete
 * @access  Protected
 */
const completeLesson = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user._id;

    // 1. Find the lesson to know its course
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const courseId = lesson.course?._id || lesson.course;

    // 2. Find the enrollment for this user + course
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this course.',
      });
    }

    // 3. Add lesson to completedLessons if not already there
    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId.toString()
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lessonId);
    }

    // 4. Count total lessons for this course and recalculate progress
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    enrollment.progressPercent =
      totalLessons > 0
        ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
        : 0;

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    // Log activity and award XP
    if (!alreadyCompleted) {
      logActivity(userId, 'lesson_completed', {
        courseId: courseId,
        lessonId: lessonId,
      });
      
      // Award XP for lesson completion (10 XP)
      await User.findByIdAndUpdate(userId, { $inc: { xp: 10 } });
      await checkAndAwardAchievements(userId);

      // Update Concept Mastery
      if (lesson.concepts && lesson.concepts.length > 0) {
        const { updateConceptMastery } = require('../utils/masteryUpdater');
        await updateConceptMastery(userId, lesson.concepts, 1.0);
      }

      // Emit socket event for real-time leaderboard update
      const io = req.app?.get('io');
      if (io && lesson.course?.category) {
        io.to(`category:${lesson.course.category}`).emit('leaderboard_updated', { category: lesson.course.category });
      }

      // Auto-issue certificate if course is now 100% complete
      if (enrollment.progressPercent === 100) {
        logActivity(userId, 'course_completed', { courseId });
        await issueCertificate(userId, courseId, enrollment._id);

        await createNotification(
          userId,
          'course_completed',
          `Congratulations! You completed the course: "${lesson.course?.title || 'Course'}"`,
          `/courses/${courseId}`
        );
      } else {
        await createNotification(
          userId,
          'lesson_completed',
          `Completed lesson: "${lesson.title}"`,
          `/lessons/${lessonId}`
        );
      }
    }

    res.status(200).json({
      success: true,
      message: alreadyCompleted
        ? 'Lesson was already completed.'
        : 'Lesson marked as complete!',
      completedLessons: enrollment.completedLessons,
      progressPercent: enrollment.progressPercent,
      totalLessons,
      xpAwarded: !alreadyCompleted ? 10 : 0,
      courseCompleted: !alreadyCompleted && enrollment.progressPercent === 100,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single lesson by ID
 * @route   GET /api/lessons/:id
 * @access  Protected
 */
const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title modules');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Log lesson viewed
    if (req.user) {
      logActivity(req.user._id, 'lesson_viewed', {
        courseId: lesson.course?._id || lesson.course,
        lessonId: lesson._id,
      });
    }

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { completeLesson, getLessonById };
