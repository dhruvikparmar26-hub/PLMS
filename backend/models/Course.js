const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Difficulty must be beginner, intermediate, or advanced',
      },
      default: 'beginner',
    },
    modules: [
      {
        title: {
          type: String,
          required: true,
        },
        lessons: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
          },
        ],
      },
    ],
    thumbnail: {
      type: String,
      default: '',
    },
    briefIntro: {
      type: String,
      default: '',
      maxlength: [1000, 'Brief intro cannot exceed 1000 characters'],
    },
    syllabus: [
      {
        moduleTitle: { type: String, required: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        topics: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for search and filtering
courseSchema.index({ category: 1, difficulty: 1 });
courseSchema.index({ title: 'text', description: 'text' });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
