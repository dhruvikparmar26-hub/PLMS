const mongoose = require('mongoose');

const conceptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Concept name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Concept category is required'],
      trim: true,
    },
    prerequisites: [
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

// Indexes
conceptSchema.index({ category: 1 });

const Concept = mongoose.model('Concept', conceptSchema);

module.exports = Concept;
