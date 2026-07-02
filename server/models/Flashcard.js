const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    front: {
      type: String,
      required: [true, 'Front content is required'],
      trim: true,
      maxlength: [1000, 'Front cannot exceed 1000 characters'],
    },
    back: {
      type: String,
      required: [true, 'Back content is required'],
      trim: true,
      maxlength: [2000, 'Back cannot exceed 2000 characters'],
    },
    // Spaced repetition fields
    dueDate: {
      type: Date,
      default: Date.now,
    },
    interval: {
      type: Number,
      default: 1, // days
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    lastReviewed: {
      type: Date,
      default: null,
    },
    // Rating (SM-2 rating: 0-5)
    lastRating: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

flashcardSchema.index({ user: 1, dueDate: 1 });
flashcardSchema.index({ user: 1, course: 1 });
flashcardSchema.index({ user: 1, lesson: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard;
