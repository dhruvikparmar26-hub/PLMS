const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: ['course_match', 'streak_warning', 'announcement'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying a user's notifications efficiently
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
