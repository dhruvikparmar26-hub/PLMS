require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const bcrypt = require('bcryptjs');

    // Get or create test user (student)
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'student',
      });
      console.log('✅ Created test user');
    }

    // Create instructor user
    let instructor = await User.findOne({ email: 'instructor@example.com' });
    if (!instructor) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      instructor = await User.create({
        name: 'John Doe',
        email: 'instructor@example.com',
        password: hashedPassword,
        role: 'instructor',
      });
      console.log('✅ Created instructor user');
    }

    // Create a sample course first (lessons need courseId)
    const course = await Course.create({
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
      category: 'Web Development',
      difficulty: 'beginner',
      instructor: instructor._id,
      thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=60',
      modules: []
    });
    console.log('✅ Created course:', course.title);

    // Create lessons with course
    const lesson1 = await Lesson.create({
      title: 'Introduction to HTML',
      course: course._id,
      content: `
        <h1>Introduction to HTML</h1>
        <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages.</p>
        <h2>Key Concepts</h2>
        <ul>
          <li>HTML elements are the building blocks of HTML pages</li>
          <li>Elements are represented by tags</li>
          <li>Tags label pieces of content such as "heading", "paragraph", "table"</li>
        </ul>
        <h2>Example</h2>
        <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello World&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>
      `,
      order: 1,
      duration: 15,
    });

    const lesson2 = await Lesson.create({
      title: 'CSS Selectors',
      course: course._id,
      content: `
        <h1>CSS Selectors</h1>
        <p>CSS selectors are used to select HTML elements you want to style.</p>
        <h2>Types of Selectors</h2>
        <ul>
          <li>Element selector: h1 { color: blue; }</li>
          <li>Class selector: .my-class { color: red; }</li>
          <li>ID selector: #my-id { color: green; }</li>
        </ul>
      `,
      order: 2,
      duration: 20,
    });
    console.log('✅ Created lessons');

    // Update course with modules containing lesson references
    await Course.findByIdAndUpdate(course._id, {
      modules: [
        {
          title: 'Module 1: HTML Basics',
          lessons: [lesson1._id]
        },
        {
          title: 'Module 2: CSS Styling',
          lessons: [lesson2._id]
        }
      ]
    });

    // Create a quiz for the course
    const quiz = await Quiz.create({
      title: 'HTML Basics Quiz',
      course: course._id,
      questions: [
        {
          questionText: 'What does HTML stand for?',
          options: [
            { text: 'Hyper Text Markup Language', isCorrect: true },
            { text: 'High Tech Modern Language', isCorrect: false },
            { text: 'Hyper Transfer Markup Language', isCorrect: false },
            { text: 'Home Tool Markup Language', isCorrect: false }
          ],
          points: 1,
          difficulty: 'easy'
        },
        {
          questionText: 'Which tag is used for the largest heading?',
          options: [
            { text: '<head>', isCorrect: false },
            { text: '<h6>', isCorrect: false },
            { text: '<h1>', isCorrect: true },
            { text: '<heading>', isCorrect: false }
          ],
          points: 1,
          difficulty: 'easy'
        },
        {
          questionText: 'Which HTML element is used for the largest heading?',
          options: [
            { text: '<h6>', isCorrect: false },
            { text: '<head>', isCorrect: false },
            { text: '<h1>', isCorrect: true },
            { text: '<heading>', isCorrect: false }
          ],
          points: 1,
          difficulty: 'easy'
        }
      ],
      passingScore: 2,
      quizType: 'graded',
    });
    console.log('✅ Created quiz');

    // Enroll user in the course
    const enrollment = await Enrollment.create({
      user: user._id,
      course: course._id,
      progressPercent: 50,
      completedLessons: [lesson1._id],
    });
    console.log('✅ Created enrollment');

    // Create a certificate
    const certificate = await Certificate.create({
      user: user._id,
      course: course._id,
      enrollment: enrollment._id,
    });
    console.log('✅ Created certificate');

    console.log('\n✅ All seed data created successfully!');
    console.log('   Course ID:', course._id);
    console.log('   Lesson ID:', lesson1._id);
    console.log('   Quiz ID:', quiz._id);
    console.log('   Certificate ID:', certificate._id);
    console.log('   Certificate Code:', certificate.verificationCode);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
