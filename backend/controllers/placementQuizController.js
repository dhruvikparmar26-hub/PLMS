const PlacementQuiz = require('../models/PlacementQuiz');
const User = require('../models/User');

/**
 * @desc    Get placement quiz for a category
 * @route   GET /api/placement-quiz/:category
 * @access  Protected
 */
const getPlacementQuiz = async (req, res, next) => {
  try {
    const { category } = req.params;

    const quiz = await PlacementQuiz.findOne({ category, isActive: true });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: `No placement quiz found for category: ${category}`,
      });
    }

    // Strip isCorrect from options to prevent cheating
    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      points: q.points,
      options: q.options.map((opt) => ({
        _id: opt._id,
        text: opt.text,
      })),
    }));

    res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        category: quiz.category,
        passingScore: quiz.passingScore,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit placement quiz answers
 * @route   POST /api/placement-quiz/:category/submit
 * @access  Protected
 */
const submitPlacementQuiz = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required.',
      });
    }

    const quiz = await PlacementQuiz.findOne({ category, isActive: true });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: `No placement quiz found for category: ${category}`,
      });
    }

    // Score the quiz
    let earnedPoints = 0;
    let totalPoints = 0;

    const gradedAnswers = answers.map((ans) => {
      const question = quiz.questions[ans.questionIndex];
      if (!question) {
        return {
          questionIndex: ans.questionIndex,
          selectedOptionIndex: ans.selectedOptionIndex,
          isCorrect: false,
        };
      }

      totalPoints += question.points || 1;
      const selectedOption = question.options[ans.selectedOptionIndex];
      const isCorrect = selectedOption ? selectedOption.isCorrect === true : false;

      if (isCorrect) {
        earnedPoints += question.points || 1;
      }

      return {
        questionIndex: ans.questionIndex,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect,
      };
    });

    // Count points for unanswered questions
    quiz.questions.forEach((q, idx) => {
      const answered = answers.find((a) => a.questionIndex === idx);
      if (!answered) {
        totalPoints += q.points || 1;
      }
    });

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Determine skill level based on score
    let skillLevel = 'beginner';
    if (scorePercent >= 80) {
      skillLevel = 'advanced';
    } else if (scorePercent >= 50) {
      skillLevel = 'intermediate';
    }

    // Update user's skill estimate for this category
    const user = await User.findById(userId);
    if (!user.categorySkillEstimates) {
      user.categorySkillEstimates = new Map();
    }
    user.categorySkillEstimates.set(category, {
      score: scorePercent,
      level: skillLevel,
      lastAssessed: new Date(),
    });
    user.hasTakenPlacementQuiz = true;
    await user.save();

    res.status(200).json({
      success: true,
      score: scorePercent,
      skillLevel,
      category,
      gradedAnswers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available placement quiz categories
 * @route   GET /api/placement-quiz/categories
 * @access  Protected
 */
const getPlacementQuizCategories = async (req, res, next) => {
  try {
    const categories = await PlacementQuiz.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlacementQuiz,
  submitPlacementQuiz,
  getPlacementQuizCategories,
};
