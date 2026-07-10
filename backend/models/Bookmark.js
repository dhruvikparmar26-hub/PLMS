const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
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
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Bookmark note cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one bookmark per user per lesson
bookmarkSchema.index({ user: 1, lesson: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, course: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
