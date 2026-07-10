const mongoose = require('mongoose');

const spacedRepetitionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Question ID is required'],
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    intervalDays: {
      type: Number,
      default: 1,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient review queue queries
spacedRepetitionSchema.index({ user: 1, nextReviewDate: 1 });
spacedRepetitionSchema.index({ user: 1, questionId: 1 }, { unique: true });

const SpacedRepetition = mongoose.model('SpacedRepetition', spacedRepetitionSchema);

module.exports = SpacedRepetition;
