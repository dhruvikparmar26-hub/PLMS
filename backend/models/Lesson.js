const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['pdf', 'link', 'document', 'other'],
          default: 'link',
        },
      },
    ],
    duration: {
      type: Number,
      default: 0, // in seconds
    },
    transcript: {
      type: String,
      default: '',
    },
    captionsUrl: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for ordering lessons within a course
lessonSchema.index({ course: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
