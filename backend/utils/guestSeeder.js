const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Concept = require('../models/Concept');
const MasteryScore = require('../models/MasteryScore');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const ActivityLog = require('../models/ActivityLog');

/**
 * Seed guest user data for "Ananya Sharma" (ananya@learnova.com)
 * Pre-populates courses, lessons, enrollments, concepts, masteries, achievements, and activity logs
 * to match the exact visual representation in the reference screenshot.
 */
const seedGuestData = async (user) => {
  const userId = user._id;

  // 1. Set user profile statistics (XP, streak, daily goal)
  await User.findByIdAndUpdate(userId, {
    xp: 2450,
    skillLevel: 'intermediate',
    learningPreferences: ['Web Development', 'Computer Science', 'Databases', 'Machine Learning'],
    hasTakenPlacementQuiz: true,
    dailyGoal: {
      goalType: 'time',
      goalValue: 30,
      currentProgress: 15,
      lastResetDate: new Date(),
    },
  });

  // 2. Find or Create default courses
  const courseData = [
    { title: 'System Design Fundamentals', category: 'Web Development', difficulty: 'intermediate', totalLessons: 24, progress: 75 },
    { title: 'Advanced Algorithms', category: 'Computer Science', difficulty: 'advanced', totalLessons: 20, progress: 40 },
    { title: 'Database Management', category: 'Databases', difficulty: 'beginner', totalLessons: 30, progress: 50 },
    { title: 'Machine Learning Basics', category: 'Machine Learning', difficulty: 'beginner', totalLessons: 18, progress: 28 },
  ];

  const instructorId = new mongoose.Types.ObjectId(); // Mock instructor ID

  for (const c of courseData) {
    let course = await Course.findOne({ title: c.title });
    if (!course) {
      course = await Course.create({
        title: c.title,
        description: `Deep dive into modern ${c.title.toLowerCase()} configurations and architectural baselines.`,
        instructor: instructorId,
        category: c.category,
        difficulty: c.difficulty,
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
      });
    }

    // Create mock lessons for this course if they don't exist
    let lessons = await Lesson.find({ course: course._id });
    if (lessons.length === 0) {
      const lessonPromises = [];
      for (let i = 1; i <= c.totalLessons; i++) {
        lessonPromises.push(
          Lesson.create({
            title: `Chapter ${i}: ${course.title} Calibration`,
            content: `Cognitive lesson contents detailing standard ${course.title.toLowerCase()} specs.`,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            order: i,
            course: course._id,
          })
        );
      }
      lessons = await Promise.all(lessonPromises);
    }

    // Enroll guest user and set progress percentage
    const completedCount = Math.round((c.progress / 100) * c.totalLessons);
    const completedLessonIds = lessons.slice(0, completedCount).map((l) => l._id);

    await Enrollment.findOneAndUpdate(
      { user: userId, course: course._id },
      {
        user: userId,
        course: course._id,
        completedLessons: completedLessonIds,
        progressPercent: c.progress,
        lastAccessed: new Date(),
      },
      { upsert: true, new: true }
    );

    // Also add to User's enrolledCourses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: course._id },
    });
  }

  // 3. Find or Create default concepts
  const conceptsData = [
    { name: 'Arrays', description: 'Contiguous data structures', category: 'Computer Science' },
    { name: 'Trees', description: 'Hierarchical node configurations', category: 'Computer Science' },
    { name: 'Data Structures', description: 'Universal memory layouts', category: 'Computer Science' },
    { name: 'Linked Lists', description: 'Pointer chains', category: 'Computer Science' },
    { name: 'Stacks', description: 'LIFO structures', category: 'Computer Science' },
    { name: 'Queues', description: 'FIFO structures', category: 'Computer Science' },
  ];

  const conceptMap = {};
  for (const con of conceptsData) {
    let concept = await Concept.findOne({ name: con.name });
    if (!concept) {
      concept = await Concept.create(con);
    }
    conceptMap[con.name] = concept;
  }

  // Create mastery scores matching screenshot (Arrays: 90%, Data Structures: 85%, Linked Lists: 80%, Stacks: 75%)
  const masteries = [
    { name: 'Arrays', score: 0.9 },
    { name: 'Data Structures', score: 0.85 },
    { name: 'Linked Lists', score: 0.80 },
    { name: 'Stacks', score: 0.75 },
    { name: 'Trees', score: 0.0 }, // locked
    { name: 'Queues', score: 0.0 }, // locked
  ];

  for (const m of masteries) {
    const concept = conceptMap[m.name];
    if (concept) {
      await MasteryScore.findOneAndUpdate(
        { user: userId, concept: concept._id },
        {
          user: userId,
          concept: concept._id,
          score: m.score,
          decayRate: 0.01,
          lastAssessed: new Date(),
        },
        { upsert: true }
      );
    }
  }

  // 4. Find or Create Achievements and associate with guest user
  const achievementsList = [
    { key: 'seven_day_streak', title: '7 Day Streak', icon: '🔥', description: 'Calibrated study behaviors over 7 consecutive cycles.' },
    { key: 'quick_learner', title: 'Quick Learner', icon: '⚡', description: 'Acquired 5 lesson indexes in under 24 hours.' },
    { key: 'quiz_master', title: 'Quiz Master', icon: '🧠', description: 'Attain a 1.0 accuracy score across 10 evaluation specs.' },
    { key: 'concept_explorer', title: 'Concept Explorer', icon: '🕸', description: 'Resolve and verify 20 cognitive concepts.' },
  ];

  for (const ach of achievementsList) {
    let achievement = await Achievement.findOne({ key: ach.key });
    if (!achievement) {
      achievement = await Achievement.create(ach);
    }

    // Earn all achievements for guest to match the screenshot badge row
    await UserAchievement.findOneAndUpdate(
      { user: userId, achievement: achievement._id },
      { user: userId, achievement: achievement._id, earnedAt: new Date() },
      { upsert: true }
    );
  }

  // 5. Seed consecutive ActivityLogs to construct a valid 12-day streak
  const now = Date.now();
  await ActivityLog.deleteMany({ user: userId }); // Clear logs for guest first

  const activitySpecs = [
    { action: 'note_created', detail: 'System Design Notes', ageDays: 1, xp: 15 },
    { action: 'achievement_unlocked', detail: '7 Day Streak', ageDays: 1, xp: 100 },
    { action: 'flashcard_review', detail: 'Dynamic Programming', ageDays: 0.25, xp: 25 }, // ~6h ago
    { action: 'quiz_completed', detail: 'Arrays and Strings', ageDays: 0.16, xp: 75 }, // ~4h ago
    { action: 'lesson_completed', detail: 'Binary Search Trees', ageDays: 0.08, xp: 50 }, // ~2h ago
  ];

  // Primary active logs for UI activity feed
  for (const spec of activitySpecs) {
    await ActivityLog.create({
      user: userId,
      action: spec.action,
      metadata: {
        detail: spec.detail,
        xpAwarded: spec.xp,
      },
      timestamp: new Date(now - spec.ageDays * 24 * 60 * 60 * 1000),
    });
  }

  // Seed historical logs (1 lesson viewed per day for past 12 days) to build a 12-day activity streak
  for (let i = 0; i < 12; i++) {
    await ActivityLog.create({
      user: userId,
      action: 'lesson_viewed',
      metadata: {
        lessonId: new mongoose.Types.ObjectId(),
        duration: 15,
      },
      timestamp: new Date(now - i * 24 * 60 * 60 * 1000),
    });
  }
};

module.exports = { seedGuestData };
