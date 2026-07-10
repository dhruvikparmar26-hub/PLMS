const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: [true, 'Enrollment reference is required'],
    },
    verificationCode: {
      type: String,
      unique: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: String, // e.g. "Distinction", "Pass", "Merit"
      default: 'Pass',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate verification code before save
certificateSchema.pre('save', function (next) {
  if (!this.verificationCode) {
    this.verificationCode = crypto.randomBytes(16).toString('hex').toUpperCase();
  }
  next();
});

// Unique constraint: one certificate per user per course
certificateSchema.index({ user: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
