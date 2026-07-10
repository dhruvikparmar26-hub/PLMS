const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

/**
 * @desc    Get instructor-level analytics for their courses
 * @route   GET /api/instructor/analytics
 * @access  Protected (instructor/admin)
 */
const getInstructorAnalytics = async (req, res, next) => {
  try {
    const instructorId = req.user._id;

    // 1. Get all courses by this instructor
    const courses = await Course.find({ instructor: instructorId }).lean();
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        totalStudents: 0,
        totalCourses: 0,
        courses: [],
        dropOffData: [],
        inactiveStudents: [],
      });
    }

    // 2. Get all enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email')
      .populate('course', 'title category')
      .lean();

    // 3. Compute per-course stats
    const courseStats = [];
    for (const course of courses) {
      const courseEnrollments = enrollments.filter(
        (e) => e.course._id.toString() === course._id.toString()
      );
      const totalEnrolled = courseEnrollments.length;
      const completedCount = courseEnrollments.filter((e) => e.progressPercent === 100).length;
      const avgProgress =
        totalEnrolled > 0
          ? Math.round(courseEnrollments.reduce((sum, e) => sum + e.progressPercent, 0) / totalEnrolled)
          : 0;

      // Quiz attempts for this course
      const quizAttempts = await QuizAttempt.find({
        quiz: { $exists: true },
      })
        .populate({ path: 'quiz', match: { course: course._id }, select: 'course title' })
        .lean();

      const courseQuizAttempts = quizAttempts.filter((a) => a.quiz !== null);
      const avgQuizScore =
        courseQuizAttempts.length > 0
          ? Math.round(courseQuizAttempts.reduce((sum, a) => sum + a.score, 0) / courseQuizAttempts.length)
          : 0;

      // Total lessons for this course
      const totalLessons = await Lesson.countDocuments({ course: course._id });

      courseStats.push({
        _id: course._id,
        title: course.title,
        category: course.category,
        difficulty: course.difficulty,
        totalEnrolled,
        completedCount,
        completionRate: totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0,
        avgProgress,
        avgQuizScore,
        totalLessons,
      });
    }

    // 4. Drop-off analysis: find where students stop progressing
    const dropOffData = [];
    for (const course of courses) {
      const totalLessons = await Lesson.countDocuments({ course: course._id });
      if (totalLessons === 0) continue;

      const courseEnrollments = enrollments.filter(
        (e) => e.course._id.toString() === course._id.toString()
      );

      // Group by progress buckets: 0-25%, 25-50%, 50-75%, 75-100%
      const buckets = { '0-25': 0, '25-50': 0, '50-75': 0, '75-100': 0 };
      courseEnrollments.forEach((e) => {
        if (e.progressPercent <= 25) buckets['0-25']++;
        else if (e.progressPercent <= 50) buckets['25-50']++;
        else if (e.progressPercent <= 75) buckets['50-75']++;
        else buckets['75-100']++;
      });

      dropOffData.push({
        courseId: course._id,
        courseTitle: course.title,
        totalEnrolled: courseEnrollments.length,
        buckets,
      });
    }

    // 5. Inactive students: enrolled but no activity in last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const inactiveStudents = [];
    for (const enrollment of enrollments) {
      if (enrollment.progressPercent === 100) continue; // Skip completed

      const recentActivity = await ActivityLog.findOne({
        user: enrollment.user?._id,
        timestamp: { $gte: fourteenDaysAgo },
        'metadata.courseId': enrollment.course._id,
      }).lean();

      if (!recentActivity && enrollment.user) {
        inactiveStudents.push({
          studentName: enrollment.user.name,
          studentEmail: enrollment.user.email,
          courseName: enrollment.course.title,
          progressPercent: enrollment.progressPercent,
          lastAccessed: enrollment.lastAccessed || enrollment.updatedAt,
        });
      }
    }

    // 6. Unique student count
    const uniqueStudentIds = new Set(enrollments.map((e) => e.user?._id?.toString()).filter(Boolean));

    res.status(200).json({
      success: true,
      totalStudents: uniqueStudentIds.size,
      totalCourses: courses.length,
      courses: courseStats,
      dropOffData,
      inactiveStudents: inactiveStudents.slice(0, 50), // Cap at 50
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInstructorAnalytics };
