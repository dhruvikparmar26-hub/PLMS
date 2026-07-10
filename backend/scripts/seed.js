require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    // 1. Connect to DB
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in env');
    }
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected for Seeding...');

    // 2. Check if database is already seeded (has courses)
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      console.log('📊 Database already has courses. Skipping seeding to preserve existing data.');
      console.log('   To force re-seeding, manually clear the database first.');
      process.exit(0);
    }

    // 3. Clear existing course data (only if DB was empty)
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Enrollment.deleteMany({});
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
    console.log('🧹 Cleared existing courses, lessons, enrollments, quizzes, and attempts.');

    // 4. Find or create an instructor
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      const hashedPassword = await bcrypt.hash('Password123!', 12);
      instructor = await User.create({
        name: 'Jane Doe (Instructor)',
        email: 'jane.instructor@example.com',
        password: hashedPassword,
        role: 'instructor'
      });
      console.log('👤 Created a new instructor user.');
    } else {
      console.log('👤 Using existing instructor user.');
    }

    // 4. Sample Courses
    const courses = [
      {
        title: 'React for Beginners: Build Dynamic Web Apps',
        description: 'Learn the fundamentals of React, including components, props, state, hooks, and routing. Build modern web applications from scratch.',
        category: 'Web Development',
        difficulty: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60'
      },
      {
        title: 'Advanced Node.js and Microservices Architecture',
        description: 'Master backend development using Node.js, Express, and MongoDB. Learn microservices patterns, message queues, and caching with Redis.',
        category: 'Web Development',
        difficulty: 'advanced',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60'
      },
      {
        title: 'Introduction to Python and Data Science',
        description: 'Start your data science journey. Learn Python programming, NumPy, Pandas, Matplotlib, and basic machine learning concepts.',
        category: 'Data Science',
        difficulty: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&auto=format&fit=crop&q=60'
      },
      {
        title: 'Modern UI/UX Design Fundamentals',
        description: 'Understand the principles of good design. Master user research, wireframing, prototyping, and layout structures in Figma.',
        category: 'Design',
        difficulty: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=800&auto=format&fit=crop&q=60'
      },
      {
        title: 'Growth Marketing and SEO Strategy',
        description: 'Accelerate business growth. Learn search engine optimization, content marketing, Google Analytics, and paid advertising fundamentals.',
        category: 'Marketing',
        difficulty: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60'
      },
      {
        title: 'Mastering Machine Learning with TensorFlow',
        description: 'Deep dive into neural networks, deep learning, computer vision, and NLP using Python and TensorFlow libraries.',
        category: 'Data Science',
        difficulty: 'advanced',
        thumbnail: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=60'
      }
    ];

    const createdCourses = [];

    for (let c of courses) {
      // Create Course
      const createdCourse = await Course.create({
        ...c,
        instructor: instructor._id,
        modules: [
          {
            title: 'Module 1: Introduction & Fundamentals',
            lessons: []
          },
          {
            title: 'Module 2: Deep Dive & Build-Along',
            lessons: []
          }
        ]
      });

      // Create lessons for this course
      const lessonsData = [
        {
          title: `Getting Started with ${c.category}`,
          content: `In this lesson, we will explore the absolute basics of ${c.category}, understand what the course is about, and set up our local environment.`,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          order: 1,
          course: createdCourse._id
        },
        {
          title: 'Core Architecture and Principles',
          content: 'Let\'s deep dive into the inner workings, fundamental concepts, terminology, and standard workflows used by professionals.',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          order: 2,
          course: createdCourse._id
        },
        {
          title: 'Building our First Mini-Project',
          content: 'Hands-on practice! Follow along step-by-step as we implement our first real-world solution to reinforce our learning.',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          order: 3,
          course: createdCourse._id
        }
      ];

      const createdLessons = await Lesson.create(lessonsData);

      // Distribute lessons into modules (2 in Module 1, 1 in Module 2)
      createdCourse.modules[0].lessons.push(createdLessons[0]._id, createdLessons[1]._id);
      createdCourse.modules[1].lessons.push(createdLessons[2]._id);
      await createdCourse.save();

      createdCourses.push(createdCourse);
      console.log(`📚 Created course "${c.title}" with 3 lessons.`);
    }

    // 5. Create a sample Quiz for the React course (first course)
    const reactCourse = createdCourses[0];
    await Quiz.create({
      course: reactCourse._id,
      title: 'React Fundamentals Quiz',
      passingScore: 60,
      questions: [
        {
          questionText: 'What hook is used to manage state in a React functional component?',
          points: 10,
          options: [
            { text: 'useEffect', isCorrect: false },
            { text: 'useState', isCorrect: true },
            { text: 'useContext', isCorrect: false },
            { text: 'useRef', isCorrect: false },
          ],
        },
        {
          questionText: 'What does JSX stand for?',
          points: 10,
          options: [
            { text: 'JavaScript XML', isCorrect: true },
            { text: 'Java Syntax Extension', isCorrect: false },
            { text: 'JSON XML Syntax', isCorrect: false },
            { text: 'JavaScript Extension', isCorrect: false },
          ],
        },
        {
          questionText: 'Which method is used to render a React component into the DOM?',
          points: 10,
          options: [
            { text: 'ReactDOM.attach()', isCorrect: false },
            { text: 'React.render()', isCorrect: false },
            { text: 'ReactDOM.createRoot().render()', isCorrect: true },
            { text: 'document.render()', isCorrect: false },
          ],
        },
      ],
    });
    console.log('📝 Created quiz "React Fundamentals Quiz" for React course.');

    // Create a sample Quiz for the Advanced Node.js course
    const nodeCourse = createdCourses[1];
    await Quiz.create({
      course: nodeCourse._id,
      title: 'Node.js & Microservices Quiz',
      passingScore: 60,
      questions: [
        {
          questionText: 'Which module can be used to handle file path operations in Node.js?',
          points: 10,
          options: [
            { text: 'fs', isCorrect: false },
            { text: 'path', isCorrect: true },
            { text: 'url', isCorrect: false },
            { text: 'http', isCorrect: false },
          ],
        },
        {
          questionText: 'What database is commonly paired with Node.js in the MERN stack?',
          points: 10,
          options: [
            { text: 'PostgreSQL', isCorrect: false },
            { text: 'MongoDB', isCorrect: true },
            { text: 'MySQL', isCorrect: false },
            { text: 'Redis', isCorrect: false },
          ],
        },
      ],
    });
    console.log('📝 Created quiz "Node.js & Microservices Quiz" for Node.js course.');

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
