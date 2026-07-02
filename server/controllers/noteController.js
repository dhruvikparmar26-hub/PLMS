const Note = require('../models/Note');

/**
 * Get all notes for a user, grouped by course
 */
const getUserNotes = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const notes = await Note.find({ user: userId })
      .populate('course', 'title')
      .populate('lesson', 'title')
      .sort({ updatedAt: -1 });

    // Group by course
    const groupedNotes = {};
    notes.forEach((note) => {
      if (note.course) {
        const courseId = note.course._id.toString();
        if (!groupedNotes[courseId]) {
          groupedNotes[courseId] = {
            course: note.course,
            notes: [],
          };
        }
        groupedNotes[courseId].notes.push(note);
      }
    });

    res.status(200).json({
      success: true,
      notes,
      data: Object.values(groupedNotes),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific note for a user and lesson
 */
const getNoteForLesson = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { lessonId } = req.params;

    const note = await Note.findOne({ user: userId, lesson: lessonId });

    res.status(200).json({
      success: true,
      note: note || null,
      data: note || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update a note
 */
const saveNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { lessonId, courseId, content, isFlashcard = false } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note content is required',
      });
    }

    // Check if note already exists
    let note = await Note.findOne({ user: userId, lesson: lessonId });

    if (note) {
      // Update existing note
      note.content = content;
      note.isFlashcard = isFlashcard;
      await note.save();
    } else {
      // Create new note
      note = await Note.create({
        user: userId,
        lesson: lessonId,
        course: courseId,
        content,
        isFlashcard,
      });
    }

    res.status(200).json({
      success: true,
      note,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a note
 */
const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { noteId } = req.params;

    const note = await Note.findOne({ _id: noteId, user: userId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    await Note.deleteOne({ _id: noteId });

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotes,
  getNoteForLesson,
  saveNote,
  deleteNote,
};
