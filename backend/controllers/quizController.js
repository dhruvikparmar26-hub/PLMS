const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');

/**
 * @desc    Get a quiz by ID — strips isCorrect from options so clients can't cheat
 * @route   GET /api/quizzes/:id
 * @access  Protected
 */
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
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
        // isCorrect is intentionally omitted
      })),
    }));

    res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        course: quiz.course,
        title: quiz.title,
        passingScore: quiz.passingScore,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a quiz attempt — scores server-side, saves QuizAttempt
 *          Client sends: { answers: [{ questionIndex: 0, selectedOptionIndex: 1 }, ...] }
 * @route   POST /api/quizzes/:id/attempt
 * @access  Protected
 */
const attemptQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const userId = req.user._id;
    const { answers, adaptiveMode = false } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required.',
      });
    }

    // 1. Load the full quiz with correct answers
    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // 2. Score each answer server-side — never trust client-submitted scores
    let earnedPoints = 0;
    let totalPoints = 0;
    let currentDifficulty = 'medium';
    let consecutiveCorrect = 0;
    let consecutiveWrong = 0;

    const gradedAnswers = answers.map((ans) => {
      const question = quiz.questions[ans.questionIndex];
      if (!question) {
        return {
          questionIndex: ans.questionIndex,
          selectedOptionIndex: ans.selectedOptionIndex,
          isCorrect: false,
          difficulty: 'medium',
        };
      }

      totalPoints += question.points || 1;
      const selectedOption = question.options[ans.selectedOptionIndex];
      const isCorrect = selectedOption ? selectedOption.isCorrect === true : false;

      if (isCorrect) {
        earnedPoints += question.points || 1;
        consecutiveCorrect++;
        consecutiveWrong = 0;
        
        // Adaptive difficulty: increase after 2 consecutive correct
        if (adaptiveMode && consecutiveCorrect >= 2) {
          if (currentDifficulty === 'easy') currentDifficulty = 'medium';
          else if (currentDifficulty === 'medium') currentDifficulty = 'hard';
        }
      } else {
        consecutiveWrong++;
        consecutiveCorrect = 0;
        
        // Adaptive difficulty: decrease after 2 consecutive wrong
        if (adaptiveMode && consecutiveWrong >= 2) {
          if (currentDifficulty === 'hard') currentDifficulty = 'medium';
          else if (currentDifficulty === 'medium') currentDifficulty = 'easy';
        }
      }

      const correctOptionIndex = question.options.findIndex((opt) => opt.isCorrect === true);
      const gradedAns = {
        questionIndex: ans.questionIndex,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect,
        difficulty: question.difficulty || 'medium',
      };

      if (quiz.quizType === 'practice') {
        gradedAns.correctOptionIndex = correctOptionIndex;
      }

      return gradedAns;
    });

    // Also count points for unanswered questions
    quiz.questions.forEach((q, idx) => {
      const answered = answers.find((a) => a.questionIndex === idx);
      if (!answered) {
        totalPoints += q.points || 1;
      }
    });

    // 3. Calculate percentage score
    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercent >= quiz.passingScore;

    // 4. Save the attempt
    const attempt = await QuizAttempt.create({
      user: userId,
      quiz: quizId,
      score: scorePercent,
      answers: gradedAnswers,
      passed,
    });

    // Log activity and award XP
    logActivity(userId, 'quiz_attempted', {
      quizId: quizId,
      courseId: quiz.course,
      score: scorePercent,
      extra: { passed, adaptiveMode },
    });

    // Award XP for quiz attempt (5 XP base + bonus for passing)
    const xpAwarded = 5 + (passed ? 10 : 0);
    await User.findByIdAndUpdate(userId, { $inc: { xp: xpAwarded } });

    // Update Concept Mastery
    if (quiz.concepts && quiz.concepts.length > 0) {
      const { updateConceptMastery } = require('../utils/masteryUpdater');
      await updateConceptMastery(userId, quiz.concepts, scorePercent / 100);
    }

    // Emit socket event for real-time leaderboard update
    const io = req.app?.get('io');
    if (io && quiz.course?.category) {
      io.to(`category:${quiz.course.category}`).emit('leaderboard_updated', { category: quiz.course.category });
    }

    res.status(201).json({
      success: true,
      attempt: {
        _id: attempt._id,
        score: scorePercent,
        passed,
        earnedPoints,
        totalPoints,
        answers: gradedAnswers,
        passingScore: quiz.passingScore,
      },
      adaptiveMode,
      finalDifficulty: adaptiveMode ? currentDifficulty : null,
      xpAwarded,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quizzes for a specific course
 * @route   GET /api/quizzes/course/:courseId
 * @access  Protected
 */
const getQuizzesByCourse = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select(
      'title passingScore questions'
    );

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes: quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        passingScore: q.passingScore,
        questionCount: q.questions.length,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's quiz attempts
 * @route   GET /api/quizzes/my-attempts
 * @access  Protected
 */
const getMyQuizAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate('quiz', 'title')
      .sort({ attemptedAt: -1 });

    res.status(200).json({
      success: true,
      attempts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get next question dynamically for adaptive quiz mode
 * @route   GET /api/quizzes/:id/adaptive-next
 * @access  Protected
 */
const getAdaptiveNextQuestion = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const { 
      exclude = '', 
      currentDifficulty: reqDifficulty, 
      consecutiveCorrect: reqCorrect = 0, 
      consecutiveWrong: reqWrong = 0, 
      questionId,
      selectedOptionId
    } = req.query;

    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const excludedIds = exclude ? exclude.split(',').filter(Boolean) : [];

    let currentDifficulty = reqDifficulty;
    let consecutiveCorrect = parseInt(reqCorrect, 10);
    let consecutiveWrong = parseInt(reqWrong, 10);
    let isCorrect = undefined;

    // Grade the question if questionId and selectedOptionId are passed
    if (questionId && selectedOptionId) {
      const prevQuestion = quiz.questions.find((q) => q._id.toString() === questionId.toString());
      if (prevQuestion) {
        const selectedOption = prevQuestion.options.find((opt) => opt._id.toString() === selectedOptionId.toString());
        isCorrect = selectedOption ? selectedOption.isCorrect === true : false;
      }
    }

    // Determine target difficulty
    if (isCorrect === undefined) {
      // First question or no answer provided
      if (!currentDifficulty) {
        const category = quiz.course?.category;
        const userSkillEstimates = req.user.categorySkillEstimates;
        let assessedLevel = null;
        if (category && userSkillEstimates) {
          const estimate = typeof userSkillEstimates.get === 'function'
            ? userSkillEstimates.get(category)
            : userSkillEstimates[category];
          if (estimate && estimate.level) {
            assessedLevel = estimate.level;
          }
        }
        currentDifficulty = assessedLevel || 'medium';
      }
      consecutiveCorrect = 0;
      consecutiveWrong = 0;
    } else {
      // Adjust difficulty based on correctness of the last answer
      if (isCorrect) {
        consecutiveCorrect += 1;
        consecutiveWrong = 0;
        if (consecutiveCorrect >= 2) {
          consecutiveCorrect = 0;
          if (currentDifficulty === 'easy') currentDifficulty = 'medium';
          else if (currentDifficulty === 'medium') currentDifficulty = 'hard';
        }
      } else {
        consecutiveWrong += 1;
        consecutiveCorrect = 0;
        if (consecutiveWrong >= 2) {
          consecutiveWrong = 0;
          if (currentDifficulty === 'hard') currentDifficulty = 'medium';
          else if (currentDifficulty === 'medium') currentDifficulty = 'easy';
        }
      }
    }

    // Try to find a question at currentDifficulty
    let targetQuestions = quiz.questions.filter(
      (q) => q.difficulty === currentDifficulty && !excludedIds.includes(q._id.toString())
    );

    // Fallbacks if no questions of target difficulty remain
    if (targetQuestions.length === 0) {
      const difficultiesOrder = ['easy', 'medium', 'hard'];
      // Search other difficulties in order of proximity
      for (const diff of difficultiesOrder) {
        if (diff !== currentDifficulty) {
          targetQuestions = quiz.questions.filter(
            (q) => q.difficulty === diff && !excludedIds.includes(q._id.toString())
          );
          if (targetQuestions.length > 0) {
            currentDifficulty = diff;
            break;
          }
        }
      }
    }

    // If still no questions, the quiz is complete
    if (targetQuestions.length === 0) {
      return res.status(200).json({
        success: true,
        finished: true,
        isCorrect,
        message: 'No more questions left.',
      });
    }

    // Select the first available question in the target difficulty
    const question = targetQuestions[0];
    
    // Find its index in the original quiz.questions array
    const originalIndex = quiz.questions.findIndex((q) => q._id.toString() === question._id.toString());

    // Safe options representation
    const safeOptions = question.options.map((opt) => ({
      _id: opt._id,
      text: opt.text,
    }));

    res.status(200).json({
      success: true,
      finished: false,
      isCorrect,
      question: {
        _id: question._id,
        questionText: question.questionText,
        points: question.points,
        difficulty: question.difficulty,
        options: safeOptions,
        originalIndex,
      },
      state: {
        currentDifficulty,
        consecutiveCorrect,
        consecutiveWrong,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getQuiz, 
  attemptQuiz, 
  getQuizzesByCourse, 
  getMyQuizAttempts,
  getAdaptiveNextQuestion
};
