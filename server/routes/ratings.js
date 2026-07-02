const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.post('/course/:courseId', protect, ratingController.submitRating);
router.get('/course/:courseId/summary', ratingController.getCourseRatings);
router.get('/course/:courseId/reviews', ratingController.getCourseReviews);

module.exports = router;
