const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get dashboard stats and analytics for instructor's courses
 * @route   GET /api/instructor/dashboard-stats
 * @access  Protected (Instructor/Admin only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const instructorId = req.user._id;

    // 1. Get all courses created by this instructor
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map((c) => c._id);

    // 2. Count total courses
    const totalCourses = courses.length;

    // 3. Get enrollments for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email')
      .populate('course', 'title');

    const totalStudents = enrollments.length;

    // 4. Calculate average progress percent
    const averageProgress =
      totalStudents > 0
        ? Math.round(
            enrollments.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0) /
              totalStudents
          )
        : 0;

    // 5. Get quiz stats
    const quizzes = await Quiz.find({ course: { $in: courseIds } });
    const quizIds = quizzes.map((q) => q._id);
    const quizAttempts = await QuizAttempt.find({ quiz: { $in: quizIds } });
    const totalQuizAttempts = quizAttempts.length;
    const passedAttempts = quizAttempts.filter((att) => att.passed).length;
    const quizPassRate =
      totalQuizAttempts > 0 ? Math.round((passedAttempts / totalQuizAttempts) * 100) : 0;

    // 6. Course breakdown
    const courseBreakdown = await Promise.all(
      courses.map(async (course) => {
        const courseEnrollments = enrollments.filter(
          (e) => e.course._id.toString() === course._id.toString()
        );
        const enrolledCount = courseEnrollments.length;
        const avgProg =
          enrolledCount > 0
            ? Math.round(
                courseEnrollments.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0) /
                  enrolledCount
              )
            : 0;

        const courseQuizzes = quizzes.filter(
          (q) => q.course.toString() === course._id.toString()
        );
        const courseQuizIds = courseQuizzes.map((q) => q._id);
        const courseAttempts = quizAttempts.filter((att) =>
          courseQuizIds.some((qid) => qid.toString() === att.quiz.toString())
        );
        const attemptsCount = courseAttempts.length;
        const passedCount = courseAttempts.filter((att) => att.passed).length;
        const passRate =
          attemptsCount > 0 ? Math.round((passedCount / attemptsCount) * 100) : 0;

        return {
          _id: course._id,
          title: course.title,
          category: course.category,
          difficulty: course.difficulty,
          studentsEnrolled: enrolledCount,
          averageProgress: avgProg,
          quizPassRate: passRate,
          quizAttemptsCount: attemptsCount,
        };
      })
    );

    // 7. Get recent activity log entries related to these courses
    const recentActivities = await ActivityLog.find({
      'metadata.courseId': { $in: courseIds },
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('metadata.courseId', 'title');

    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        totalStudents,
        averageProgress,
        quizPassRate,
        totalQuizAttempts,
      },
      courseBreakdown,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/instructor/courses
 * @access  Protected (Instructor/Admin only)
 */
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, thumbnail } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      difficulty,
      thumbnail,
      instructor: req.user._id,
      modules: [],
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing course (metadata + modules titles)
 * @route   PUT /api/instructor/courses/:id
 * @access  Protected (Instructor/Admin only)
 */
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    const { title, description, category, difficulty, thumbnail, modules } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (difficulty) course.difficulty = difficulty;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (modules) course.modules = modules;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a course (with lessons, quizzes, attempts, enrollments cleanup)
 * @route   DELETE /api/instructor/courses/:id
 * @access  Protected (Instructor/Admin only)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    const courseId = course._id;

    // 1. Delete all lessons for this course
    await Lesson.deleteMany({ course: courseId });

    // 2. Find all quizzes for this course to delete attempts
    const quizzes = await Quiz.find({ course: courseId });
    const quizIds = quizzes.map((q) => q._id);
    await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
    await Quiz.deleteMany({ course: courseId });

    // 3. Delete enrollments
    await Enrollment.deleteMany({ course: courseId });

    // 4. Delete the course itself
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: 'Course and all associated content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a lesson inside a specific course module
 * @route   POST /api/instructor/courses/:courseId/modules/:moduleIndex/lessons
 * @access  Protected (Instructor/Admin only)
 */
const createLesson = async (req, res, next) => {
  try {
    const { courseId, moduleIndex } = req.params;
    const { title, content, videoUrl, resources, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this course',
      });
    }

    const idx = parseInt(moduleIndex);
    if (isNaN(idx) || idx < 0 || idx >= course.modules.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module index',
      });
    }

    // Create lesson document
    const lesson = await Lesson.create({
      title,
      content,
      videoUrl,
      resources: resources || [],
      order: order !== undefined ? order : course.modules[idx].lessons.length,
      course: courseId,
    });

    // Add to course module
    course.modules[idx].lessons.push(lesson._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a lesson
 * @route   PUT /api/instructor/lessons/:id
 * @access  Protected (Instructor/Admin only)
 */
const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Verify course ownership
    const course = await Course.findById(lesson.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found',
      });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this lesson',
      });
    }

    const { title, content, videoUrl, resources, order } = req.body;

    if (title) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (resources) lesson.resources = resources;
    if (order !== undefined) lesson.order = order;

    await lesson.save();

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      lesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/instructor/lessons/:id
 * @access  Protected (Instructor/Admin only)
 */
const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    // Verify course ownership
    const course = await Course.findById(lesson.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found',
      });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson',
      });
    }

    const lessonId = lesson._id;

    // Remove from Lesson database
    await Lesson.findByIdAndDelete(lessonId);

    // Remove from Course modules lessons list
    let courseSaved = false;
    for (let i = 0; i < course.modules.length; i++) {
      const lessonIdx = course.modules[i].lessons.indexOf(lessonId);
      if (lessonIdx > -1) {
        course.modules[i].lessons.splice(lessonIdx, 1);
        courseSaved = true;
      }
    }

    if (courseSaved) {
      await course.save();
    }

    // Pull from any Enrollment completedLessons arrays
    await Enrollment.updateMany(
      { course: course._id },
      { $pull: { completedLessons: lessonId } }
    );

    // Recalculate progress percents for all enrollments in this course
    const enrollments = await Enrollment.find({ course: course._id });
    const totalLessonsCount = await Lesson.countDocuments({ course: course._id });

    for (const enroll of enrollments) {
      const newProgress =
        totalLessonsCount > 0
          ? Math.round((enroll.completedLessons.length / totalLessonsCount) * 100)
          : 0;
      enroll.progressPercent = newProgress;
      await enroll.save();
    }

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update a quiz for a course
 * @route   POST /api/instructor/courses/:courseId/quiz
 * @access  Protected (Instructor/Admin only)
 */
const createOrUpdateQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, questions, passingScore } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify course ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this course',
      });
    }

    if (!title || !questions || !Array.isArray(questions) || passingScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, questions array, and passingScore',
      });
    }

    // Try to find if a quiz already exists for this course
    let quiz = await Quiz.findOne({ course: courseId });

    if (quiz) {
      // Update
      quiz.title = title;
      quiz.questions = questions;
      quiz.passingScore = passingScore;
      await quiz.save();
    } else {
      // Create
      quiz = await Quiz.create({
        course: courseId,
        title,
        questions,
        passingScore,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz saved successfully',
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quiz for instructor (including correct answers)
 * @route   GET /api/instructor/courses/:courseId/quiz
 * @access  Protected (Instructor/Admin only)
 */
const getQuizForInstructor = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this course\'s quiz setup',
      });
    }

    const quiz = await Quiz.findOne({ course: courseId });
    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  createOrUpdateQuiz,
  getQuizForInstructor,
};
