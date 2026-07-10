const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * Submit rating and review for a completed course
 */
exports.submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    if (enrollment.progressPercent < 100) {
      return res.status(400).json({
        success: false,
        message: 'You can only rate a course after completing it',
      });
    }

    enrollment.rating = rating;
    enrollment.review = review || '';
    await enrollment.save();

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message,
    });
  }
};

/**
 * Get course ratings (average rating and review count)
 */
exports.getCourseRatings = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({
      course: courseId,
      rating: { $exists: true, $ne: null },
    });

    if (enrollments.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          reviewCount: 0,
        },
      });
    }

    const totalRating = enrollments.reduce((sum, e) => sum + e.rating, 0);
    const averageRating = totalRating / enrollments.length;

    res.json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: enrollments.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course ratings',
      error: error.message,
    });
  }
};

/**
 * Get course reviews with user info
 */
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({
      course: courseId,
      rating: { $exists: true, $ne: null },
    })
      .populate('user', 'name')
      .sort({ updatedAt: -1 });

    const reviews = enrollments.map((e) => ({
      user: e.user.name,
      rating: e.rating,
      review: e.review,
      date: e.updatedAt,
    }));

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course reviews',
      error: error.message,
    });
  }
};
