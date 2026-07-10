const SpacedRepetition = require('../models/SpacedRepetition');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

/**
 * @desc    Record a question answer for spaced repetition
 * @route   POST /api/spaced-repetition/record
 * @access  Protected
 */
const recordQuestionAnswer = async (req, res, next) => {
  try {
    let { questionId, quizId, courseId, isCorrect, selectedOptionId } = req.body;
    const userId = req.user._id;

    if (!questionId || !quizId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'questionId, quizId, and courseId are required.',
      });
    }

    if (typeof isCorrect !== 'boolean') {
      if (!selectedOptionId) {
        return res.status(400).json({
          success: false,
          message: 'Either isCorrect (boolean) or selectedOptionId is required.',
        });
      }

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      const question = quiz.questions.find(
        (q) => q._id.toString() === questionId.toString()
      );
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found in quiz',
        });
      }

      const selectedOption = question.options.find(
        (opt) => opt._id.toString() === selectedOptionId.toString()
      );
      isCorrect = selectedOption ? selectedOption.isCorrect === true : false;
    }

    // Find or create spaced repetition record
    let sr = await SpacedRepetition.findOne({ user: userId, questionId });

    if (!sr) {
      sr = await SpacedRepetition.create({
        user: userId,
        questionId,
        quiz: quizId,
        course: courseId,
        intervalDays: 1,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      });
    }

    // Update based on answer using SM-2 algorithm variant
    sr.reviewCount += 1;
    sr.lastReviewedAt = new Date();

    if (isCorrect) {
      sr.correctCount += 1;
      sr.streak += 1;

      // Calculate new interval using SM-2 algorithm
      if (sr.reviewCount === 1) {
        sr.intervalDays = 1;
      } else if (sr.reviewCount === 2) {
        sr.intervalDays = 6;
      } else {
        sr.intervalDays = Math.round(sr.intervalDays * sr.easeFactor);
      }

      // Update ease factor
      sr.easeFactor = Math.max(1.3, sr.easeFactor + (0.1 - (5 - sr.streak) * (0.08 + (5 - sr.streak) * 0.02)));
    } else {
      sr.streak = 0;
      sr.intervalDays = 1; // Reset to review tomorrow
      sr.easeFactor = Math.max(1.3, sr.easeFactor - 0.2);
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + sr.intervalDays);
    sr.nextReviewDate = nextReview;

    await sr.save();

    res.status(200).json({
      success: true,
      isCorrect,
      spacedRepetition: {
        intervalDays: sr.intervalDays,
        nextReviewDate: sr.nextReviewDate,
        easeFactor: sr.easeFactor,
        streak: sr.streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get review queue for spaced repetition
 * @route   GET /api/spaced-repetition/review-queue
 * @access  Protected
 */
const getReviewQueue = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const now = new Date();

    // Get items due for review
    const reviewItems = await SpacedRepetition.find({
      user: userId,
      nextReviewDate: { $lte: now },
    })
      .populate('quiz', 'title questions')
      .populate('course', 'title')
      .sort({ nextReviewDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await SpacedRepetition.countDocuments({
      user: userId,
      nextReviewDate: { $lte: now },
    });

    const processedItems = reviewItems.map((item) => {
      const quizDoc = item.quiz;
      let questionText = 'Question not found';
      let options = [];

      if (quizDoc && quizDoc.questions) {
        const question = quizDoc.questions.find(
          (q) => q._id.toString() === item.questionId.toString()
        );
        if (question) {
          questionText = question.questionText;
          options = (question.options || []).map((opt) => ({
            _id: opt._id,
            text: opt.text,
          }));
        }
      }

      // Avoid returning full questions array to client
      const safeQuiz = quizDoc ? { _id: quizDoc._id, title: quizDoc.title } : null;

      return {
        ...item,
        quiz: safeQuiz,
        questionText,
        options,
      };
    });

    res.status(200).json({
      success: true,
      reviewItems: processedItems,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get spaced repetition stats for a user
 * @route   GET /api/spaced-repetition/stats
 * @access  Protected
 */
const getSpacedRepetitionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await SpacedRepetition.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          totalReviews: { $sum: '$reviewCount' },
          totalCorrect: { $sum: '$correctCount' },
          avgEaseFactor: { $avg: '$easeFactor' },
          avgInterval: { $avg: '$intervalDays' },
        },
      },
    ]);

    const dueCount = await SpacedRepetition.countDocuments({
      user: userId,
      nextReviewDate: { $lte: new Date() },
    });

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalQuestions: 0,
        totalReviews: 0,
        totalCorrect: 0,
        avgEaseFactor: 2.5,
        avgInterval: 1,
      },
      dueCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Sync quiz attempts to spaced repetition (batch operation)
 * @route   POST /api/spaced-repetition/sync-attempts
 * @access  Protected
 */
const syncQuizAttempts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'quizId is required.',
      });
    }

    // Load Quiz containing the questions and course reference
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    // Get recent quiz attempts for this quiz
    const attempts = await QuizAttempt.find({ user: userId, quiz: quizId })
      .sort({ attemptedAt: -1 })
      .limit(1)
      .lean();

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No attempts found for this quiz.',
        synced: 0,
      });
    }

    const attempt = attempts[0];
    let synced = 0;

    // Process each answer in the attempt
    for (const answer of attempt.answers) {
      const isCorrect = answer.isCorrect;
      
      const question = quiz.questions[answer.questionIndex];
      if (!question) continue;

      const questionId = question._id;

      // Find or create spaced repetition record
      let sr = await SpacedRepetition.findOne({
        user: userId,
        questionId: questionId,
      });

      if (!sr) {
        sr = await SpacedRepetition.create({
          user: userId,
          questionId: questionId,
          quiz: quizId,
          course: quiz.course,
          intervalDays: 1,
          easeFactor: 2.5,
          nextReviewDate: new Date(),
        });
      }

      // Update based on answer
      sr.reviewCount += 1;
      sr.lastReviewedAt = new Date();

      if (isCorrect) {
        sr.correctCount += 1;
        sr.streak += 1;

        if (sr.reviewCount === 1) {
          sr.intervalDays = 1;
        } else if (sr.reviewCount === 2) {
          sr.intervalDays = 6;
        } else {
          sr.intervalDays = Math.round(sr.intervalDays * sr.easeFactor);
        }

        sr.easeFactor = Math.max(1.3, sr.easeFactor + (0.1 - (5 - sr.streak) * (0.08 + (5 - sr.streak) * 0.02)));
      } else {
        sr.streak = 0;
        sr.intervalDays = 1;
        sr.easeFactor = Math.max(1.3, sr.easeFactor - 0.2);
      }

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + sr.intervalDays);
      sr.nextReviewDate = nextReview;

      await sr.save();
      synced++;
    }

    res.status(200).json({
      success: true,
      synced,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordQuestionAnswer,
  getReviewQueue,
  getSpacedRepetitionStats,
  syncQuizAttempts,
};
