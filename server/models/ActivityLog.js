const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'lesson_viewed',
        'lesson_completed',
        'quiz_attempted',
        'course_enrolled',
        'course_completed',
        'login',
        'logout',
        'review_completed',
      ],
    },
    metadata: {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
      },
      score: Number,
      timeSpent: Number, // in seconds
      extra: mongoose.Schema.Types.Mixed, // flexible field for any additional data
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying a user's activity history efficiently
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ user: 1, action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
