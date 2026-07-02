const mongoose = require('mongoose');

const qAPostSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: '',
    },
    body: {
      type: String,
      required: [true, 'Post body is required'],
      trim: true,
      maxlength: [5000, 'Body cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: ['question', 'discussion', 'announcement'],
      default: 'question',
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        body: { type: String, required: true, trim: true, maxlength: [2000, 'Reply cannot exceed 2000 characters'] },
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isInstructorReply: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

qAPostSchema.index({ course: 1, createdAt: -1 });
qAPostSchema.index({ lesson: 1, createdAt: -1 });
qAPostSchema.index({ author: 1 });

const QAPost = mongoose.model('QAPost', qAPostSchema);

module.exports = QAPost;
