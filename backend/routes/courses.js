const express = require('express');
const { getRecommendedCourses, getRecommendedCoursesV2, getCourses, getCourseById, enrollInCourse } = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/courses/recommended
 * @desc    Get personalized course recommendations (v1)
 * @access  Protected
 */
router.get('/recommended', protect, getRecommendedCourses);

/**
 * @route   GET /api/courses/recommended/v2
 * @desc    Get personalized course recommendations (v2 - weighted by activity)
 * @access  Protected
 */
router.get('/recommended/v2', protect, getRecommendedCoursesV2);

/**
 * @route   GET /api/courses
 * @desc    Get all courses (search, filter, paginate)
 * @access  Public
 */
router.get('/', getCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get a single course by ID
 * @access  Public
 */
router.get('/:id', getCourseById);

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll the current user in a course
 * @access  Protected
 */
router.post('/:id/enroll', protect, enrollInCourse);

module.exports = router;
