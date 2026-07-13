const Concept = require('../models/Concept');
const MasteryScore = require('../models/MasteryScore');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

/**
 * @desc    Create a new concept
 * @route   POST /api/concepts
 * @access  Private (Instructor/Admin)
 */
const createConcept = async (req, res, next) => {
  try {
    const { name, category, prerequisites } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required',
      });
    }

    // Check if concept already exists
    const existing = await Concept.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Concept with name "${name}" already exists`,
      });
    }

    // Validate prerequisites exist if provided
    if (prerequisites && prerequisites.length > 0) {
      const validCount = await Concept.countDocuments({ _id: { $in: prerequisites } });
      if (validCount !== prerequisites.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more prerequisite concept IDs are invalid',
        });
      }
    }

    const concept = await Concept.create({
      name,
      category,
      prerequisites: prerequisites || [],
    });

    res.status(201).json({
      success: true,
      data: concept,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all concepts and prerequisite graph
 * @route   GET /api/concepts
 * @access  Private (All Roles)
 */
const getConcepts = async (req, res, next) => {
  try {
    const concepts = await Concept.find()
      .populate('prerequisites', 'name category')
      .lean();

    res.status(200).json({
      success: true,
      count: concepts.length,
      data: concepts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student concept mastery graph
 * @route   GET /api/concepts/mastery
 * @access  Private (All Roles)
 */
const getConceptMastery = async (req, res, next) => {
  try {
    let targetUserId = req.user._id;

    // Instructors/Admins can query other users' mastery graphs
    if (req.query.userId && ['admin', 'instructor'].includes(req.user.role)) {
      targetUserId = req.query.userId;
    }

    // Retrieve mastery scores for target user
    const masteryScores = await MasteryScore.find({ userId: targetUserId })
      .populate('conceptId', 'name category prerequisites')
      .lean();

    // Map into an easily digestible concept id keyed object
    const scoresMap = {};
    const masteryList = [];
    masteryScores.forEach((m) => {
      if (m.conceptId) {
        scoresMap[m.conceptId._id] = {
          conceptName: m.conceptId.name,
          category: m.conceptId.category,
          score: m.score,
          lastAssessed: m.lastAssessed,
          decayRate: m.decayRate,
        };
        masteryList.push({
          _id: m._id,
          name: m.conceptId.name,
          category: m.conceptId.category,
          score: m.score,
          lastAssessed: m.lastAssessed,
          decayRate: m.decayRate,
        });
      }
    });

    res.status(200).json({
      success: true,
      userId: targetUserId,
      data: scoresMap,
      mastery: masteryList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Run concept backfill for existing lessons and quizzes
 * @route   POST /api/concepts/backfill
 * @access  Private (Instructor/Admin)
 */
const backfillConcepts = async (req, res, next) => {
  try {
    // 1. Ensure concepts field exists on all Lessons
    const lessonsResult = await Lesson.updateMany(
      { concepts: { $exists: false } },
      { $set: { concepts: [] } }
    );

    // 2. Ensure concepts field exists on all Quizzes
    const quizzesResult = await Quiz.updateMany(
      { concepts: { $exists: false } },
      { $set: { concepts: [] } }
    );

    // 3. Smart backfill matching: Tag concepts based on keyword matching
    const concepts = await Concept.find().lean();
    let taggedLessonsCount = 0;
    let taggedQuizzesCount = 0;

    for (const concept of concepts) {
      // Regex match for concept name (case-insensitive) in title or content
      const regex = new RegExp(`\\b${concept.name}\\b`, 'i');

      const matchingLessons = await Lesson.find({
        $or: [{ title: regex }, { content: regex }],
        concepts: { $ne: concept._id },
      });

      if (matchingLessons.length > 0) {
        const lessonIds = matchingLessons.map((l) => l._id);
        await Lesson.updateMany(
          { _id: { $in: lessonIds } },
          { $addToSet: { concepts: concept._id } }
        );
        taggedLessonsCount += lessonIds.length;
      }

      const matchingQuizzes = await Quiz.find({
        title: regex,
        concepts: { $ne: concept._id },
      });

      if (matchingQuizzes.length > 0) {
        const quizIds = matchingQuizzes.map((q) => q._id);
        await Quiz.updateMany(
          { _id: { $in: quizIds } },
          { $addToSet: { concepts: concept._id } }
        );
        taggedQuizzesCount += quizIds.length;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Backfill process completed successfully.',
      details: {
        lessonsInitialized: lessonsResult.modifiedCount,
        quizzesInitialized: quizzesResult.modifiedCount,
        smartTaggedLessons: taggedLessonsCount,
        smartTaggedQuizzes: taggedQuizzesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConcept,
  getConcepts,
  getConceptMastery,
  backfillConcepts,
};
