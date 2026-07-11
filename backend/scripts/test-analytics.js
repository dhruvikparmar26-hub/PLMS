require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');
const { getUserAnalytics } = require('../controllers/analyticsController');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find user with name matching dhruvik or default first user
    let user = await User.findOne({ name: { $regex: 'dhruvik', $options: 'i' } });
    if (!user) {
      user = await User.findOne({});
    }

    if (!user) {
      console.log('❌ No users found in database');
      process.exit(1);
    }

    console.log(`Testing analytics for user: ${user.name} (${user.email}) - ID: ${user._id}`);

    // Test 1: getUserAnalytics
    console.log('\n--- Test 1: getUserAnalytics ---');
    try {
      const mockReq = { user: { id: user._id.toString(), _id: user._id } };
      const mockRes = {
        json: (data) => console.log('✅ getUserAnalytics success! count:', Object.keys(data.data).length),
        status: (code) => { console.log('❌ getUserAnalytics status:', code); return mockRes; }
      };
      await getUserAnalytics(mockReq, mockRes);
    } catch (err) {
      console.error('❌ getUserAnalytics crash:', err);
    }

    // Test 2: getMyEnrollments query
    console.log('\n--- Test 2: getMyEnrollments ---');
    try {
      const enrollments = await Enrollment.find({ user: user._id })
        .populate({
          path: 'course',
          populate: { path: 'instructor', select: 'name' },
        });
      console.log('✅ getMyEnrollments success! count:', enrollments.length);
    } catch (err) {
      console.error('❌ getMyEnrollments crash:', err);
    }

    // Test 3: getMyQuizAttempts query
    console.log('\n--- Test 3: getMyQuizAttempts ---');
    try {
      const attempts = await QuizAttempt.find({ user: user._id })
        .populate('quiz', 'title')
        .sort({ attemptedAt: -1 });
      console.log('✅ getMyQuizAttempts success! count:', attempts.length);
    } catch (err) {
      console.error('❌ getMyQuizAttempts crash:', err);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ General crash:', err);
    process.exit(1);
  }
};

run();
