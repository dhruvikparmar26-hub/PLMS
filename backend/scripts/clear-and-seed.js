require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');

const run = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in env');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB. Clearing existing collections...');

    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Enrollment.deleteMany({});
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('🧹 Cleared Courses, Lessons, Enrollments, Quizzes, QuizAttempts, and ActivityLogs.');

    // Now run seed-prod.js logic directly
    console.log('🌱 Seeding courses and lessons...');
    const seedProd = require('./seed-prod');
    // Note: seedProd is a function exported or run directly in seed-prod.js.
    // Let's check how seed-prod.js exports itself.
  } catch (error) {
    console.error(error);
  }
};
