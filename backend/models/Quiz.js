const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        options: [
          {
            text: {
              type: String,
              required: true,
            },
            isCorrect: {
              type: Boolean,
              default: false,
            },
          },
        ],
        points: {
          type: Number,
          default: 1,
        },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
      },
    ],
    passingScore: {
      type: Number,
      required: [true, 'Passing score is required'],
      min: 0,
      max: 100,
    },
    quizType: {
      type: String,
      enum: ['graded', 'practice'],
      default: 'graded',
    },
    concepts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Concept',
      },
    ],
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ course: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
