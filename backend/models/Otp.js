const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Automatically deletes the document after 10 minutes (600 seconds)
    },
  },
  {
    timestamps: true,
  }
);

// Add index for fast querying
otpSchema.index({ email: 1, createdAt: -1 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
