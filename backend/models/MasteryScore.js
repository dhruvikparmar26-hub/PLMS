const mongoose = require('mongoose');

const masteryScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      required: [true, 'Concept reference is required'],
    },
    score: {
      type: Number,
      required: [true, 'Mastery score is required'],
      min: [0, 'Score cannot be less than 0'],
      max: [1, 'Score cannot be greater than 1'],
      default: 0,
    },
    decayRate: {
      type: Number,
      required: [true, 'Decay rate is required'],
      default: 0.01,
    },
    lastAssessed: {
      type: Date,
      required: [true, 'Last assessed date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to ensure one record per user-concept pair
masteryScoreSchema.index({ userId: 1, conceptId: 1 }, { unique: true });
masteryScoreSchema.index({ userId: 1, score: 1 });

const MasteryScore = mongoose.model('MasteryScore', masteryScoreSchema);

module.exports = MasteryScore;
