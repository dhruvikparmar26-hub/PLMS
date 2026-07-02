const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  createOrUpdateQuiz,
  getQuizForInstructor,
} = require('../controllers/instructorController');

const router = express.Router();

// Apply auth protection & role check to all routes under /api/instructor
router.use(protect);
router.use(authorize('instructor', 'admin'));

// Validation rules
const courseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ max: 200 })
    .withMessage('Course title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ max: 2000 })
    .withMessage('Course description cannot exceed 2000 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('thumbnail')
    .optional()
    .isString()
    .withMessage('Thumbnail must be a string'),
  validate,
];

const courseUpdateValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Course title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course description cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Course description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('thumbnail')
    .optional()
    .isString()
    .withMessage('Thumbnail must be a string'),
  body('modules')
    .optional()
    .isArray()
    .withMessage('Modules must be an array'),
  validate,
];

const lessonValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ max: 200 })
    .withMessage('Lesson title cannot exceed 200 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('videoUrl')
    .optional()
    .isString()
    .withMessage('Video URL must be a string'),
  body('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  validate,
];

const lessonUpdateValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Lesson title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Lesson title cannot exceed 200 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('videoUrl')
    .optional()
    .isString()
    .withMessage('Video URL must be a string'),
  body('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  validate,
];

const quizValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Quiz title is required'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Questions must be an array with at least one question'),
  body('questions.*.questionText')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  body('questions.*.options')
    .isArray({ min: 2 })
    .withMessage('Each question must have at least 2 options'),
  body('questions.*.options.*.text')
    .trim()
    .notEmpty()
    .withMessage('Option text is required'),
  body('questions.*.options.*.isCorrect')
    .optional()
    .isBoolean()
    .withMessage('isCorrect must be a boolean'),
  body('questions.*.points')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
  body('passingScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be an integer between 0 and 100'),
  validate,
];

/**
 * @route   GET /api/instructor/dashboard-stats
 * @desc    Get dashboard stats and course analytics
 * @access  Protected (Instructor/Admin)
 */
router.get('/dashboard-stats', getDashboardStats);

/**
 * @route   POST /api/instructor/courses
 * @desc    Create a new course
 * @access  Protected (Instructor/Admin)
 */
router.post('/courses', courseValidator, createCourse);

/**
 * @route   PUT /api/instructor/courses/:id
 * @desc    Update course metadata or modules
 * @access  Protected (Instructor/Admin)
 */
router.put('/courses/:id', courseUpdateValidator, updateCourse);

/**
 * @route   DELETE /api/instructor/courses/:id
 * @desc    Delete a course
 * @access  Protected (Instructor/Admin)
 */
router.delete('/courses/:id', deleteCourse);

/**
 * @route   POST /api/instructor/courses/:courseId/modules/:moduleIndex/lessons
 * @desc    Create a lesson inside a course module
 * @access  Protected (Instructor/Admin)
 */
router.post(
  '/courses/:courseId/modules/:moduleIndex/lessons',
  lessonValidator,
  createLesson
);

/**
 * @route   PUT /api/instructor/lessons/:id
 * @desc    Update a lesson
 * @access  Protected (Instructor/Admin)
 */
router.put('/lessons/:id', lessonUpdateValidator, updateLesson);

/**
 * @route   DELETE /api/instructor/lessons/:id
 * @desc    Delete a lesson
 * @access  Protected (Instructor/Admin)
 */
router.delete('/lessons/:id', deleteLesson);

/**
 * @route   POST /api/instructor/courses/:courseId/quiz
 * @desc    Create or update a quiz for a course
 * @access  Protected (Instructor/Admin)
 */
router.post('/courses/:courseId/quiz', quizValidator, createOrUpdateQuiz);

/**
 * @route   GET /api/instructor/courses/:courseId/quiz
 * @desc    Get the full quiz (including correct answers) for editing
 * @access  Protected (Instructor/Admin)
 */
router.get('/courses/:courseId/quiz', getQuizForInstructor);

/**
 * @route   GET /api/instructor/analytics
 * @desc    Get aggregated analytics (enrollment, drop-off, inactive students)
 * @access  Protected (Instructor/Admin)
 */
const { getInstructorAnalytics } = require('../controllers/instructorAnalyticsController');
router.get('/analytics', getInstructorAnalytics);

module.exports = router;
