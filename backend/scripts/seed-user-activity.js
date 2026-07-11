require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

const seedUserActivity = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in env');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for user activity seeding...');

    // 1. Find user named dhruvik or dhruvikparmar26@gmail.com
    let user = await User.findOne({ name: { $regex: 'dhruvik', $options: 'i' } });
    if (!user) {
      user = await User.findOne({ email: 'dhruvikparmar26@gmail.com' });
    }
    if (!user) {
      // Fallback to any user
      user = await User.findOne({});
    }

    if (!user) {
      console.log('❌ No users found in database to seed activity for.');
      process.exit(1);
    }

    console.log(`👤 Found user: "${user.name}" (${user.email}) - ID: ${user._id}`);

    // Clear user's old activities/enrollments/attempts/logs to start fresh
    await Enrollment.deleteMany({ user: user._id });
    await QuizAttempt.deleteMany({ user: user._id });
    await ActivityLog.deleteMany({ user: user._id });
    await Notification.deleteMany({ user: user._id });
    console.log('🧹 Cleared old enrollments, attempts, logs, and notifications for this user.');

    // 2. Fetch all courses and their lessons
    const courses = await Course.find({}).populate('modules.lessons');
    if (courses.length === 0) {
      console.log('❌ No courses found. Run clear-and-seed.js first.');
      process.exit(1);
    }

    console.log(`📚 Found ${courses.length} courses in database.`);

    // Let's pick 3 courses to enroll the user in
    const course1 = courses.find(c => c.title.includes('React for Beginners')) || courses[0];
    const course2 = courses.find(c => c.title.includes('Python and Data Science')) || courses[1] || courses[0];
    const course3 = courses.find(c => c.title.includes('Modern UI/UX Design')) || courses[2] || courses[0];

    // Get all lessons for these courses
    const getLessonsForCourse = (course) => {
      const lessons = [];
      if (course.modules) {
        course.modules.forEach(m => {
          if (m.lessons) {
            m.lessons.forEach(l => lessons.push(l));
          }
        });
      }
      return lessons;
    };

    const lessons1 = getLessonsForCourse(course1);
    const lessons2 = getLessonsForCourse(course2);
    const lessons3 = getLessonsForCourse(course3);

    // 3. Create Course Enrollments
    // Course 1: React for Beginners (100% completed)
    const completedLessonIds1 = lessons1.map(l => l._id);
    const enroll1 = await Enrollment.create({
      user: user._id,
      course: course1._id,
      completedLessons: completedLessonIds1,
      progressPercent: 100,
      lastAccessed: new Date(),
    });
    console.log(`✅ Enrolled user in "${course1.title}" (100% Progress)`);

    // Course 2: Python (66% completed - 2 out of 3 lessons)
    const completedLessonIds2 = lessons2.slice(0, 2).map(l => l._id);
    const enroll2 = await Enrollment.create({
      user: user._id,
      course: course2._id,
      completedLessons: completedLessonIds2,
      progressPercent: Math.round((completedLessonIds2.length / Math.max(lessons2.length, 1)) * 100),
      lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });
    console.log(`✅ Enrolled user in "${course2.title}" (${enroll2.progressPercent}% Progress)`);

    // Course 3: Modern UI/UX (33% completed - 1 out of 3 lessons)
    const completedLessonIds3 = lessons3.slice(0, 1).map(l => l._id);
    const enroll3 = await Enrollment.create({
      user: user._id,
      course: course3._id,
      completedLessons: completedLessonIds3,
      progressPercent: Math.round((completedLessonIds3.length / Math.max(lessons3.length, 1)) * 100),
      lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });
    console.log(`✅ Enrolled user in "${course3.title}" (${enroll3.progressPercent}% Progress)`);

    // 4. Create Quiz Attempts
    // Find quizzes matching these courses
    const quizzes = await Quiz.find({});
    console.log(`📝 Found ${quizzes.length} quizzes in database.`);

    const quiz1 = quizzes.find(q => q.title.includes('React for Beginners')) || quizzes[0];
    const quiz2 = quizzes.find(q => q.title.includes('Python and Data Science')) || quizzes[1] || quizzes[0];

    if (quiz1) {
      await QuizAttempt.create({
        user: user._id,
        quiz: quiz1._id,
        score: 100,
        passed: true,
        attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        answers: quiz1.questions.map((q, idx) => ({
          questionIndex: idx,
          selectedOptionIndex: q.options.findIndex(opt => opt.isCorrect) || 0,
          isCorrect: true
        }))
      });
      console.log(`✅ Created QuizAttempt: 100% on "${quiz1.title}"`);
    }

    if (quiz2) {
      await QuizAttempt.create({
        user: user._id,
        quiz: quiz2._id,
        score: 80,
        passed: true,
        attemptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        answers: quiz2.questions.map((q, idx) => ({
          questionIndex: idx,
          selectedOptionIndex: idx === 0 ? 1 : 0, // make one wrong to get 80%
          isCorrect: idx !== 0
        }))
      });
      console.log(`✅ Created QuizAttempt: 80% on "${quiz2.title}"`);
    }

    // 5. Create Activity Logs (to populate study time charts)
    // Distributed over last 4 weeks (1 week = 7 * 24 * 60 * 60 * 1000)
    const logs = [
      { action: 'course_enrolled', courseId: course1._id, timeSpent: 0, daysAgo: 25 },
      { action: 'lesson_completed', courseId: course1._id, lessonId: lessons1[0]?._id, timeSpent: 1200, daysAgo: 24 },
      { action: 'lesson_completed', courseId: course1._id, lessonId: lessons1[1]?._id, timeSpent: 1800, daysAgo: 22 },
      { action: 'lesson_completed', courseId: course1._id, lessonId: lessons1[2]?._id, timeSpent: 2100, daysAgo: 21 },
      
      { action: 'course_enrolled', courseId: course2._id, timeSpent: 0, daysAgo: 14 },
      { action: 'lesson_completed', courseId: course2._id, lessonId: lessons2[0]?._id, timeSpent: 900, daysAgo: 12 },
      { action: 'lesson_completed', courseId: course2._id, lessonId: lessons2[1]?._id, timeSpent: 1500, daysAgo: 10 },
      { action: 'quiz_attempted', courseId: course2._id, quizId: quiz2?._id, timeSpent: 600, daysAgo: 9 },

      { action: 'course_enrolled', courseId: course3._id, timeSpent: 0, daysAgo: 6 },
      { action: 'lesson_completed', courseId: course3._id, lessonId: lessons3[0]?._id, timeSpent: 1300, daysAgo: 5 },
      { action: 'quiz_attempted', courseId: course1._id, quizId: quiz1?._id, timeSpent: 800, daysAgo: 2 },
    ];

    for (const log of logs) {
      await ActivityLog.create({
        user: user._id,
        action: log.action,
        metadata: {
          courseId: log.courseId,
          lessonId: log.lessonId,
          quizId: log.quizId,
          timeSpent: log.timeSpent,
        },
        timestamp: new Date(Date.now() - log.daysAgo * 24 * 60 * 60 * 1000),
      });
    }
    console.log(`✅ Seeded ${logs.length} activity log entries.`);

    // 6. Create Notifications (bookings, streaks)
    const notifications = [
      {
        user: user._id,
        type: 'course_match',
        message: 'Your onboarding preferences match: "React for Beginners: Build Dynamic Web Apps". Click to enroll now!',
        link: `/courses/${course1._id}`,
        read: false,
      },
      {
        user: user._id,
        type: 'enrollment',
        message: `Successfully enrolled in: "${course1.title}"`,
        link: `/courses/${course1._id}`,
        read: true,
      },
      {
        user: user._id,
        type: 'quiz_completed',
        message: `Quiz completed: 100% score on "${quiz1?.title || 'React Quiz'}"`,
        link: `/learning-log`,
        read: false,
      },
      {
        user: user._id,
        type: 'course_completed',
        message: `Congratulations! You completed "${course1.title}" at 100%. Click to view your Certificate!`,
        link: `/learning-log`,
        read: false,
      }
    ];

    await Notification.insertMany(notifications);
    console.log(`✅ Seeded ${notifications.length} notifications in the bell.`);

    console.log('🎉 Seeding user details completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ User details seeding error:', error);
    process.exit(1);
  }
};

seedUserActivity();
