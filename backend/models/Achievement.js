const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Achievement key is required'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
      trim: true,
    },
    icon: {
      type: String,
      required: [true, 'Achievement icon is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;
