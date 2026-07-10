const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'instructor', 'admin'],
        message: 'Role must be student, instructor, or admin',
      },
      default: 'student',
    },
    learningPreferences: {
      type: [String],
      default: [],
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    categorySkillEstimates: {
      type: Map,
      of: {
        score: { type: Number, default: 0 },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
        lastAssessed: { type: Date, default: null },
      },
      default: {},
    },
    hasTakenPlacementQuiz: {
      type: Boolean,
      default: false,
    },
    dailyGoal: {
      type: {
        goalType: {
          type: String,
          enum: ['time', 'lessons'],
          default: 'lessons',
        },
        goalValue: {
          type: Number,
          default: 3,
        },
        currentProgress: {
          type: Number,
          default: 0,
        },
        lastResetDate: {
          type: Date,
          default: Date.now,
        },
      },
      default: () => ({
        goalType: 'lessons',
        goalValue: 3,
        currentProgress: 0,
        lastResetDate: new Date(),
      }),
    },
    xp: {
      type: Number,
      default: 0,
    },
    leaderboardOptIn: {
      type: Boolean,
      default: false,
    },
    accessibility: {
      type: {
        fontSize: {
          type: String,
          enum: ['small', 'medium', 'large', 'xl'],
          default: 'medium',
        },
        highContrast: { type: Boolean, default: false },
        dyslexicFont: { type: Boolean, default: false },
        reduceMotion: { type: Boolean, default: false },
        playbackSpeed: { type: Number, default: 1.0 },
      },
      default: {
        fontSize: 'medium',
        highContrast: false,
        dyslexicFont: false,
        reduceMotion: false,
        playbackSpeed: 1.0,
      },
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
