const mongoose = require('mongoose');

const placementQuizSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Web Development', 'Data Science', 'Design', 'Marketing'],
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
      },
    ],
    passingScore: {
      type: Number,
      required: [true, 'Passing score is required'],
      min: 0,
      max: 100,
      default: 70,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

placementQuizSchema.index({ category: 1, isActive: 1 });

const PlacementQuiz = mongoose.model('PlacementQuiz', placementQuizSchema);

module.exports = PlacementQuiz;
