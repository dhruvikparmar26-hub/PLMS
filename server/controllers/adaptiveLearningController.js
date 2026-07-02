const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get dynamic learning path - personalized course recommendations based on performance
 * @route   GET /api/adaptive/learning-path
 * @access  Protected
 */
const getDynamicLearningPath = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    // Get user's enrollments to see what they're already taking
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title category difficulty modules')
      .lean();

    const enrolledCourseIds = enrollments.map((e) => e.course._id.toString());

    // Get user's quiz attempts to assess performance
    const quizAttempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'course')
      .sort({ attemptedAt: -1 })
      .lean();

    // Calculate average quiz score per category
    const categoryPerformance = {};
    quizAttempts.forEach((attempt) => {
      const course = attempt.quiz.course;
      if (course && course.category) {
        if (!categoryPerformance[course.category]) {
          categoryPerformance[course.category] = { total: 0, count: 0 };
        }
        categoryPerformance[course.category].total += attempt.score;
        categoryPerformance[course.category].count += 1;
      }
    });

    // Calculate average scores
    Object.keys(categoryPerformance).forEach((cat) => {
      categoryPerformance[cat].average = categoryPerformance[cat].total / categoryPerformance[cat].count;
    });

    // Get user's skill estimates from placement quiz
    const userSkillEstimates = req.user.categorySkillEstimates;

    // Get user's learning preferences
    const preferences = req.user.learningPreferences || [];

    // Get all courses not enrolled in
    const courses = await Course.find({
      _id: { $nin: enrolledCourseIds },
      category: preferences.length > 0 ? { $in: preferences } : { $exists: true },
    })
      .select('title category difficulty description modules thumbnail')
      .lean();

    // Score each course based on multiple factors
    const scoredCourses = courses.map((course) => {
      let score = 0;

      // Factor 1: Category preference match (30 points)
      if (preferences.includes(course.category)) {
        score += 30;
      }

      // Factor 2: Skill level match (25 points)
      const userSkillForCategory = userSkillEstimates && typeof userSkillEstimates.get === 'function'
        ? userSkillEstimates.get(course.category)
        : (userSkillEstimates ? userSkillEstimates[course.category] : null);

      if (userSkillForCategory) {
        const skillMatch = userSkillForCategory.level === course.difficulty ? 25 : 
                          userSkillForCategory.level === 'intermediate' && course.difficulty === 'beginner' ? 15 :
                          userSkillForCategory.level === 'advanced' && course.difficulty === 'intermediate' ? 15 : 5;
        score += skillMatch;
      } else {
        // Fallback to overall skill level
        const overallMatch = req.user.skillLevel === course.difficulty ? 25 : 
                            req.user.skillLevel === 'intermediate' && course.difficulty === 'beginner' ? 15 :
                            req.user.skillLevel === 'advanced' && course.difficulty === 'intermediate' ? 15 : 5;
        score += overallMatch;
      }

      // Factor 3: Performance in category (25 points)
      if (categoryPerformance[course.category]) {
        const avgScore = categoryPerformance[course.category].average;
        if (avgScore >= 80) {
          score += 25; // Strong performer - recommend harder content
        } else if (avgScore >= 60) {
          score += 15; // Good performer
        } else if (avgScore >= 40) {
          score += 5; // Struggling - recommend easier content
        }
      }

      // Factor 4: Course difficulty progression (20 points)
      // If user has been doing well, recommend slightly harder courses
      if (categoryPerformance[course.category] && categoryPerformance[course.category].average >= 70) {
        if (course.difficulty === 'advanced') score += 20;
        else if (course.difficulty === 'intermediate') score += 15;
      } else if (categoryPerformance[course.category] && categoryPerformance[course.category].average < 50) {
        // Struggling - recommend easier courses
        if (course.difficulty === 'beginner') score += 20;
        else if (course.difficulty === 'intermediate') score += 10;
      } else {
        // No performance data or average - give moderate boost to intermediate
        if (course.difficulty === 'intermediate') score += 15;
      }

      return {
        ...course,
        recommendationScore: score,
        reasons: getRecommendationReasons(score, course, userSkillForCategory, categoryPerformance[course.category]),
      };
    });

    // Sort by recommendation score (descending)
    scoredCourses.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCourses = scoredCourses.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      courses: paginatedCourses,
      page: parseInt(page),
      limit: parseInt(limit),
      total: scoredCourses.length,
      totalPages: Math.ceil(scoredCourses.length / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get next recommended lesson for a course based on user's progress
 * @route   GET /api/adaptive/next-lesson/:courseId
 * @access  Protected
 */
const getNextRecommendedLesson = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId })
      .populate('course', 'modules')
      .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    const course = enrollment.course;
    const completedLessons = enrollment.completedLessons || [];

    // Find the first incomplete lesson
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!completedLessons.includes(lesson._id.toString())) {
          // Check if user has struggled with similar lessons (quiz performance)
          const lessonPerformance = await getLessonPerformance(userId, lesson._id);
          
          return res.status(200).json({
            success: true,
            lesson: {
              ...lesson,
              module: module.title,
              recommended: true,
              reason: lessonPerformance.score < 50 ? 'Review recommended based on quiz performance' : 'Continue learning',
            },
          });
        }
      }
    }

    // All lessons completed
    res.status(200).json({
      success: true,
      lesson: null,
      message: 'All lessons completed',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get recommendation reasons
 */
function getRecommendationReasons(score, course, skillEstimate, categoryPerf) {
  const reasons = [];
  
  if (score >= 80) {
    reasons.push('Highly recommended based on your preferences and performance');
  } else if (score >= 60) {
    reasons.push('Good match for your learning path');
  }

  if (skillEstimate && skillEstimate.level === course.difficulty) {
    reasons.push(`Matches your assessed ${skillEstimate.level} level in ${course.category}`);
  }

  if (categoryPerf && categoryPerf.average >= 70) {
    reasons.push(`Strong performance in ${course.category} (${categoryPerf.average.toFixed(0)}% avg)`);
  }

  return reasons;
}

/**
 * Helper function to get lesson performance
 */
async function getLessonPerformance(userId, lessonId) {
  // This would need to be implemented based on your quiz-lesson mapping
  // For now, return a default
  return { score: 100 };
}

module.exports = {
  getDynamicLearningPath,
  getNextRecommendedLesson,
};
