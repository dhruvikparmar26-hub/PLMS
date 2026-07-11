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
    // We import seed-prod.js which has the function
    const seedProduction = require('./seed-prod');
    // Run it
    await seedProduction();

    // Now run seed-quizzes.js logic directly
    console.log('🌱 Seeding quizzes...');
    // Since seed-quizzes is a self-running file, we delete it from require cache and run it
    // Wait, let's write a small custom seed logic here to avoid process.exit() from seed-quizzes.js
    const QuizModel = require('../models/Quiz');
    const CourseModel = require('../models/Course');
    
    // Custom quizzes data
    const quizzesData = [
      {
        title: 'React for Beginners: Build Dynamic Web Apps',
        category: 'Web Development',
        difficulty: 'beginner',
        questions: [
          {
            questionText: 'What is the purpose of React useState hook?',
            points: 2,
            difficulty: 'easy',
            options: [
              { text: 'To perform side effects in functional components', isCorrect: false },
              { text: 'To manage state in functional components', isCorrect: true },
              { text: 'To directly manipulate the DOM', isCorrect: false },
              { text: 'To define styles globally', isCorrect: false }
            ]
          },
          {
            questionText: 'Which command is used to create a new React app with Vite?',
            points: 2,
            difficulty: 'easy',
            options: [
              { text: 'npm create vite@latest', isCorrect: true },
              { text: 'npx create-react-app', isCorrect: false },
              { text: 'npm install React', isCorrect: false },
              { text: 'npm run dev', isCorrect: false }
            ]
          },
          {
            questionText: 'What are React props?',
            points: 2,
            difficulty: 'medium',
            options: [
              { text: 'Internal state of a component', isCorrect: false },
              { text: 'CSS styles passed to a component', isCorrect: false },
              { text: 'Data passed down from parent to child component', isCorrect: true },
              { text: 'Methods to interact with the database', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the Virtual DOM in React?',
            points: 2,
            difficulty: 'medium',
            options: [
              { text: 'A direct copy of the HTML DOM', isCorrect: false },
              { text: 'A lightweight in-memory representation of the real DOM', isCorrect: true },
              { text: 'A virtual machine that runs React', isCorrect: false },
              { text: 'A Chrome extension for debugging React', isCorrect: false }
            ]
          },
          {
            questionText: 'When does a React component re-render?',
            points: 2,
            difficulty: 'hard',
            options: [
              { text: 'Only when the parent component forces it', isCorrect: false },
              { text: 'Every 5 seconds automatically', isCorrect: false },
              { text: 'When its state or props change', isCorrect: true },
              { text: 'When the browser window size changes', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'Advanced Node.js and Microservices Architecture',
        category: 'Web Development',
        difficulty: 'advanced',
        questions: [
          {
            questionText: 'Which mechanism does Node.js use to achieve non-blocking I/O operations?',
            points: 3,
            difficulty: 'medium',
            options: [
              { text: 'Multithreading processing model', isCorrect: false },
              { text: 'Event Loop and callback execution queue', isCorrect: true },
              { text: 'Blocking socket calls', isCorrect: false },
              { text: 'Synchronous system processes', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the purpose of worker threads in Node.js?',
            points: 3,
            difficulty: 'medium',
            options: [
              { text: 'To perform database migrations', isCorrect: false },
              { text: 'To execute CPU-intensive JavaScript operations in parallel', isCorrect: true },
              { text: 'To handle incoming HTTP routing', isCorrect: false },
              { text: 'To schedule cron jobs', isCorrect: false }
            ]
          },
          {
            questionText: 'Which pattern is ideal for implementing loose coupling in Node.js microservices?',
            points: 3,
            difficulty: 'hard',
            options: [
              { text: 'Synchronous REST requests', isCorrect: false },
              { text: 'Asymmetric file sharing', isCorrect: false },
              { text: 'Event-driven messaging queue (e.g. RabbitMQ, Kafka)', isCorrect: true },
              { text: 'Shared centralized SQL Database', isCorrect: false }
            ]
          },
          {
            questionText: 'What does the process.nextTick() function do in Node.js?',
            points: 3,
            difficulty: 'hard',
            options: [
              { text: 'Schedules a callback to run on the next event loop iteration', isCorrect: false },
              { text: 'Runs the callback immediately after the current operation finishes, before the event loop continues', isCorrect: true },
              { text: 'Forces the system to delay execution by one tick', isCorrect: false },
              { text: 'Performs a Garbage Collection tick', isCorrect: false }
            ]
          },
          {
            questionText: 'In Node.js, what is the role of Libuv library?',
            points: 3,
            difficulty: 'hard',
            options: [
              { text: 'To compile Javascript into machine code', isCorrect: false },
              { text: 'To style console output logs', isCorrect: false },
              { text: 'To provide cross-platform asynchronous I/O support via threads pool', isCorrect: true },
              { text: 'To validate JSON Web Tokens', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'Introduction to Python and Data Science',
        category: 'Data Science',
        difficulty: 'beginner',
        questions: [
          {
            questionText: 'Which Python library is primary for numerical and matrix calculations?',
            points: 2,
            difficulty: 'easy',
            options: [
              { text: 'Django', isCorrect: false },
              { text: 'NumPy', isCorrect: true },
              { text: 'BeautifulSoup', isCorrect: false },
              { text: 'Flask', isCorrect: false }
            ]
          },
          {
            questionText: 'What is a DataFrame in Pandas?',
            points: 2,
            difficulty: 'easy',
            options: [
              { text: 'A single-dimensional array of numbers', isCorrect: false },
              { text: 'A multi-dimensional database connection', isCorrect: false },
              { text: 'A 2-dimensional labeled data structure with columns of potentially different types', isCorrect: true },
              { text: 'A visualization diagram representation', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the main goal of supervised machine learning?',
            points: 2,
            difficulty: 'medium',
            options: [
              { text: 'To group unlabeled data into clusters', isCorrect: false },
              { text: 'To train a model on labeled inputs to predict outcomes for unseen data', isCorrect: true },
              { text: 'To automatically format source code structure', isCorrect: false },
              { text: 'To compress big data sizes', isCorrect: false }
            ]
          },
          {
            questionText: 'What does the term "Overfitting" mean in Machine Learning?',
            points: 2,
            difficulty: 'medium',
            options: [
              { text: 'When the model performs perfectly on new testing data', isCorrect: false },
              { text: 'When the model is too simple to capture patterns', isCorrect: false },
              { text: 'When the model performs extremely well on training data but poorly on unseen test data', isCorrect: true },
              { text: 'When the model file size exceeds the disk limit', isCorrect: false }
            ]
          },
          {
            questionText: 'Which activation function is commonly used in the output layer of binary classifiers?',
            points: 2,
            difficulty: 'hard',
            options: [
              { text: 'Sigmoid', isCorrect: true },
              { text: 'Softmax', isCorrect: false },
              { text: 'ReLU', isCorrect: false },
              { text: 'Linear', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'Modern UI/UX Design Fundamentals',
        category: 'Design',
        difficulty: 'beginner',
        questions: [
          {
            questionText: 'What does "UX" stand for in product design?',
            points: 2,
            difficulty: 'easy',
            options: [
              { text: 'User Exchange', isCorrect: false },
              { text: 'User Experience', isCorrect: true },
              { text: 'User Xenon', isCorrect: false },
              { text: 'User Extension', isCorrect: false }
            ]
          },
          {
            questionText: 'Which Figma tool is used to create reusable UI elements like components or cards?',
            points: 2,
            difficulty: 'easy',
            options: [
              { text: 'Components', isCorrect: true },
              { text: 'Pen tool', isCorrect: false },
              { text: 'Layers', isCorrect: false },
              { text: 'Canvas', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the primary goal of a wireframe?',
            points: 2,
            difficulty: 'medium',
            options: [
              { text: 'To select the perfect color palette', isCorrect: false },
              { text: 'To establish the basic layout structure and content hierarchy of a screen', isCorrect: true },
              { text: 'To code the frontend page', isCorrect: false },
              { text: 'To record user analytics', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the "Gestalt principle" primarily concerned with in design?',
            points: 2,
            difficulty: 'medium',
            options: [
              { text: 'How users read text from left to right', isCorrect: false },
              { text: 'How human minds perceive visual elements as organized groups or wholes rather than individual parts', isCorrect: true },
              { text: 'How database queries load images', isCorrect: false },
              { text: 'How fonts scale on mobile layouts', isCorrect: false }
            ]
          },
          {
            questionText: 'What is design system accessibility compliance standard commonly called?',
            points: 2,
            difficulty: 'hard',
            options: [
              { text: 'W3C / WCAG', isCorrect: true },
              { text: 'TCPIP', isCorrect: false },
              { text: 'REST API', isCorrect: false },
              { text: 'JSON spec', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'Growth Marketing and SEO Strategy',
        category: 'Marketing',
        difficulty: 'intermediate',
        questions: [
          {
            questionText: 'What does SEO stand for?',
            points: 2,
            difficulty: 'easy',
            options: [
              { text: 'Social Media Optimization', isCorrect: false },
              { text: 'Search Engine Optimization', isCorrect: true },
              { text: 'Software Engineering Operation', isCorrect: false },
              { text: 'Sales Execution Organization', isCorrect: false }
            ]
          },
          {
            questionText: 'Which SEO metric measures the percentage of users who leave a website after viewing only one page?',
            points: 2,
            difficulty: 'easy',
            options: [
              { text: 'Click-Through Rate (CTR)', isCorrect: false },
              { text: 'Bounce Rate', isCorrect: true },
              { text: 'Conversion Rate', isCorrect: false },
              { text: 'Retention Rate', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the purpose of a robots.txt file?',
            points: 2,
            difficulty: 'medium',
            options: [
              { text: 'To store secure password hashes', isCorrect: false },
              { text: 'To instruct search engine crawlers which pages or folders not to scan', isCorrect: true },
              { text: 'To serve custom page styles', isCorrect: false },
              { text: 'To run background system scripts', isCorrect: false }
            ]
          },
          {
            questionText: 'What is a "Backlink" in SEO?',
            points: 2,
            difficulty: 'medium',
            options: [
              { text: 'A link back to the homepage of a website', isCorrect: false },
              { text: 'A hyperlink from another external website pointing to your website', isCorrect: true },
              { text: 'A database join backup key', isCorrect: false },
              { text: 'A broken link leading to a 404 page', isCorrect: false }
            ]
          },
          {
            questionText: 'Which tag tells search engines that multiple URLs have duplicate content and points to the preferred URL?',
            points: 2,
            difficulty: 'hard',
            options: [
              { text: 'Canonical link tag', isCorrect: true },
              { text: 'Robots meta tag', isCorrect: false },
              { text: 'Alt image tag', isCorrect: false },
              { text: 'Noindex tag', isCorrect: false }
            ]
          }
        ]
      }
    ];

    const courses = await CourseModel.find({});
    for (const quizSpec of quizzesData) {
      const matchedCourse = courses.find(c => c.title === quizSpec.title) || courses[0];
      await QuizModel.create({
        course: matchedCourse._id,
        title: quizSpec.title,
        questions: quizSpec.questions,
        passingScore: 70,
        quizType: 'graded'
      });
      console.log(`✅ Seeded quiz matching: "${quizSpec.title}"`);
    }

    console.log('🎉 Reset and seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset error:', err);
    process.exit(1);
  }
};

run();
