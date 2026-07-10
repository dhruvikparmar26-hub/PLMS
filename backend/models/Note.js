const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson reference is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      maxlength: [5000, 'Note cannot exceed 5000 characters'],
    },
    isFlashcard: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying a user's notes efficiently
noteSchema.index({ user: 1, course: 1 });
noteSchema.index({ user: 1, lesson: 1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
