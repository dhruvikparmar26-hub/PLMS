const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required in minutes'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    status: {
      type: String,
      enum: ['planned', 'completed', 'cancelled'],
      default: 'planned',
    },
    completedAt: {
      type: Date,
    },
    actualDuration: {
      type: Number, // actual time spent in minutes
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying a user's study sessions efficiently
studySessionSchema.index({ user: 1, scheduledDate: 1 });
studySessionSchema.index({ user: 1, status: 1 });
studySessionSchema.index({ user: 1, scheduledDate: -1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);

module.exports = StudySession;
