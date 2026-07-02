require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

const seedProduction = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if database already has courses
    const existingCourses = await Course.countDocuments();
    if (existingCourses >= 15) {
      console.log(`⚠ Database already has ${existingCourses} courses. Skipping seeding.`);
      process.exit(0);
    }
    console.log(`📊 Database has ${existingCourses} courses. Adding more to reach minimum 15...`);

    console.log('🌱 Starting production seed...');

    // Get or create instructor
    let instructor = await User.findOne({ email: 'instructor@plms.com' });
    if (!instructor) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Instructor123!', 12);
      instructor = await User.create({
        name: 'PLMS Instructor',
        email: 'instructor@plms.com',
        password: hashedPassword,
        role: 'instructor'
      });
      console.log('✅ Created instructor user');
    }

    // Course data with rich content
    const coursesData = [
      // Web Development (4 courses)
      {
        title: 'React for Beginners: Build Modern Web Apps',
        description: 'Master React fundamentals including components, hooks, state management, and routing. Build real-world applications from scratch while learning best practices and modern patterns.',
        category: 'Web Development',
        difficulty: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Introduction to React', content: 'React is a JavaScript library for building user interfaces. Learn about components, JSX, and the virtual DOM. React makes it painless to create interactive UIs by breaking them into reusable pieces.', order: 1, duration: 20 },
          { title: 'Understanding Components and Props', content: 'Components are the building blocks of React applications. Learn how to create functional components, pass data through props, and compose components together to build complex UIs.', order: 2, duration: 25 },
          { title: 'State and Hooks Fundamentals', content: 'useState and useEffect are the most important React hooks. Learn how to manage component state, handle side effects, and understand the lifecycle of React components.', order: 3, duration: 30 }
        ],
        hasQuiz: true
      },
      {
        title: 'Advanced React Patterns and Performance',
        description: 'Take your React skills to the next level with advanced patterns like context API, custom hooks, code splitting, and performance optimization techniques used in production applications.',
        category: 'Web Development',
        difficulty: 'advanced',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Context API for State Management', content: 'Learn when and how to use React Context to avoid prop drilling. Build a theme provider and understand the trade-offs between Context and state management libraries.', order: 1, duration: 35 },
          { title: 'Custom Hooks for Reusable Logic', content: 'Extract component logic into custom hooks. Learn patterns for data fetching, form handling, and localStorage integration that you can reuse across your application.', order: 2, duration: 40 },
          { title: 'Performance Optimization Techniques', content: 'Master React.memo, useMemo, and useCallback to prevent unnecessary re-renders. Learn about code splitting with React.lazy and Suspense for faster initial loads.', order: 3, duration: 45 }
        ],
        hasQuiz: true
      },
      {
        title: 'Full-Stack Web Development with Node.js',
        description: 'Build complete web applications from frontend to backend. Learn Express.js, REST APIs, MongoDB integration, authentication, and deployment strategies for modern web applications.',
        category: 'Web Development',
        difficulty: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Building REST APIs with Express', content: 'Create robust RESTful APIs using Express.js. Learn routing, middleware, error handling, and how to structure your backend code for scalability.', order: 1, duration: 30 },
          { title: 'MongoDB Integration with Mongoose', content: 'Connect your Express app to MongoDB using Mongoose ODM. Learn schema design, validation, querying, and how to model relationships between data.', order: 2, duration: 35 },
          { title: 'Authentication and Security', content: 'Implement JWT-based authentication, password hashing with bcrypt, and protect your routes. Learn about security best practices including CORS, rate limiting, and input validation.', order: 3, duration: 40 }
        ],
        hasQuiz: true
      },
      {
        title: 'TypeScript for React Developers',
        description: 'Add type safety to your React applications with TypeScript. Learn type definitions, interfaces, generics, and how to integrate TypeScript with existing React projects for better developer experience.',
        category: 'Web Development',
        difficulty: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'TypeScript Basics for React', content: 'Understand TypeScript fundamentals and how they apply to React components. Learn about prop types, state typing, and event handler typing.', order: 1, duration: 25 },
          { title: 'Advanced TypeScript Patterns', content: 'Master generics, utility types, and conditional types. Learn how to create reusable type definitions for your React components and hooks.', order: 2, duration: 30 },
          { title: 'Migrating JavaScript to TypeScript', content: 'Strategies for gradually adding TypeScript to existing React projects. Learn about tsconfig options, type declaration files, and common migration pitfalls.', order: 3, duration: 35 }
        ],
        hasQuiz: false
      },
      // Data Science & AI (3 courses)
      {
        title: 'Python for Data Science Fundamentals',
        description: 'Start your data science journey with Python. Learn NumPy for numerical computing, Pandas for data manipulation, and Matplotlib for visualization. Build a solid foundation for machine learning.',
        category: 'Data Science',
        difficulty: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'NumPy for Numerical Computing', content: 'Learn NumPy arrays, broadcasting, and vectorized operations. Understand how NumPy forms the foundation of the Python data science ecosystem.', order: 1, duration: 30 },
          { title: 'Data Manipulation with Pandas', content: 'Master DataFrames, Series, and data cleaning techniques. Learn to filter, group, merge, and transform data using Pandas powerful methods.', order: 2, duration: 35 },
          { title: 'Data Visualization with Matplotlib', content: 'Create compelling visualizations with Matplotlib. Learn about different plot types, customization, and how to tell stories with your data through charts.', order: 3, duration: 30 }
        ],
        hasQuiz: true
      },
      {
        title: 'Machine Learning with scikit-learn',
        description: 'Build and deploy machine learning models using Python and scikit-learn. Learn supervised and unsupervised learning, model evaluation, and practical techniques for real-world ML applications.',
        category: 'Data Science',
        difficulty: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Supervised Learning Fundamentals', content: 'Learn classification and regression algorithms including linear models, decision trees, and random forests. Understand when to use each algorithm and how to tune hyperparameters.', order: 1, duration: 40 },
          { title: 'Unsupervised Learning Techniques', content: 'Explore clustering algorithms like K-means and hierarchical clustering. Learn dimensionality reduction with PCA and t-SNE for visualizing high-dimensional data.', order: 2, duration: 35 },
          { title: 'Model Evaluation and Validation', content: 'Master cross-validation, confusion matrices, ROC curves, and other evaluation metrics. Learn how to detect overfitting and build robust models.', order: 3, duration: 40 }
        ],
        hasQuiz: true
      },
      {
        title: 'Deep Learning with TensorFlow and Keras',
        description: 'Dive into neural networks and deep learning. Build image classifiers, text processors, and sequence models using TensorFlow and Keras. Understand CNNs, RNNs, and transformer architectures.',
        category: 'Data Science',
        difficulty: 'advanced',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Neural Network Fundamentals', content: 'Understand perceptrons, activation functions, and backpropagation. Build your first neural network for classification using Keras sequential API.', order: 1, duration: 45 },
          { title: 'Convolutional Neural Networks for Images', content: 'Learn CNN architectures including VGG, ResNet, and EfficientNet. Build image classifiers and understand transfer learning with pre-trained models.', order: 2, duration: 50 },
          { title: 'Sequence Models and NLP', content: 'Explore RNNs, LSTMs, and transformer models for text processing. Build sentiment analyzers and text generators using modern NLP techniques.', order: 3, duration: 50 }
        ],
        hasQuiz: true
      },
      // UI/UX Design (2 courses)
      {
        title: 'Modern UI/UX Design Principles',
        description: 'Master the fundamentals of user interface and experience design. Learn user research, wireframing, prototyping, and design systems. Create beautiful, functional interfaces using Figma.',
        category: 'Design',
        difficulty: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'User Research and Discovery', content: 'Learn how to conduct user interviews, surveys, and usability tests. Understand user personas, journey maps, and how to translate research into design decisions.', order: 1, duration: 30 },
          { title: 'Wireframing and Prototyping', content: 'Create low-fidelity wireframes and high-fidelity prototypes. Learn about information architecture, layout principles, and how to iterate on designs based on feedback.', order: 2, duration: 35 },
          { title: 'Design Systems and Components', content: 'Build scalable design systems with reusable components. Learn about color theory, typography, spacing, and how to maintain consistency across large products.', order: 3, duration: 35 }
        ],
        hasQuiz: false
      },
      {
        title: 'Advanced Figma Techniques',
        description: 'Take your Figma skills to the next level. Learn auto-layout, components, variants, interactive prototypes, and design collaboration workflows used by professional design teams.',
        category: 'Design',
        difficulty: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Auto-Layout and Responsive Design', content: 'Master Figma auto-layout for creating responsive designs. Learn constraints, resizing behavior, and how to design for multiple screen sizes efficiently.', order: 1, duration: 30 },
          { title: 'Components, Variants, and Instances', content: 'Create powerful component libraries with variants for different states. Learn about component properties, nested components, and maintaining design consistency.', order: 2, duration: 35 },
          { title: 'Interactive Prototypes and Collaboration', content: 'Build interactive prototypes with smart animate and overlay interactions. Learn about developer handoff, version history, and team collaboration features in Figma.', order: 3, duration: 35 }
        ],
        hasQuiz: false
      },
      // Growth Marketing (2 courses)
      {
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the core principles of digital marketing including SEO, content marketing, social media strategy, and email marketing. Build comprehensive marketing campaigns that drive growth.',
        category: 'Marketing',
        difficulty: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Search Engine Optimization (SEO)', content: 'Understand on-page and off-page SEO techniques. Learn keyword research, technical SEO, link building, and how to improve your search rankings organically.', order: 1, duration: 30 },
          { title: 'Content Marketing Strategy', content: 'Create compelling content that attracts and converts. Learn about content calendars, distribution channels, and measuring content performance with analytics.', order: 2, duration: 30 },
          { title: 'Social Media Marketing', content: 'Develop social media strategies for different platforms. Learn about organic growth, paid advertising, influencer partnerships, and community building.', order: 3, duration: 30 }
        ],
        hasQuiz: true
      },
      {
        title: 'Growth Hacking and Analytics',
        description: 'Master data-driven marketing strategies. Learn A/B testing, conversion rate optimization, customer acquisition cost analysis, and how to scale marketing campaigns efficiently.',
        category: 'Marketing',
        difficulty: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'A/B Testing and Experimentation', content: 'Design and run A/B tests to optimize conversion rates. Learn statistical significance, test design, and how to iterate based on experimental results.', order: 1, duration: 35 },
          { title: 'Conversion Rate Optimization', content: 'Identify and fix conversion bottlenecks. Learn about funnel analysis, user behavior tracking, and optimization techniques for landing pages and checkout flows.', order: 2, duration: 35 },
          { title: 'Marketing Analytics and ROI', content: 'Measure marketing effectiveness with key metrics. Learn about customer lifetime value, attribution models, and how to calculate and optimize marketing ROI.', order: 3, duration: 35 }
        ],
        hasQuiz: false
      },
      // Business & Management (2 courses)
      {
        title: 'Project Management Fundamentals',
        description: 'Learn essential project management skills including planning, execution, monitoring, and closure. Master Agile methodologies, Scrum frameworks, and tools used by modern project teams.',
        category: 'Business',
        difficulty: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Project Planning and Scope', content: 'Define project scope, create work breakdown structures, and develop realistic timelines. Learn about stakeholder management and setting clear project objectives.', order: 1, duration: 30 },
          { title: 'Agile and Scrum Methodologies', content: 'Understand Agile principles and Scrum ceremonies. Learn about sprint planning, daily standups, retrospectives, and how to deliver value incrementally.', order: 2, duration: 30 },
          { title: 'Risk Management and Communication', content: 'Identify project risks and develop mitigation strategies. Learn effective communication techniques for keeping teams and stakeholders aligned throughout the project lifecycle.', order: 3, duration: 30 }
        ],
        hasQuiz: false
      },
      {
        title: 'Leadership and Team Management',
        description: 'Develop leadership skills for managing high-performing teams. Learn about motivation, conflict resolution, delegation, and building positive team culture in remote and in-person environments.',
        category: 'Business',
        difficulty: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Building and Leading Teams', content: 'Learn how to build diverse, high-performing teams. Understand team dynamics, psychological safety, and how to foster collaboration and innovation.', order: 1, duration: 30 },
          { title: 'Effective Communication and Feedback', content: 'Master the art of giving and receiving feedback. Learn about active listening, difficult conversations, and communication styles for different personality types.', order: 2, duration: 30 },
          { title: 'Strategic Decision Making', content: 'Develop frameworks for making tough decisions under uncertainty. Learn about data-driven decision making, risk assessment, and balancing short-term and long-term goals.', order: 3, duration: 30 }
        ],
        hasQuiz: false
      },
      // React Development (2 courses)
      {
        title: 'React Native for Mobile Development',
        description: 'Build native mobile applications using React and JavaScript. Learn React Native fundamentals, navigation, native modules, and how to deploy apps to iOS and Android app stores.',
        category: 'Web Development',
        difficulty: 'intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'React Native Fundamentals', content: 'Learn the differences between React and React Native. Understand core components, styling, and how to build layouts that work on both iOS and Android.', order: 1, duration: 35 },
          { title: 'Navigation and State Management', content: 'Implement navigation with React Navigation. Learn about stack, tab, and drawer navigators, plus state management patterns specific to mobile applications.', order: 2, duration: 35 },
          { title: 'Native Modules and APIs', content: 'Access native device features like camera, location, and push notifications. Learn about native modules, permissions, and integrating with platform-specific APIs.', order: 3, duration: 40 }
        ],
        hasQuiz: true
      },
      {
        title: 'Next.js Production Applications',
        description: 'Build production-ready web applications with Next.js. Learn server-side rendering, static site generation, API routes, and deployment strategies for high-performance React applications.',
        category: 'Web Development',
        difficulty: 'advanced',
        thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format&fit=crop&q=60',
        lessons: [
          { title: 'Server-Side Rendering and SSG', content: 'Understand the differences between SSR and SSG. Learn getServerSideProps, getStaticProps, and when to use each for optimal performance.', order: 1, duration: 35 },
          { title: 'API Routes and Middleware', content: 'Build backend APIs with Next.js API routes. Learn about middleware, authentication, and how to create full-stack applications within Next.js.', order: 2, duration: 35 },
          { title: 'Deployment and Performance', content: 'Deploy Next.js apps to Vercel and other platforms. Learn about image optimization, font optimization, and performance monitoring in production.', order: 3, duration: 35 }
        ],
        hasQuiz: true
      }
    ];

    // Create courses, lessons, and quizzes
    for (const courseData of coursesData) {
      const { hasQuiz, lessons: lessonsData, ...courseFields } = courseData;
      
      // Create course
      const course = await Course.create({
        ...courseFields,
        instructor: instructor._id,
        modules: []
      });
      console.log(`✅ Created course: ${course.title}`);

      // Create lessons
      const createdLessons = [];
      for (const lessonData of lessonsData) {
        const lesson = await Lesson.create({
          ...lessonData,
          course: course._id
        });
        createdLessons.push(lesson);
      }
      console.log(`   ✅ Created ${createdLessons.length} lessons`);

      // Update course with modules
      await Course.findByIdAndUpdate(course._id, {
        modules: [
          {
            title: 'Module 1: Getting Started',
            lessons: createdLessons.map(l => l._id)
          }
        ]
      });

      // Create quiz for courses that need it
      if (hasQuiz) {
        const quiz = await Quiz.create({
          title: `${course.title} - Quiz`,
          course: course._id,
          questions: [
            {
              questionText: `What is the primary focus of ${course.title}?`,
              options: [
                { text: 'Understanding core concepts and fundamentals', isCorrect: true },
                { text: 'Advanced theoretical concepts only', isCorrect: false },
                { text: 'Historical context only', isCorrect: false },
                { text: 'Unrelated topics', isCorrect: false }
              ],
              points: 1,
              difficulty: 'easy'
            },
            {
              questionText: `Which skill is essential for completing ${course.title}?`,
              options: [
                { text: 'Practice and hands-on application', isCorrect: true },
                { text: 'Memorization without practice', isCorrect: false },
                { text: 'Reading only', isCorrect: false },
                { text: 'Watching videos only', isCorrect: false }
              ],
              points: 2,
              difficulty: 'medium'
            },
            {
              questionText: `How would you apply concepts from ${course.title} in a real project?`,
              options: [
                { text: 'By building practical projects and solving real problems', isCorrect: true },
                { text: 'By studying theory only', isCorrect: false },
                { text: 'By avoiding practical application', isCorrect: false },
                { text: 'By copying existing solutions without understanding', isCorrect: false }
              ],
              points: 2,
              difficulty: 'medium'
            },
            {
              questionText: `What is a common challenge when learning ${course.title}?`,
              options: [
                { text: 'Applying concepts to real-world scenarios', isCorrect: true },
                { text: 'Reading documentation', isCorrect: false },
                { text: 'Following tutorials', isCorrect: false },
                { text: 'Understanding basic terminology', isCorrect: false }
              ],
              points: 3,
              difficulty: 'hard'
            },
            {
              questionText: `How can you master ${course.title} effectively?`,
              options: [
                { text: 'Consistent practice, building projects, and continuous learning', isCorrect: true },
                { text: 'Rushing through content', isCorrect: false },
                { text: 'Focusing only on theory', isCorrect: false },
                { text: 'Skipping fundamentals', isCorrect: false }
              ],
              points: 2,
              difficulty: 'medium'
            }
          ],
          passingScore: 3,
          quizType: 'graded'
        });
        console.log(`   ✅ Created quiz`);
      }
    }

    console.log(`\n✅ Production seed complete! Created ${coursesData.length} courses.`);
    console.log(`   - Web Development: 4 courses`);
    console.log(`   - Data Science: 3 courses`);
    console.log(`   - Design: 2 courses`);
    console.log(`   - Marketing: 2 courses`);
    console.log(`   - Business: 2 courses`);
    console.log(`   - React Development: 2 courses`);
    console.log(`   - Total lessons: ${coursesData.reduce((sum, c) => sum + c.lessons.length, 0)}`);
    console.log(`   - Total quizzes: ${coursesData.filter(c => c.hasQuiz).length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding production:', error);
    process.exit(1);
  }
};

seedProduction();
