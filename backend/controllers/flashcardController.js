const Flashcard = require('../models/Flashcard');

/**
 * SM-2 algorithm: updates interval/easeFactor/repetitions given a quality rating 0-5
 * Rating: 0-1 = forgotten, 2 = recall with difficulty, 3 = correct recall, 4-5 = easy
 */
function applySpacedRepetition(flashcard, quality) {
  let { interval, easeFactor, repetitions } = flashcard;

  if (quality < 3) {
    // Failed — reset repetitions
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return { interval, easeFactor, repetitions, dueDate, lastReviewed: new Date(), lastRating: quality };
}

/**
 * @desc    Create a flashcard
 * @route   POST /api/flashcards
 * @access  Protected
 */
const createFlashcard = async (req, res, next) => {
  try {
    const { front, back, lessonId, courseId } = req.body;
    const userId = req.user._id;

    if (!front || !back) {
      return res.status(400).json({ success: false, message: 'front and back are required.' });
    }

    const flashcard = await Flashcard.create({
      user: userId,
      lesson: lessonId || null,
      course: courseId || null,
      front,
      back,
    });

    res.status(201).json({ success: true, flashcard });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all flashcards for the current user
 * @route   GET /api/flashcards
 * @access  Protected
 * @query   courseId, lessonId, dueOnly (boolean)
 */
const getFlashcards = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseId, lessonId, dueOnly } = req.query;

    const filter = { user: userId };
    if (courseId) filter.course = courseId;
    if (lessonId) filter.lesson = lessonId;
    if (dueOnly === 'true') filter.dueDate = { $lte: new Date() };

    const flashcards = await Flashcard.find(filter).sort({ dueDate: 1 }).lean();

    res.status(200).json({ success: true, flashcards, total: flashcards.length });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update (edit) a flashcard
 * @route   PATCH /api/flashcards/:id
 * @access  Protected
 */
const updateFlashcard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { front, back } = req.body;

    const flashcard = await Flashcard.findOne({ _id: req.params.id, user: userId });
    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Flashcard not found.' });
    }

    if (front !== undefined) flashcard.front = front;
    if (back !== undefined) flashcard.back = back;
    await flashcard.save();

    res.status(200).json({ success: true, flashcard });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a flashcard
 * @route   DELETE /api/flashcards/:id
 * @access  Protected
 */
const deleteFlashcard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const flashcard = await Flashcard.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Flashcard not found.' });
    }
    res.status(200).json({ success: true, message: 'Flashcard deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Review a flashcard — apply SM-2 algorithm
 * @route   POST /api/flashcards/:id/review
 * @access  Protected
 * @body    { quality: 0-5 }
 */
const reviewFlashcard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { quality } = req.body;

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ success: false, message: 'quality must be an integer 0-5.' });
    }

    const flashcard = await Flashcard.findOne({ _id: req.params.id, user: userId });
    if (!flashcard) {
      return res.status(404).json({ success: false, message: 'Flashcard not found.' });
    }

    const update = applySpacedRepetition(flashcard, parseInt(quality));
    Object.assign(flashcard, update);
    await flashcard.save();

    res.status(200).json({ success: true, flashcard });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get due flashcards for review session
 * @route   GET /api/flashcards/due
 * @access  Protected
 */
const getDueFlashcards = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseId, limit = 20 } = req.query;

    const filter = { user: userId, dueDate: { $lte: new Date() } };
    if (courseId) filter.course = courseId;

    const flashcards = await Flashcard.find(filter)
      .sort({ dueDate: 1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({ success: true, flashcards, total: flashcards.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
  getDueFlashcards,
};
