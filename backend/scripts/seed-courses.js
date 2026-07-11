/**
 * seed-courses.js — Seeds 120+ courses across 22 categories with 4K images,
 * syllabus data, and brief introductions.
 *
 * Usage: node backend/scripts/seed-courses.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// ─── Course Data ──────────────────────────────────────────────────────────────
const allCourses = [
  // ═══════════════════════════ TECHNICAL ═══════════════════════════

  // ── 1. Web Development ──────────────────────────────────────────
  {
    title: 'HTML & CSS Fundamentals',
    briefIntro: 'Build the foundation of every website. Learn semantic HTML5, modern CSS3, Flexbox, Grid, and responsive design from scratch.',
    description: 'Master the building blocks of the web — HTML for structure and CSS for styling. Cover semantic markup, CSS selectors, Flexbox, Grid, animations, and responsive design principles.',
    category: 'Web Development', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'HTML Basics', level: 'beginner', topics: ['Document structure', 'Tags & elements', 'Forms & inputs', 'Semantic HTML5'] },
      { moduleTitle: 'CSS Fundamentals', level: 'beginner', topics: ['Selectors & specificity', 'Box model', 'Colors & typography', 'Units & values'] },
      { moduleTitle: 'Layout Systems', level: 'intermediate', topics: ['Flexbox deep-dive', 'CSS Grid', 'Positioning', 'Float & clear'] },
      { moduleTitle: 'Responsive Design', level: 'intermediate', topics: ['Media queries', 'Mobile-first approach', 'Fluid layouts', 'Viewport units'] },
      { moduleTitle: 'Modern CSS', level: 'advanced', topics: ['CSS Variables', 'Animations & transitions', 'CSS Modules', 'Performance optimization'] },
    ],
    lessons: [
      { title: 'Document Structure & Semantic HTML', content: 'Learn the skeleton of every web page — DOCTYPE, head, body — and how semantic tags like header, nav, main, and footer improve accessibility and SEO.', order: 1, duration: 20 },
      { title: 'CSS Selectors, Box Model & Layout', content: 'Master CSS selectors from basic to advanced, understand the box model, and explore Flexbox and Grid for modern page layouts.', order: 2, duration: 25 },
      { title: 'Responsive Design & Animations', content: 'Build websites that look great on every device using media queries, fluid grids, and add polish with CSS transitions and keyframe animations.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'JavaScript Essential Training',
    briefIntro: 'Learn JavaScript from variables to async/await. Build interactive web applications with the most popular programming language.',
    description: 'Comprehensive JavaScript course covering ES6+ syntax, DOM manipulation, event handling, async programming, and modern tooling for building dynamic web applications.',
    category: 'Web Development', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'JS Basics', level: 'beginner', topics: ['Variables & types', 'Operators', 'Control flow', 'Functions'] },
      { moduleTitle: 'DOM & Events', level: 'beginner', topics: ['DOM traversal', 'Event listeners', 'Form handling', 'Dynamic content'] },
      { moduleTitle: 'ES6+ Features', level: 'intermediate', topics: ['Arrow functions', 'Destructuring', 'Modules', 'Template literals'] },
      { moduleTitle: 'Async JavaScript', level: 'intermediate', topics: ['Callbacks', 'Promises', 'Async/Await', 'Fetch API'] },
      { moduleTitle: 'Advanced Patterns', level: 'advanced', topics: ['Closures', 'Prototypes', 'Design patterns', 'Error handling'] },
    ],
    lessons: [
      { title: 'Variables, Types & Control Flow', content: 'Understand let, const, var, primitive types, operators, conditionals, and loops in JavaScript.', order: 1, duration: 25 },
      { title: 'Functions, DOM & Events', content: 'Write reusable functions, manipulate the DOM, and handle user interactions with event listeners.', order: 2, duration: 30 },
      { title: 'Async Programming & Modern JS', content: 'Master promises, async/await, the Fetch API, and ES6+ features for modern JavaScript development.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'React for Beginners: Build Modern Web Apps',
    briefIntro: 'Master React fundamentals and build interactive UIs. Learn components, hooks, state management, and routing from scratch.',
    description: 'Master React fundamentals including components, hooks, state management, and routing. Build real-world applications from scratch while learning best practices and modern patterns.',
    category: 'Web Development', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'React Basics', level: 'beginner', topics: ['JSX syntax', 'Components', 'Props', 'Rendering lists'] },
      { moduleTitle: 'State & Hooks', level: 'intermediate', topics: ['useState', 'useEffect', 'useRef', 'Custom hooks'] },
      { moduleTitle: 'Routing & Navigation', level: 'intermediate', topics: ['React Router', 'Dynamic routes', 'Nested routes', 'Route guards'] },
      { moduleTitle: 'State Management', level: 'advanced', topics: ['Context API', 'useReducer', 'Redux basics', 'Zustand'] },
      { moduleTitle: 'Production Patterns', level: 'advanced', topics: ['Code splitting', 'Error boundaries', 'Performance', 'Testing'] },
    ],
    lessons: [
      { title: 'Introduction to React & JSX', content: 'React is a JavaScript library for building user interfaces. Learn about components, JSX, and the virtual DOM.', order: 1, duration: 20 },
      { title: 'Components, Props & State', content: 'Components are the building blocks of React. Learn functional components, props, useState, and useEffect hooks.', order: 2, duration: 25 },
      { title: 'Routing, Context & Performance', content: 'Add navigation with React Router, share state with Context API, and optimize rendering performance.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Full-Stack Web Development with Node.js',
    briefIntro: 'Build complete web applications from frontend to backend. Master Express.js, REST APIs, MongoDB, authentication, and deployment.',
    description: 'Build complete web applications from frontend to backend. Learn Express.js, REST APIs, MongoDB integration, authentication, and deployment strategies for modern web applications.',
    category: 'Web Development', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Node.js Basics', level: 'beginner', topics: ['Runtime overview', 'NPM ecosystem', 'File system', 'Modules'] },
      { moduleTitle: 'Express.js', level: 'intermediate', topics: ['Routing', 'Middleware', 'Error handling', 'REST API design'] },
      { moduleTitle: 'MongoDB & Mongoose', level: 'intermediate', topics: ['Schema design', 'CRUD operations', 'Relationships', 'Validation'] },
      { moduleTitle: 'Authentication', level: 'advanced', topics: ['JWT tokens', 'bcrypt hashing', 'Protected routes', 'OAuth basics'] },
      { moduleTitle: 'Deployment', level: 'advanced', topics: ['Environment variables', 'CI/CD pipelines', 'Docker basics', 'Cloud hosting'] },
    ],
    lessons: [
      { title: 'Building REST APIs with Express', content: 'Create robust RESTful APIs using Express.js. Learn routing, middleware, and error handling.', order: 1, duration: 30 },
      { title: 'MongoDB Integration with Mongoose', content: 'Connect Express to MongoDB using Mongoose ODM. Learn schema design, validation, and querying.', order: 2, duration: 35 },
      { title: 'Authentication, Security & Deployment', content: 'Implement JWT auth, bcrypt hashing, CORS, rate limiting, and deploy to production.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Next.js Production Applications',
    briefIntro: 'Build production-ready apps with Next.js. Learn SSR, SSG, API routes, and deployment strategies for high-performance React.',
    description: 'Build production-ready web applications with Next.js. Learn server-side rendering, static site generation, API routes, and deployment for high-performance React applications.',
    category: 'Web Development', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Next.js Fundamentals', level: 'beginner', topics: ['Pages & routing', 'File-based routing', 'Link component', 'Image optimization'] },
      { moduleTitle: 'Data Fetching', level: 'intermediate', topics: ['getStaticProps', 'getServerSideProps', 'ISR', 'SWR'] },
      { moduleTitle: 'API Routes', level: 'intermediate', topics: ['API handlers', 'Middleware', 'Authentication', 'Database integration'] },
      { moduleTitle: 'Advanced Features', level: 'advanced', topics: ['App Router', 'Server Components', 'Streaming', 'Parallel routes'] },
      { moduleTitle: 'Production & Deploy', level: 'advanced', topics: ['Vercel deployment', 'Edge functions', 'Monitoring', 'SEO optimization'] },
    ],
    lessons: [
      { title: 'Server-Side Rendering and SSG', content: 'Understand SSR vs SSG, learn getServerSideProps, getStaticProps, and when to use each.', order: 1, duration: 35 },
      { title: 'API Routes and Middleware', content: 'Build backend APIs with Next.js API routes, middleware, and authentication.', order: 2, duration: 35 },
      { title: 'Deployment and Performance', content: 'Deploy Next.js apps to Vercel, optimize images/fonts, and monitor production performance.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'TypeScript for Modern Development',
    briefIntro: 'Add type safety to your JavaScript projects. Learn TypeScript fundamentals, generics, utility types, and integration with React.',
    description: 'Add type safety to your applications with TypeScript. Learn type definitions, interfaces, generics, and how to integrate TypeScript with React projects.',
    category: 'Web Development', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'TypeScript Basics', level: 'beginner', topics: ['Types & annotations', 'Interfaces', 'Type aliases', 'Enums'] },
      { moduleTitle: 'Functions & Classes', level: 'intermediate', topics: ['Function types', 'Overloads', 'Class types', 'Access modifiers'] },
      { moduleTitle: 'Generics', level: 'intermediate', topics: ['Generic functions', 'Generic classes', 'Constraints', 'Utility types'] },
      { moduleTitle: 'Advanced Types', level: 'advanced', topics: ['Conditional types', 'Mapped types', 'Template literals', 'Type guards'] },
      { moduleTitle: 'TS + React', level: 'advanced', topics: ['Component typing', 'Hook typing', 'Context typing', 'Migration strategies'] },
    ],
    lessons: [
      { title: 'TypeScript Basics & Interfaces', content: 'Understand TypeScript fundamentals and how to define types, interfaces, and type aliases.', order: 1, duration: 25 },
      { title: 'Generics & Utility Types', content: 'Master generics, utility types, and conditional types for reusable type definitions.', order: 2, duration: 30 },
      { title: 'TypeScript with React', content: 'Type React components, hooks, contexts, and learn migration strategies for existing projects.', order: 3, duration: 35 },
    ],
  },

  // ── 2. Data Science ─────────────────────────────────────────────
  {
    title: 'Python for Data Science Fundamentals',
    briefIntro: 'Start your data science journey with Python. Learn NumPy, Pandas, and Matplotlib for data analysis and visualization.',
    description: 'Master Python for data science — NumPy for numerical computing, Pandas for data manipulation, and Matplotlib for visualization.',
    category: 'Data Science', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Python Refresher', level: 'beginner', topics: ['Data types', 'Control flow', 'Functions', 'List comprehensions'] },
      { moduleTitle: 'NumPy', level: 'beginner', topics: ['Arrays', 'Broadcasting', 'Vectorized operations', 'Linear algebra'] },
      { moduleTitle: 'Pandas', level: 'intermediate', topics: ['DataFrames', 'Data cleaning', 'Grouping', 'Merging datasets'] },
      { moduleTitle: 'Visualization', level: 'intermediate', topics: ['Matplotlib', 'Seaborn', 'Plot types', 'Storytelling with data'] },
      { moduleTitle: 'Real Projects', level: 'advanced', topics: ['EDA workflow', 'Data pipelines', 'Report generation', 'Jupyter notebooks'] },
    ],
    lessons: [
      { title: 'NumPy for Numerical Computing', content: 'Learn NumPy arrays, broadcasting, and vectorized operations for fast numerical computations.', order: 1, duration: 30 },
      { title: 'Data Manipulation with Pandas', content: 'Master DataFrames, Series, and data cleaning techniques with Pandas.', order: 2, duration: 35 },
      { title: 'Data Visualization', content: 'Create compelling visualizations with Matplotlib and Seaborn for data storytelling.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Machine Learning with scikit-learn',
    briefIntro: 'Build and deploy ML models using Python and scikit-learn. Learn supervised and unsupervised learning with real-world applications.',
    description: 'Build and deploy machine learning models using Python and scikit-learn. Learn classification, regression, clustering, and model evaluation.',
    category: 'Data Science', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'ML Foundations', level: 'beginner', topics: ['Types of ML', 'Data preprocessing', 'Train/test split', 'Feature scaling'] },
      { moduleTitle: 'Supervised Learning', level: 'intermediate', topics: ['Linear regression', 'Decision trees', 'Random forests', 'SVM'] },
      { moduleTitle: 'Unsupervised Learning', level: 'intermediate', topics: ['K-means', 'Hierarchical clustering', 'PCA', 'DBSCAN'] },
      { moduleTitle: 'Model Evaluation', level: 'advanced', topics: ['Cross-validation', 'Confusion matrix', 'ROC curves', 'Hyperparameter tuning'] },
      { moduleTitle: 'Production ML', level: 'advanced', topics: ['Pipeline design', 'Model serialization', 'A/B testing', 'MLOps basics'] },
    ],
    lessons: [
      { title: 'Supervised Learning Fundamentals', content: 'Learn classification and regression algorithms including linear models, decision trees, and random forests.', order: 1, duration: 40 },
      { title: 'Unsupervised Learning Techniques', content: 'Explore clustering algorithms like K-means and dimensionality reduction with PCA.', order: 2, duration: 35 },
      { title: 'Model Evaluation and Validation', content: 'Master cross-validation, confusion matrices, ROC curves, and hyperparameter tuning.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Deep Learning with TensorFlow',
    briefIntro: 'Dive into neural networks and deep learning. Build image classifiers, NLP models, and understand transformer architectures.',
    description: 'Dive into neural networks and deep learning. Build image classifiers, text processors, and sequence models using TensorFlow and Keras.',
    category: 'Data Science', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Neural Network Basics', level: 'beginner', topics: ['Perceptrons', 'Activation functions', 'Backpropagation', 'Loss functions'] },
      { moduleTitle: 'Keras API', level: 'intermediate', topics: ['Sequential model', 'Functional API', 'Callbacks', 'Model saving'] },
      { moduleTitle: 'CNNs', level: 'intermediate', topics: ['Convolutions', 'Pooling', 'Transfer learning', 'Image classification'] },
      { moduleTitle: 'RNNs & NLP', level: 'advanced', topics: ['LSTM', 'GRU', 'Word embeddings', 'Sentiment analysis'] },
      { moduleTitle: 'Transformers', level: 'advanced', topics: ['Attention mechanism', 'BERT', 'GPT overview', 'Fine-tuning'] },
    ],
    lessons: [
      { title: 'Neural Network Fundamentals', content: 'Understand perceptrons, activation functions, and backpropagation. Build your first neural network.', order: 1, duration: 45 },
      { title: 'CNNs for Image Classification', content: 'Learn CNN architectures, transfer learning with pre-trained models, and build image classifiers.', order: 2, duration: 50 },
      { title: 'Sequence Models and NLP', content: 'Explore RNNs, LSTMs, and transformer models for text processing and sentiment analysis.', order: 3, duration: 50 },
    ],
  },
  {
    title: 'Data Engineering with SQL & ETL',
    briefIntro: 'Learn to build data pipelines and manage databases. Master SQL, ETL processes, and data warehousing fundamentals.',
    description: 'Build robust data pipelines. Learn SQL, ETL processes, data warehousing, and modern data engineering tools and practices.',
    category: 'Data Science', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'SQL Mastery', level: 'beginner', topics: ['SELECT queries', 'JOINs', 'Aggregations', 'Subqueries'] },
      { moduleTitle: 'Database Design', level: 'intermediate', topics: ['Normalization', 'Indexing', 'Stored procedures', 'Views'] },
      { moduleTitle: 'ETL Pipelines', level: 'intermediate', topics: ['Extract patterns', 'Transform logic', 'Load strategies', 'Scheduling'] },
      { moduleTitle: 'Data Warehousing', level: 'advanced', topics: ['Star schema', 'Snowflake schema', 'OLAP vs OLTP', 'Data lakes'] },
      { moduleTitle: 'Modern Tools', level: 'advanced', topics: ['Apache Airflow', 'dbt', 'Spark basics', 'Cloud data platforms'] },
    ],
    lessons: [
      { title: 'Advanced SQL & Database Design', content: 'Master complex SQL queries, JOINs, window functions, and database normalization.', order: 1, duration: 35 },
      { title: 'ETL Pipeline Development', content: 'Design and implement ETL pipelines for extracting, transforming, and loading data.', order: 2, duration: 40 },
      { title: 'Data Warehousing & Modern Tools', content: 'Learn star schemas, data lakes, and tools like Airflow and dbt.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Statistics & Probability for Data Science',
    briefIntro: 'Build a strong statistical foundation. Learn probability, hypothesis testing, regression analysis, and Bayesian thinking.',
    description: 'Essential statistics and probability for data science — hypothesis testing, regression, distributions, and Bayesian methods.',
    category: 'Data Science', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Descriptive Statistics', level: 'beginner', topics: ['Mean, median, mode', 'Variance', 'Standard deviation', 'Distributions'] },
      { moduleTitle: 'Probability', level: 'beginner', topics: ['Probability rules', 'Conditional probability', 'Bayes theorem', 'Random variables'] },
      { moduleTitle: 'Inference', level: 'intermediate', topics: ['Sampling', 'Confidence intervals', 'Hypothesis testing', 'P-values'] },
      { moduleTitle: 'Regression', level: 'intermediate', topics: ['Linear regression', 'Multiple regression', 'Assumptions', 'Diagnostics'] },
      { moduleTitle: 'Advanced Methods', level: 'advanced', topics: ['ANOVA', 'Chi-squared tests', 'Bayesian inference', 'Time series basics'] },
    ],
    lessons: [
      { title: 'Descriptive Statistics & Probability', content: 'Learn measures of central tendency, spread, distributions, and probability fundamentals.', order: 1, duration: 30 },
      { title: 'Hypothesis Testing & Inference', content: 'Master sampling, confidence intervals, hypothesis testing, and p-value interpretation.', order: 2, duration: 35 },
      { title: 'Regression & Advanced Methods', content: 'Build regression models, check assumptions, and explore ANOVA and Bayesian methods.', order: 3, duration: 35 },
    ],
  },

  // ── 3. Mobile Development ───────────────────────────────────────
  {
    title: 'React Native for Mobile Development',
    briefIntro: 'Build native mobile apps using React and JavaScript. Learn cross-platform development for iOS and Android.',
    description: 'Build native mobile applications using React and JavaScript. Learn React Native fundamentals, navigation, native modules, and app store deployment.',
    category: 'Mobile Development', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'RN Basics', level: 'beginner', topics: ['Core components', 'Styling', 'Platform differences', 'Expo setup'] },
      { moduleTitle: 'Navigation', level: 'intermediate', topics: ['Stack navigator', 'Tab navigator', 'Drawer', 'Deep linking'] },
      { moduleTitle: 'State & Data', level: 'intermediate', topics: ['AsyncStorage', 'Redux Toolkit', 'API calls', 'Offline support'] },
      { moduleTitle: 'Native APIs', level: 'advanced', topics: ['Camera', 'Geolocation', 'Push notifications', 'Permissions'] },
      { moduleTitle: 'Publishing', level: 'advanced', topics: ['App signing', 'Play Store', 'App Store', 'OTA updates'] },
    ],
    lessons: [
      { title: 'React Native Fundamentals', content: 'Learn core components, styling, and how to build layouts for both iOS and Android.', order: 1, duration: 35 },
      { title: 'Navigation and State Management', content: 'Implement stack, tab, and drawer navigation with React Navigation.', order: 2, duration: 35 },
      { title: 'Native APIs and Publishing', content: 'Access camera, location, push notifications, and deploy to app stores.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Flutter & Dart Complete Guide',
    briefIntro: 'Build beautiful cross-platform apps with Flutter. Learn Dart, widgets, state management, and Firebase integration.',
    description: 'Master Flutter and Dart for building beautiful, natively compiled apps for mobile, web, and desktop from a single codebase.',
    category: 'Mobile Development', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Dart Language', level: 'beginner', topics: ['Variables & types', 'Functions', 'Classes', 'Async programming'] },
      { moduleTitle: 'Flutter Widgets', level: 'beginner', topics: ['Stateless widgets', 'Stateful widgets', 'Layout widgets', 'Material Design'] },
      { moduleTitle: 'Navigation & State', level: 'intermediate', topics: ['Named routes', 'Provider', 'Riverpod', 'BLoC pattern'] },
      { moduleTitle: 'Firebase Integration', level: 'intermediate', topics: ['Authentication', 'Firestore', 'Storage', 'Cloud functions'] },
      { moduleTitle: 'Advanced Flutter', level: 'advanced', topics: ['Custom painters', 'Animations', 'Platform channels', 'Performance'] },
    ],
    lessons: [
      { title: 'Dart Language & Flutter Basics', content: 'Learn Dart syntax, Flutter widget tree, and build your first cross-platform app.', order: 1, duration: 30 },
      { title: 'State Management & Navigation', content: 'Master Provider, Riverpod, and navigation patterns in Flutter apps.', order: 2, duration: 35 },
      { title: 'Firebase & Advanced Features', content: 'Integrate Firebase services and build production-quality Flutter apps.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'iOS Development with Swift',
    briefIntro: 'Create native iOS applications with Swift and SwiftUI. Learn Apple frameworks, UI design, and App Store publishing.',
    description: 'Build native iOS applications with Swift and SwiftUI. Master UIKit, SwiftUI, Core Data, and App Store submission process.',
    category: 'Mobile Development', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Swift Basics', level: 'beginner', topics: ['Syntax', 'Optionals', 'Collections', 'Protocols'] },
      { moduleTitle: 'SwiftUI', level: 'intermediate', topics: ['Views', 'Modifiers', 'State', 'Navigation'] },
      { moduleTitle: 'Data Persistence', level: 'intermediate', topics: ['Core Data', 'UserDefaults', 'Keychain', 'CloudKit'] },
      { moduleTitle: 'Networking', level: 'advanced', topics: ['URLSession', 'Codable', 'REST APIs', 'WebSockets'] },
      { moduleTitle: 'App Store', level: 'advanced', topics: ['TestFlight', 'App review', 'In-app purchases', 'Analytics'] },
    ],
    lessons: [
      { title: 'Swift Language & SwiftUI Basics', content: 'Learn Swift syntax, optionals, protocols, and build UIs with SwiftUI.', order: 1, duration: 35 },
      { title: 'Data Persistence & Networking', content: 'Store data with Core Data, make API calls, and handle JSON with Codable.', order: 2, duration: 35 },
      { title: 'Publishing to the App Store', content: 'Test with TestFlight, prepare for review, and submit your app to the App Store.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Android Development with Kotlin',
    briefIntro: 'Build Android apps with Kotlin and Jetpack Compose. Learn modern Android architecture, Room, and Google Play deployment.',
    description: 'Master Android development with Kotlin, Jetpack Compose, Room database, and modern architecture patterns.',
    category: 'Mobile Development', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Kotlin Basics', level: 'beginner', topics: ['Null safety', 'Data classes', 'Coroutines', 'Extensions'] },
      { moduleTitle: 'Jetpack Compose', level: 'intermediate', topics: ['Composables', 'State', 'Theming', 'Layouts'] },
      { moduleTitle: 'Architecture', level: 'intermediate', topics: ['MVVM', 'ViewModel', 'LiveData', 'Repository pattern'] },
      { moduleTitle: 'Data & Network', level: 'advanced', topics: ['Room database', 'Retrofit', 'Hilt DI', 'WorkManager'] },
      { moduleTitle: 'Publishing', level: 'advanced', topics: ['Google Play Console', 'App bundles', 'Crash reporting', 'CI/CD'] },
    ],
    lessons: [
      { title: 'Kotlin & Jetpack Compose', content: 'Learn Kotlin essentials and build modern UIs with Jetpack Compose.', order: 1, duration: 35 },
      { title: 'Architecture & Data Layer', content: 'Implement MVVM with ViewModel, Room database, and Retrofit for networking.', order: 2, duration: 40 },
      { title: 'Testing & Publishing', content: 'Write unit tests, UI tests, and publish your app to Google Play Store.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Progressive Web Apps (PWAs)',
    briefIntro: 'Build installable web apps that work offline. Learn service workers, caching strategies, and push notifications.',
    description: 'Create Progressive Web Apps that combine the best of web and mobile. Learn service workers, offline support, and app-like experiences.',
    category: 'Mobile Development', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'PWA Basics', level: 'beginner', topics: ['Web app manifest', 'HTTPS requirement', 'Responsive design', 'App shell'] },
      { moduleTitle: 'Service Workers', level: 'intermediate', topics: ['Lifecycle', 'Fetch events', 'Cache API', 'Background sync'] },
      { moduleTitle: 'Offline Strategies', level: 'intermediate', topics: ['Cache-first', 'Network-first', 'Stale-while-revalidate', 'IndexedDB'] },
      { moduleTitle: 'Advanced Features', level: 'advanced', topics: ['Push notifications', 'Web Share API', 'Bluetooth', 'File System API'] },
      { moduleTitle: 'Performance', level: 'advanced', topics: ['Lighthouse audits', 'Bundle optimization', 'Lazy loading', 'Workbox'] },
    ],
    lessons: [
      { title: 'PWA Fundamentals & Manifest', content: 'Create a web app manifest, set up HTTPS, and build an app shell architecture.', order: 1, duration: 30 },
      { title: 'Service Workers & Caching', content: 'Implement service workers, caching strategies, and offline-first functionality.', order: 2, duration: 35 },
      { title: 'Push Notifications & Performance', content: 'Add push notifications, optimize with Lighthouse, and deploy PWAs.', order: 3, duration: 35 },
    ],
  },

  // ── 4. Cloud Computing ──────────────────────────────────────────
  {
    title: 'AWS Cloud Practitioner Essentials',
    briefIntro: 'Get started with Amazon Web Services. Learn core services, pricing, security, and prepare for the AWS certification.',
    description: 'Comprehensive introduction to AWS cloud services — EC2, S3, Lambda, IAM, and preparing for the Cloud Practitioner certification.',
    category: 'Cloud Computing', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Cloud Concepts', level: 'beginner', topics: ['Cloud computing models', 'Deployment models', 'AWS global infrastructure', 'Shared responsibility'] },
      { moduleTitle: 'Core Services', level: 'beginner', topics: ['EC2', 'S3', 'RDS', 'VPC'] },
      { moduleTitle: 'Security & IAM', level: 'intermediate', topics: ['IAM users & roles', 'Security groups', 'KMS', 'CloudTrail'] },
      { moduleTitle: 'Serverless', level: 'intermediate', topics: ['Lambda', 'API Gateway', 'DynamoDB', 'Step Functions'] },
      { moduleTitle: 'Pricing & Support', level: 'advanced', topics: ['Free tier', 'Cost optimization', 'Support plans', 'Well-Architected Framework'] },
    ],
    lessons: [
      { title: 'Cloud Concepts & Core Services', content: 'Understand cloud computing models and explore EC2, S3, RDS, and VPC.', order: 1, duration: 30 },
      { title: 'Security, IAM & Serverless', content: 'Configure IAM, security groups, and build serverless apps with Lambda.', order: 2, duration: 35 },
      { title: 'Pricing, Architecture & Exam Prep', content: 'Optimize costs, apply the Well-Architected Framework, and prepare for certification.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Microsoft Azure Fundamentals',
    briefIntro: 'Learn Microsoft Azure cloud services. Explore compute, storage, networking, and prepare for the AZ-900 exam.',
    description: 'Master Microsoft Azure fundamentals including compute, storage, networking, and Azure Active Directory.',
    category: 'Cloud Computing', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Azure Basics', level: 'beginner', topics: ['Cloud concepts', 'Azure portal', 'Resource groups', 'Subscriptions'] },
      { moduleTitle: 'Compute', level: 'intermediate', topics: ['Virtual machines', 'App Service', 'Azure Functions', 'Container instances'] },
      { moduleTitle: 'Storage', level: 'intermediate', topics: ['Blob storage', 'Table storage', 'Queue storage', 'Azure Files'] },
      { moduleTitle: 'Networking', level: 'advanced', topics: ['Virtual networks', 'Load balancer', 'VPN Gateway', 'CDN'] },
      { moduleTitle: 'Identity & Security', level: 'advanced', topics: ['Azure AD', 'RBAC', 'Key Vault', 'Azure Policy'] },
    ],
    lessons: [
      { title: 'Azure Portal & Core Services', content: 'Navigate the Azure portal and understand resource groups, VMs, and App Service.', order: 1, duration: 30 },
      { title: 'Storage & Networking', content: 'Configure blob storage, virtual networks, load balancers, and CDN.', order: 2, duration: 35 },
      { title: 'Identity, Security & Exam Prep', content: 'Set up Azure AD, RBAC, Key Vault, and prepare for the AZ-900 certification.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Google Cloud Platform (GCP) Basics',
    briefIntro: 'Explore Google Cloud Platform services. Learn Compute Engine, Cloud Storage, BigQuery, and GCP best practices.',
    description: 'Get started with Google Cloud Platform — Compute Engine, Cloud Storage, BigQuery, Kubernetes Engine, and best practices.',
    category: 'Cloud Computing', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'GCP Overview', level: 'beginner', topics: ['Console walkthrough', 'Projects', 'Billing', 'Cloud Shell'] },
      { moduleTitle: 'Compute', level: 'intermediate', topics: ['Compute Engine', 'Cloud Functions', 'App Engine', 'Cloud Run'] },
      { moduleTitle: 'Data Services', level: 'intermediate', topics: ['Cloud Storage', 'Cloud SQL', 'BigQuery', 'Pub/Sub'] },
      { moduleTitle: 'Containers', level: 'advanced', topics: ['GKE', 'Container Registry', 'Cloud Build', 'Anthos'] },
      { moduleTitle: 'ML & AI', level: 'advanced', topics: ['Vertex AI', 'AutoML', 'Vision API', 'Natural Language API'] },
    ],
    lessons: [
      { title: 'GCP Console & Compute Services', content: 'Set up projects, use Cloud Shell, and deploy apps on Compute Engine and App Engine.', order: 1, duration: 35 },
      { title: 'Data Services & BigQuery', content: 'Store data in Cloud Storage, query with BigQuery, and set up Cloud SQL.', order: 2, duration: 35 },
      { title: 'Containers & AI Services', content: 'Deploy containers on GKE and explore Vertex AI and Vision API.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Kubernetes in Production',
    briefIntro: 'Master container orchestration with Kubernetes. Learn deployments, services, scaling, and cluster management.',
    description: 'Master Kubernetes for production workloads — pods, deployments, services, ingress, Helm charts, and cluster management.',
    category: 'Cloud Computing', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'K8s Fundamentals', level: 'beginner', topics: ['Pods', 'ReplicaSets', 'Deployments', 'Namespaces'] },
      { moduleTitle: 'Networking', level: 'intermediate', topics: ['Services', 'Ingress', 'Network policies', 'DNS'] },
      { moduleTitle: 'Storage & Config', level: 'intermediate', topics: ['Volumes', 'PersistentVolumes', 'ConfigMaps', 'Secrets'] },
      { moduleTitle: 'Scaling', level: 'advanced', topics: ['HPA', 'VPA', 'Cluster autoscaler', 'Resource quotas'] },
      { moduleTitle: 'Operations', level: 'advanced', topics: ['Helm', 'Monitoring', 'Logging', 'Security best practices'] },
    ],
    lessons: [
      { title: 'Pods, Deployments & Services', content: 'Understand K8s architecture, create pods, deployments, and expose services.', order: 1, duration: 40 },
      { title: 'Storage, Config & Networking', content: 'Configure volumes, ConfigMaps, Secrets, and set up ingress controllers.', order: 2, duration: 40 },
      { title: 'Scaling, Helm & Monitoring', content: 'Auto-scale workloads, manage with Helm charts, and set up monitoring.', order: 3, duration: 45 },
    ],
  },
  {
    title: 'Serverless Architecture Patterns',
    briefIntro: 'Design and build serverless applications. Learn Lambda, API Gateway, event-driven architecture, and cost optimization.',
    description: 'Design serverless applications using AWS Lambda, API Gateway, DynamoDB, and event-driven architecture patterns.',
    category: 'Cloud Computing', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Serverless Concepts', level: 'beginner', topics: ['FaaS overview', 'Cold starts', 'Pricing model', 'Use cases'] },
      { moduleTitle: 'AWS Lambda', level: 'intermediate', topics: ['Function handlers', 'Layers', 'Environment variables', 'IAM roles'] },
      { moduleTitle: 'API Design', level: 'intermediate', topics: ['API Gateway', 'REST vs GraphQL', 'Auth strategies', 'Rate limiting'] },
      { moduleTitle: 'Event-Driven', level: 'advanced', topics: ['SNS/SQS', 'EventBridge', 'Step Functions', 'Choreography vs orchestration'] },
      { moduleTitle: 'Production', level: 'advanced', topics: ['Serverless Framework', 'SAM', 'Monitoring', 'Cost optimization'] },
    ],
    lessons: [
      { title: 'Lambda Functions & API Gateway', content: 'Create serverless functions, configure API Gateway, and manage environments.', order: 1, duration: 35 },
      { title: 'Event-Driven Architecture', content: 'Design event-driven systems with SNS, SQS, EventBridge, and Step Functions.', order: 2, duration: 40 },
      { title: 'Deployment & Cost Optimization', content: 'Deploy with SAM/Serverless Framework and optimize for cost and performance.', order: 3, duration: 35 },
    ],
  },

  // ── 5. Cybersecurity ────────────────────────────────────────────
  {
    title: 'Cybersecurity Fundamentals',
    briefIntro: 'Learn the foundations of cybersecurity. Understand threats, vulnerabilities, encryption, and security best practices.',
    description: 'Comprehensive introduction to cybersecurity — threats, vulnerabilities, encryption, firewalls, and security best practices.',
    category: 'Cybersecurity', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Security Basics', level: 'beginner', topics: ['CIA triad', 'Threat landscape', 'Attack vectors', 'Risk assessment'] },
      { moduleTitle: 'Cryptography', level: 'intermediate', topics: ['Symmetric encryption', 'Asymmetric encryption', 'Hashing', 'Digital signatures'] },
      { moduleTitle: 'Network Security', level: 'intermediate', topics: ['Firewalls', 'IDS/IPS', 'VPNs', 'Network monitoring'] },
      { moduleTitle: 'Web Security', level: 'advanced', topics: ['XSS', 'SQL injection', 'CSRF', 'OWASP Top 10'] },
      { moduleTitle: 'Incident Response', level: 'advanced', topics: ['Detection', 'Containment', 'Recovery', 'Forensics basics'] },
    ],
    lessons: [
      { title: 'Security Principles & Cryptography', content: 'Learn the CIA triad, threat models, symmetric/asymmetric encryption, and hashing.', order: 1, duration: 30 },
      { title: 'Network & Web Security', content: 'Configure firewalls, understand IDS/IPS, and protect against OWASP Top 10 vulnerabilities.', order: 2, duration: 35 },
      { title: 'Incident Response & Forensics', content: 'Develop incident response plans and learn basic digital forensics techniques.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Ethical Hacking & Penetration Testing',
    briefIntro: 'Learn ethical hacking methodologies. Master reconnaissance, scanning, exploitation, and penetration testing reports.',
    description: 'Master ethical hacking techniques — reconnaissance, scanning, exploitation, and professional penetration testing.',
    category: 'Cybersecurity', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Methodology', level: 'beginner', topics: ['Pen test phases', 'Scope & rules', 'Legal considerations', 'Reporting'] },
      { moduleTitle: 'Reconnaissance', level: 'intermediate', topics: ['OSINT', 'DNS enumeration', 'Port scanning', 'Service detection'] },
      { moduleTitle: 'Exploitation', level: 'intermediate', topics: ['Metasploit', 'Buffer overflows', 'Privilege escalation', 'Lateral movement'] },
      { moduleTitle: 'Web App Testing', level: 'advanced', topics: ['Burp Suite', 'SQL injection', 'XSS exploitation', 'API testing'] },
      { moduleTitle: 'Advanced Techniques', level: 'advanced', topics: ['Social engineering', 'Wireless attacks', 'Active Directory', 'Cloud pentesting'] },
    ],
    lessons: [
      { title: 'Pen Test Methodology & Recon', content: 'Learn phases of penetration testing, OSINT, DNS enumeration, and port scanning.', order: 1, duration: 40 },
      { title: 'Exploitation & Privilege Escalation', content: 'Use Metasploit, exploit vulnerabilities, and escalate privileges on target systems.', order: 2, duration: 45 },
      { title: 'Web App & Advanced Attacks', content: 'Test web apps with Burp Suite, exploit SQL injection/XSS, and test cloud environments.', order: 3, duration: 45 },
    ],
  },
  {
    title: 'Network Security & Firewalls', briefIntro: 'Protect network infrastructure. Learn firewall configuration, IDS/IPS, VPNs, and network monitoring.',
    description: 'Secure network infrastructure — firewall configuration, intrusion detection, VPN setup, and traffic monitoring.',
    category: 'Cybersecurity', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Network Fundamentals', level: 'beginner', topics: ['OSI model', 'TCP/IP', 'Protocols', 'Subnetting'] },
      { moduleTitle: 'Firewalls', level: 'intermediate', topics: ['Packet filtering', 'Stateful inspection', 'Application firewalls', 'Rules management'] },
      { moduleTitle: 'IDS/IPS', level: 'intermediate', topics: ['Snort', 'Suricata', 'Signature vs anomaly', 'Alert management'] },
      { moduleTitle: 'VPNs', level: 'advanced', topics: ['IPSec', 'OpenVPN', 'WireGuard', 'Site-to-site vs remote'] },
      { moduleTitle: 'Monitoring', level: 'advanced', topics: ['Wireshark', 'NetFlow', 'SIEM basics', 'Threat hunting'] },
    ],
    lessons: [
      { title: 'Network Fundamentals & Firewalls', content: 'Review OSI model, TCP/IP, and configure packet filtering and stateful firewalls.', order: 1, duration: 35 },
      { title: 'Intrusion Detection & VPNs', content: 'Deploy Snort/Suricata IDS, manage alerts, and set up VPN tunnels.', order: 2, duration: 35 },
      { title: 'Traffic Monitoring & Threat Hunting', content: 'Analyze traffic with Wireshark, set up SIEM, and practice threat hunting.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Application Security (AppSec)', briefIntro: 'Secure your applications from design to deployment. Learn secure coding, SAST, DAST, and DevSecOps practices.',
    description: 'Build secure applications — secure coding practices, SAST/DAST tools, threat modeling, and DevSecOps integration.',
    category: 'Cybersecurity', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Secure Coding', level: 'beginner', topics: ['Input validation', 'Output encoding', 'Error handling', 'Logging'] },
      { moduleTitle: 'OWASP Top 10', level: 'intermediate', topics: ['Injection', 'Broken auth', 'Sensitive data', 'XSS'] },
      { moduleTitle: 'Testing Tools', level: 'intermediate', topics: ['SAST tools', 'DAST tools', 'SCA', 'Fuzzing'] },
      { moduleTitle: 'Threat Modeling', level: 'advanced', topics: ['STRIDE', 'Attack trees', 'Data flow diagrams', 'Risk scoring'] },
      { moduleTitle: 'DevSecOps', level: 'advanced', topics: ['Pipeline security', 'Container scanning', 'Secrets management', 'Compliance'] },
    ],
    lessons: [
      { title: 'Secure Coding & OWASP', content: 'Write secure code, validate inputs, and understand the OWASP Top 10.', order: 1, duration: 35 },
      { title: 'Security Testing Tools', content: 'Use SAST, DAST, and SCA tools to find vulnerabilities in your applications.', order: 2, duration: 35 },
      { title: 'Threat Modeling & DevSecOps', content: 'Apply STRIDE threat modeling and integrate security into CI/CD pipelines.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Cloud Security & Compliance', briefIntro: 'Secure cloud environments across AWS, Azure, and GCP. Learn IAM, encryption, compliance frameworks, and incident response.',
    description: 'Secure cloud environments — IAM best practices, encryption, compliance frameworks, and cloud-native security tools.',
    category: 'Cybersecurity', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Cloud Security Basics', level: 'beginner', topics: ['Shared responsibility', 'Cloud risks', 'Security controls', 'Compliance overview'] },
      { moduleTitle: 'Identity & Access', level: 'intermediate', topics: ['IAM policies', 'MFA', 'SSO', 'Least privilege'] },
      { moduleTitle: 'Data Protection', level: 'intermediate', topics: ['Encryption at rest', 'Encryption in transit', 'Key management', 'DLP'] },
      { moduleTitle: 'Compliance', level: 'advanced', topics: ['SOC 2', 'HIPAA', 'GDPR', 'PCI DSS'] },
      { moduleTitle: 'Incident Response', level: 'advanced', topics: ['Cloud forensics', 'Log analysis', 'Automated response', 'War room procedures'] },
    ],
    lessons: [
      { title: 'Cloud Security Fundamentals', content: 'Understand shared responsibility, configure IAM, and implement MFA.', order: 1, duration: 35 },
      { title: 'Data Protection & Encryption', content: 'Encrypt data at rest and in transit, manage keys, and implement DLP policies.', order: 2, duration: 40 },
      { title: 'Compliance & Incident Response', content: 'Map to SOC 2/HIPAA/GDPR and build cloud incident response playbooks.', order: 3, duration: 40 },
    ],
  },

  // ── 6. DevOps ───────────────────────────────────────────────────
  {
    title: 'Git & GitHub for Teams',
    briefIntro: 'Master version control with Git. Learn branching strategies, pull requests, CI/CD integration, and team collaboration.',
    description: 'Master Git version control and GitHub workflows — branching, merging, pull requests, and CI/CD pipelines.',
    category: 'DevOps', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Git Basics', level: 'beginner', topics: ['Init, add, commit', 'Branching', 'Merging', 'Remote repos'] },
      { moduleTitle: 'GitHub Workflows', level: 'intermediate', topics: ['Pull requests', 'Code review', 'Issues', 'Projects'] },
      { moduleTitle: 'Branching Strategies', level: 'intermediate', topics: ['Git Flow', 'GitHub Flow', 'Trunk-based', 'Release branches'] },
      { moduleTitle: 'CI/CD', level: 'advanced', topics: ['GitHub Actions', 'Workflows', 'Testing automation', 'Deployment'] },
      { moduleTitle: 'Advanced Git', level: 'advanced', topics: ['Rebase', 'Cherry-pick', 'Bisect', 'Submodules'] },
    ],
    lessons: [
      { title: 'Git Fundamentals', content: 'Initialize repos, stage changes, create branches, merge, and work with remotes.', order: 1, duration: 25 },
      { title: 'GitHub Collaboration', content: 'Create pull requests, conduct code reviews, and manage projects with Issues.', order: 2, duration: 30 },
      { title: 'CI/CD & Advanced Git', content: 'Set up GitHub Actions, automate tests, and master rebase and cherry-pick.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Docker & Containerization',
    briefIntro: 'Containerize applications with Docker. Learn images, containers, Docker Compose, and multi-stage builds.',
    description: 'Master Docker for containerizing applications — images, containers, Docker Compose, networking, and production best practices.',
    category: 'DevOps', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Docker Basics', level: 'beginner', topics: ['Containers vs VMs', 'Docker CLI', 'Images', 'Dockerfile'] },
      { moduleTitle: 'Image Building', level: 'intermediate', topics: ['Multi-stage builds', 'Layer caching', '.dockerignore', 'Best practices'] },
      { moduleTitle: 'Docker Compose', level: 'intermediate', topics: ['Service definition', 'Networking', 'Volumes', 'Environment variables'] },
      { moduleTitle: 'Networking & Storage', level: 'advanced', topics: ['Bridge networks', 'Overlay networks', 'Named volumes', 'Bind mounts'] },
      { moduleTitle: 'Production', level: 'advanced', topics: ['Security scanning', 'Resource limits', 'Health checks', 'Orchestration overview'] },
    ],
    lessons: [
      { title: 'Docker Fundamentals', content: 'Understand containers, write Dockerfiles, and build/run images.', order: 1, duration: 30 },
      { title: 'Docker Compose & Networking', content: 'Define multi-container apps, configure networks, and manage data with volumes.', order: 2, duration: 35 },
      { title: 'Production Best Practices', content: 'Optimize images, add health checks, scan for vulnerabilities, and prepare for production.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'CI/CD Pipeline Mastery',
    briefIntro: 'Automate your software delivery pipeline. Learn Jenkins, GitHub Actions, testing automation, and deployment strategies.',
    description: 'Build automated CI/CD pipelines with Jenkins and GitHub Actions. Learn testing automation, deployment strategies, and monitoring.',
    category: 'DevOps', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1537884944318-390069bb8665?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'CI/CD Concepts', level: 'beginner', topics: ['Continuous integration', 'Continuous delivery', 'Continuous deployment', 'Pipeline stages'] },
      { moduleTitle: 'GitHub Actions', level: 'intermediate', topics: ['Workflow syntax', 'Jobs & steps', 'Secrets', 'Matrix builds'] },
      { moduleTitle: 'Testing Automation', level: 'intermediate', topics: ['Unit tests', 'Integration tests', 'E2E tests', 'Code coverage'] },
      { moduleTitle: 'Deployment Strategies', level: 'advanced', topics: ['Blue/green', 'Canary', 'Rolling updates', 'Feature flags'] },
      { moduleTitle: 'Monitoring', level: 'advanced', topics: ['Deployment tracking', 'Rollback strategies', 'Alerts', 'Metrics'] },
    ],
    lessons: [
      { title: 'CI/CD Concepts & GitHub Actions', content: 'Understand pipeline stages and build workflows with GitHub Actions.', order: 1, duration: 30 },
      { title: 'Testing Automation', content: 'Automate unit, integration, and E2E tests in your pipeline with code coverage.', order: 2, duration: 35 },
      { title: 'Deployment & Monitoring', content: 'Implement blue/green and canary deployments with monitoring and rollback.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Infrastructure as Code with Terraform',
    briefIntro: 'Manage infrastructure with code using Terraform. Learn HCL, providers, modules, state management, and best practices.',
    description: 'Manage cloud infrastructure with Terraform — HCL syntax, providers, modules, state management, and multi-cloud deployments.',
    category: 'DevOps', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Terraform Basics', level: 'beginner', topics: ['HCL syntax', 'Resources', 'Providers', 'Init/plan/apply'] },
      { moduleTitle: 'State Management', level: 'intermediate', topics: ['Remote state', 'State locking', 'Import', 'State manipulation'] },
      { moduleTitle: 'Modules', level: 'intermediate', topics: ['Module structure', 'Input/output', 'Registry modules', 'Versioning'] },
      { moduleTitle: 'Advanced Features', level: 'advanced', topics: ['Workspaces', 'Dynamic blocks', 'Provisioners', 'Data sources'] },
      { moduleTitle: 'Best Practices', level: 'advanced', topics: ['Code organization', 'Terragrunt', 'Policy as code', 'CI/CD integration'] },
    ],
    lessons: [
      { title: 'Terraform Basics & HCL', content: 'Write HCL, define resources, configure providers, and run init/plan/apply.', order: 1, duration: 35 },
      { title: 'State, Modules & Workspaces', content: 'Manage remote state, create reusable modules, and organize with workspaces.', order: 2, duration: 40 },
      { title: 'Advanced Patterns & CI/CD', content: 'Use dynamic blocks, policy as code, Terragrunt, and integrate with pipelines.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Linux System Administration',
    briefIntro: 'Master Linux for DevOps and sysadmin roles. Learn command line, file systems, user management, and shell scripting.',
    description: 'Master Linux system administration — command line, file systems, user management, networking, and shell scripting.',
    category: 'DevOps', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Linux Basics', level: 'beginner', topics: ['Terminal navigation', 'File operations', 'Permissions', 'Package managers'] },
      { moduleTitle: 'User Management', level: 'beginner', topics: ['Users & groups', 'sudo', 'SSH keys', 'Access control'] },
      { moduleTitle: 'Shell Scripting', level: 'intermediate', topics: ['Bash basics', 'Variables', 'Loops', 'Functions'] },
      { moduleTitle: 'System Services', level: 'intermediate', topics: ['systemd', 'Cron jobs', 'Log management', 'Process management'] },
      { moduleTitle: 'Networking', level: 'advanced', topics: ['Network config', 'iptables', 'DNS', 'Performance tuning'] },
    ],
    lessons: [
      { title: 'Command Line & File Systems', content: 'Navigate the terminal, manage files, set permissions, and install packages.', order: 1, duration: 25 },
      { title: 'Users, SSH & Shell Scripting', content: 'Manage users, set up SSH keys, and write Bash scripts for automation.', order: 2, duration: 30 },
      { title: 'Services, Networking & Performance', content: 'Configure systemd services, set up cron, manage iptables, and tune performance.', order: 3, duration: 35 },
    ],
  },

  // ── 7. Artificial Intelligence ──────────────────────────────────
  {
    title: 'Introduction to Artificial Intelligence',
    briefIntro: 'Understand AI concepts, history, and applications. Learn about search algorithms, knowledge representation, and intelligent agents.',
    description: 'Explore the foundations of AI — intelligent agents, search algorithms, knowledge representation, and practical applications.',
    category: 'Artificial Intelligence', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'AI Foundations', level: 'beginner', topics: ['What is AI', 'History', 'Types of AI', 'Applications'] },
      { moduleTitle: 'Search Algorithms', level: 'intermediate', topics: ['BFS/DFS', 'A* search', 'Heuristics', 'Game trees'] },
      { moduleTitle: 'Knowledge Systems', level: 'intermediate', topics: ['Logic', 'Expert systems', 'Ontologies', 'Reasoning'] },
      { moduleTitle: 'Machine Learning Intro', level: 'advanced', topics: ['Supervised vs unsupervised', 'Neural networks', 'Training', 'Evaluation'] },
      { moduleTitle: 'Ethics & Future', level: 'advanced', topics: ['Bias in AI', 'Explainability', 'Regulation', 'AGI debate'] },
    ],
    lessons: [
      { title: 'AI History & Intelligent Agents', content: 'Explore the history of AI, types of intelligent agents, and real-world applications.', order: 1, duration: 25 },
      { title: 'Search Algorithms & Knowledge', content: 'Implement search algorithms, understand heuristics, and explore knowledge representation.', order: 2, duration: 35 },
      { title: 'ML Basics & AI Ethics', content: 'Introduction to machine learning concepts, neural networks, and ethical considerations.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Natural Language Processing (NLP)',
    briefIntro: 'Process and understand human language with AI. Learn tokenization, sentiment analysis, NER, and transformer models.',
    description: 'Master NLP — tokenization, embeddings, sentiment analysis, named entity recognition, and transformer-based models.',
    category: 'Artificial Intelligence', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1655720828018-edd71b56760d?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Text Processing', level: 'beginner', topics: ['Tokenization', 'Stemming', 'Lemmatization', 'Stop words'] },
      { moduleTitle: 'Text Representation', level: 'intermediate', topics: ['Bag of words', 'TF-IDF', 'Word2Vec', 'GloVe'] },
      { moduleTitle: 'NLP Tasks', level: 'intermediate', topics: ['Sentiment analysis', 'NER', 'POS tagging', 'Text classification'] },
      { moduleTitle: 'Transformers', level: 'advanced', topics: ['Attention mechanism', 'BERT', 'GPT', 'Fine-tuning'] },
      { moduleTitle: 'Applications', level: 'advanced', topics: ['Chatbots', 'Translation', 'Summarization', 'Question answering'] },
    ],
    lessons: [
      { title: 'Text Processing & Representation', content: 'Tokenize text, apply stemming/lemmatization, and create text representations.', order: 1, duration: 35 },
      { title: 'NLP Tasks & Classification', content: 'Build sentiment analyzers, NER systems, and text classifiers.', order: 2, duration: 40 },
      { title: 'Transformers & Applications', content: 'Fine-tune BERT/GPT models for chatbots, translation, and summarization.', order: 3, duration: 45 },
    ],
  },
  {
    title: 'Computer Vision Fundamentals',
    briefIntro: 'Teach machines to see. Learn image processing, object detection, image segmentation, and deep learning for vision tasks.',
    description: 'Build computer vision applications — image processing, object detection, segmentation, and deep learning for vision.',
    category: 'Artificial Intelligence', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Image Basics', level: 'beginner', topics: ['Pixels & color', 'Image formats', 'OpenCV basics', 'Transformations'] },
      { moduleTitle: 'Feature Extraction', level: 'intermediate', topics: ['Edge detection', 'Corners', 'Histograms', 'Template matching'] },
      { moduleTitle: 'Object Detection', level: 'intermediate', topics: ['YOLO', 'SSD', 'R-CNN', 'Anchor boxes'] },
      { moduleTitle: 'Segmentation', level: 'advanced', topics: ['Semantic segmentation', 'Instance segmentation', 'U-Net', 'Mask R-CNN'] },
      { moduleTitle: 'Advanced Vision', level: 'advanced', topics: ['GANs', 'Style transfer', 'Video analysis', 'Real-time processing'] },
    ],
    lessons: [
      { title: 'Image Processing with OpenCV', content: 'Work with images, apply transformations, and extract features using OpenCV.', order: 1, duration: 30 },
      { title: 'Object Detection & Classification', content: 'Build object detectors using YOLO and SSD architectures.', order: 2, duration: 40 },
      { title: 'Segmentation & Advanced Topics', content: 'Implement segmentation with U-Net and explore GANs and style transfer.', order: 3, duration: 45 },
    ],
  },
  {
    title: 'Reinforcement Learning',
    briefIntro: 'Train agents to make decisions. Learn Q-learning, policy gradients, deep RL, and build game-playing AI.',
    description: 'Train intelligent agents through rewards — Q-learning, policy gradients, deep RL, and game-playing AI systems.',
    category: 'Artificial Intelligence', difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'RL Basics', level: 'beginner', topics: ['Agent-environment', 'Rewards', 'Policies', 'Value functions'] },
      { moduleTitle: 'Tabular Methods', level: 'intermediate', topics: ['Q-learning', 'SARSA', 'Monte Carlo', 'TD learning'] },
      { moduleTitle: 'Function Approximation', level: 'intermediate', topics: ['DQN', 'Experience replay', 'Target networks', 'Double DQN'] },
      { moduleTitle: 'Policy Methods', level: 'advanced', topics: ['REINFORCE', 'Actor-Critic', 'PPO', 'A3C'] },
      { moduleTitle: 'Applications', level: 'advanced', topics: ['Game AI', 'Robotics', 'Trading', 'Multi-agent RL'] },
    ],
    lessons: [
      { title: 'RL Fundamentals & Q-Learning', content: 'Understand the agent-environment loop, rewards, and implement Q-learning.', order: 1, duration: 40 },
      { title: 'Deep RL & DQN', content: 'Build DQN agents, understand experience replay, and target network updates.', order: 2, duration: 45 },
      { title: 'Policy Gradients & Applications', content: 'Implement PPO, Actor-Critic, and build game-playing AI agents.', order: 3, duration: 45 },
    ],
  },
  {
    title: 'Prompt Engineering & LLMs',
    briefIntro: 'Master the art of prompting large language models. Learn prompt design, chain-of-thought, RAG, and fine-tuning strategies.',
    description: 'Master prompt engineering for LLMs — prompt design patterns, chain-of-thought, RAG architecture, and fine-tuning strategies.',
    category: 'Artificial Intelligence', difficulty: 'intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1694903089222-aaec5dbd6543?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'LLM Basics', level: 'beginner', topics: ['How LLMs work', 'Tokenization', 'Temperature', 'API usage'] },
      { moduleTitle: 'Prompt Patterns', level: 'intermediate', topics: ['Zero-shot', 'Few-shot', 'System prompts', 'Role prompting'] },
      { moduleTitle: 'Advanced Prompting', level: 'intermediate', topics: ['Chain-of-thought', 'Tree-of-thought', 'Self-consistency', 'ReAct'] },
      { moduleTitle: 'RAG', level: 'advanced', topics: ['Embeddings', 'Vector databases', 'Retrieval strategies', 'Context window'] },
      { moduleTitle: 'Fine-Tuning', level: 'advanced', topics: ['LoRA', 'RLHF', 'Dataset preparation', 'Evaluation metrics'] },
    ],
    lessons: [
      { title: 'LLM Fundamentals & API Usage', content: 'Understand how LLMs work, use APIs, and learn about tokenization and parameters.', order: 1, duration: 25 },
      { title: 'Prompt Patterns & Chain-of-Thought', content: 'Master zero-shot, few-shot, chain-of-thought, and other advanced prompting techniques.', order: 2, duration: 30 },
      { title: 'RAG & Fine-Tuning', content: 'Build RAG pipelines with vector databases and learn LoRA fine-tuning strategies.', order: 3, duration: 35 },
    ],
  },

  // ── 8. Blockchain ───────────────────────────────────────────────
  {
    title: 'Blockchain Fundamentals', briefIntro: 'Understand blockchain technology from the ground up. Learn distributed ledgers, consensus, cryptography, and use cases.',
    description: 'Understand blockchain technology — distributed ledgers, consensus mechanisms, cryptographic hashing, and real-world applications.',
    category: 'Blockchain', difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Blockchain Basics', level: 'beginner', topics: ['Distributed ledgers', 'Blocks & chains', 'Hashing', 'Decentralization'] },
      { moduleTitle: 'Consensus', level: 'intermediate', topics: ['Proof of Work', 'Proof of Stake', 'DPoS', 'BFT'] },
      { moduleTitle: 'Cryptocurrencies', level: 'intermediate', topics: ['Bitcoin mechanics', 'Ethereum', 'Wallets', 'Transactions'] },
      { moduleTitle: 'Smart Contracts', level: 'advanced', topics: ['Solidity basics', 'Contract deployment', 'Gas optimization', 'Security'] },
      { moduleTitle: 'Use Cases', level: 'advanced', topics: ['DeFi', 'NFTs', 'Supply chain', 'Identity management'] },
    ],
    lessons: [
      { title: 'Distributed Ledgers & Cryptography', content: 'Understand how blockchain works, hashing algorithms, and decentralization.', order: 1, duration: 25 },
      { title: 'Consensus Mechanisms & Crypto', content: 'Explore PoW, PoS, and how Bitcoin and Ethereum process transactions.', order: 2, duration: 30 },
      { title: 'Smart Contracts & DeFi', content: 'Write basic Solidity smart contracts and explore DeFi, NFTs, and supply chain uses.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Solidity & Smart Contract Development', briefIntro: 'Build decentralized applications on Ethereum. Master Solidity, Hardhat, testing, and DeFi protocol development.',
    description: 'Build decentralized applications — Solidity programming, Hardhat, testing, deployment, and DeFi protocol development.',
    category: 'Blockchain', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Solidity Basics', level: 'beginner', topics: ['Data types', 'Functions', 'Modifiers', 'Events'] },
      { moduleTitle: 'Advanced Solidity', level: 'intermediate', topics: ['Inheritance', 'Interfaces', 'Libraries', 'Assembly'] },
      { moduleTitle: 'Development Tools', level: 'intermediate', topics: ['Hardhat', 'Testing', 'Deployment', 'Verification'] },
      { moduleTitle: 'DeFi Development', level: 'advanced', topics: ['ERC-20 tokens', 'AMMs', 'Lending protocols', 'Yield farming'] },
      { moduleTitle: 'Security', level: 'advanced', topics: ['Reentrancy', 'Flash loans', 'Auditing', 'Formal verification'] },
    ],
    lessons: [
      { title: 'Solidity Fundamentals', content: 'Learn Solidity data types, functions, modifiers, events, and inheritance.', order: 1, duration: 35 },
      { title: 'Hardhat & Testing', content: 'Set up Hardhat, write unit tests, deploy contracts, and verify on Etherscan.', order: 2, duration: 35 },
      { title: 'DeFi Protocols & Security', content: 'Build ERC-20 tokens, AMMs, and learn about reentrancy and audit practices.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Web3 & dApp Development', briefIntro: 'Connect frontends to smart contracts. Learn ethers.js, wallet integration, IPFS, and building full-stack dApps.',
    description: 'Build full-stack dApps — ethers.js, wallet integration, IPFS, The Graph, and decentralized frontend development.',
    category: 'Blockchain', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Web3 Basics', level: 'beginner', topics: ['ethers.js', 'Providers', 'Signers', 'Contract ABI'] },
      { moduleTitle: 'Wallet Integration', level: 'intermediate', topics: ['MetaMask', 'WalletConnect', 'Transaction signing', 'Network switching'] },
      { moduleTitle: 'IPFS & Storage', level: 'intermediate', topics: ['IPFS basics', 'Pinata', 'Arweave', 'Decentralized storage'] },
      { moduleTitle: 'The Graph', level: 'advanced', topics: ['Subgraphs', 'GraphQL queries', 'Event indexing', 'Hosted service'] },
      { moduleTitle: 'Full-Stack dApp', level: 'advanced', topics: ['React + ethers', 'State management', 'Error handling', 'Gas estimation'] },
    ],
    lessons: [
      { title: 'ethers.js & Contract Interaction', content: 'Connect to Ethereum, read/write to contracts, and handle transactions.', order: 1, duration: 30 },
      { title: 'Wallets & Decentralized Storage', content: 'Integrate MetaMask, store files on IPFS, and manage user sessions.', order: 2, duration: 35 },
      { title: 'Building a Full-Stack dApp', content: 'Build a React + ethers.js dApp with The Graph for data indexing.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'NFT Development & Marketplaces', briefIntro: 'Create and sell NFTs. Learn ERC-721, metadata standards, marketplace smart contracts, and royalty mechanisms.',
    description: 'Create NFT collections — ERC-721/ERC-1155, metadata, marketplace contracts, royalties, and minting strategies.',
    category: 'Blockchain', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1646463535673-4d0a12e56e77?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'NFT Basics', level: 'beginner', topics: ['ERC-721', 'ERC-1155', 'Metadata', 'Token URI'] },
      { moduleTitle: 'Minting', level: 'intermediate', topics: ['Lazy minting', 'Batch minting', 'Whitelist', 'Reveal mechanism'] },
      { moduleTitle: 'Marketplace', level: 'intermediate', topics: ['Listing', 'Bidding', 'Escrow', 'Fees'] },
      { moduleTitle: 'Royalties', level: 'advanced', topics: ['ERC-2981', 'On-chain royalties', 'Marketplace enforcement', 'Splits'] },
      { moduleTitle: 'Advanced', level: 'advanced', topics: ['Generative art', 'Dynamic NFTs', 'Cross-chain', 'Gaming NFTs'] },
    ],
    lessons: [
      { title: 'ERC-721 & NFT Standards', content: 'Implement ERC-721, set up metadata and token URIs with IPFS.', order: 1, duration: 30 },
      { title: 'Minting & Marketplace Contracts', content: 'Build minting with whitelists, lazy minting, and marketplace escrow logic.', order: 2, duration: 40 },
      { title: 'Royalties & Advanced NFTs', content: 'Implement ERC-2981 royalties, dynamic NFTs, and generative art collections.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'DeFi Protocol Design', briefIntro: 'Design decentralized finance protocols. Learn AMMs, lending, yield farming, and governance token mechanics.',
    description: 'Design DeFi protocols — automated market makers, lending platforms, yield farming, and governance mechanisms.',
    category: 'Blockchain', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'DeFi Overview', level: 'beginner', topics: ['DeFi ecosystem', 'Liquidity', 'TVL', 'Protocol types'] },
      { moduleTitle: 'AMMs', level: 'intermediate', topics: ['Constant product formula', 'Liquidity pools', 'Impermanent loss', 'Price oracles'] },
      { moduleTitle: 'Lending', level: 'intermediate', topics: ['Collateral', 'Interest rates', 'Liquidations', 'Flash loans'] },
      { moduleTitle: 'Yield Farming', level: 'advanced', topics: ['Staking', 'LP rewards', 'Compounding', 'Tokenomics'] },
      { moduleTitle: 'Governance', level: 'advanced', topics: ['DAO structure', 'Voting mechanisms', 'Timelocks', 'Treasury management'] },
    ],
    lessons: [
      { title: 'DeFi Ecosystem & AMMs', content: 'Understand DeFi landscape and implement constant product market makers.', order: 1, duration: 40 },
      { title: 'Lending Protocols & Flash Loans', content: 'Build lending contracts with collateral management and liquidation mechanisms.', order: 2, duration: 45 },
      { title: 'Yield Farming & Governance', content: 'Design yield farming strategies, staking mechanisms, and DAO governance.', order: 3, duration: 45 },
    ],
  },

  // ── 9. Database Management ──────────────────────────────────────
  {
    title: 'SQL Mastery: From Zero to Hero', briefIntro: 'Master SQL for data management. Learn queries, joins, subqueries, window functions, and database optimization.',
    description: 'Complete SQL course — queries, joins, subqueries, window functions, indexing, and query optimization.',
    category: 'Database Management', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'SQL Basics', level: 'beginner', topics: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'] },
      { moduleTitle: 'Joins & Subqueries', level: 'intermediate', topics: ['INNER JOIN', 'LEFT/RIGHT JOIN', 'Subqueries', 'CTEs'] },
      { moduleTitle: 'Aggregations', level: 'intermediate', topics: ['GROUP BY', 'HAVING', 'Aggregate functions', 'Window functions'] },
      { moduleTitle: 'DDL & Design', level: 'advanced', topics: ['CREATE/ALTER', 'Normalization', 'Constraints', 'Indexing'] },
      { moduleTitle: 'Optimization', level: 'advanced', topics: ['EXPLAIN plans', 'Query tuning', 'Partitioning', 'Stored procedures'] },
    ],
    lessons: [
      { title: 'SELECT, WHERE & Joins', content: 'Write SELECT queries, filter with WHERE, and combine tables with JOIN.', order: 1, duration: 25 },
      { title: 'Aggregations & Window Functions', content: 'Use GROUP BY, HAVING, and powerful window functions like ROW_NUMBER and LAG.', order: 2, duration: 30 },
      { title: 'Design & Optimization', content: 'Normalize databases, create indexes, and optimize query performance.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'MongoDB & NoSQL Databases', briefIntro: 'Learn document-based databases with MongoDB. Master CRUD, aggregation pipelines, indexing, and schema design.',
    description: 'Master MongoDB — CRUD operations, aggregation pipelines, indexing, schema design, and Atlas cloud deployment.',
    category: 'Database Management', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'MongoDB Basics', level: 'beginner', topics: ['Documents', 'Collections', 'CRUD', 'Data types'] },
      { moduleTitle: 'Querying', level: 'intermediate', topics: ['Query operators', 'Projection', 'Sorting', 'Pagination'] },
      { moduleTitle: 'Aggregation', level: 'intermediate', topics: ['Pipeline stages', '$match', '$group', '$lookup'] },
      { moduleTitle: 'Schema Design', level: 'advanced', topics: ['Embedding vs referencing', 'Patterns', 'Denormalization', 'Schema validation'] },
      { moduleTitle: 'Operations', level: 'advanced', topics: ['Indexing', 'Replication', 'Sharding', 'Atlas deployment'] },
    ],
    lessons: [
      { title: 'CRUD & Querying', content: 'Perform CRUD operations, use query operators, and handle projections.', order: 1, duration: 25 },
      { title: 'Aggregation Pipelines', content: 'Build aggregation pipelines with $match, $group, $lookup, and $unwind.', order: 2, duration: 35 },
      { title: 'Schema Design & Operations', content: 'Design efficient schemas, create indexes, and deploy on MongoDB Atlas.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'PostgreSQL Advanced Features', briefIntro: 'Go beyond basic SQL with PostgreSQL. Learn advanced types, full-text search, JSONB, extensions, and performance tuning.',
    description: 'Advanced PostgreSQL — JSONB, full-text search, window functions, extensions, partitioning, and performance tuning.',
    category: 'Database Management', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1489875347897-49f64b51c1f8?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Advanced Types', level: 'intermediate', topics: ['JSONB', 'Arrays', 'Ranges', 'Custom types'] },
      { moduleTitle: 'Full-Text Search', level: 'intermediate', topics: ['tsvector', 'tsquery', 'Rankings', 'Dictionaries'] },
      { moduleTitle: 'Extensions', level: 'advanced', topics: ['PostGIS', 'pg_trgm', 'pg_stat', 'Foreign data wrappers'] },
      { moduleTitle: 'Partitioning', level: 'advanced', topics: ['Range partitioning', 'List partitioning', 'Hash partitioning', 'Partition pruning'] },
      { moduleTitle: 'Performance', level: 'advanced', topics: ['EXPLAIN ANALYZE', 'Index types', 'Connection pooling', 'Vacuum tuning'] },
    ],
    lessons: [
      { title: 'JSONB & Advanced Types', content: 'Work with JSONB documents, arrays, ranges, and custom types in PostgreSQL.', order: 1, duration: 35 },
      { title: 'Full-Text Search & Extensions', content: 'Implement full-text search, use PostGIS for geospatial queries, and explore extensions.', order: 2, duration: 40 },
      { title: 'Partitioning & Performance', content: 'Partition large tables, analyze query plans, and tune PostgreSQL performance.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Redis for Caching & Real-Time Data', briefIntro: 'Master Redis for high-performance caching. Learn data structures, pub/sub, streams, and distributed caching patterns.',
    description: 'Master Redis — data structures, caching patterns, pub/sub messaging, streams, and distributed system patterns.',
    category: 'Database Management', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Redis Basics', level: 'beginner', topics: ['Key-value operations', 'Strings', 'Lists', 'Sets'] },
      { moduleTitle: 'Data Structures', level: 'intermediate', topics: ['Hashes', 'Sorted sets', 'HyperLogLog', 'Bitmaps'] },
      { moduleTitle: 'Caching Patterns', level: 'intermediate', topics: ['Cache-aside', 'Write-through', 'TTL strategies', 'Eviction policies'] },
      { moduleTitle: 'Messaging', level: 'advanced', topics: ['Pub/Sub', 'Streams', 'Consumer groups', 'Event sourcing'] },
      { moduleTitle: 'Clustering', level: 'advanced', topics: ['Sentinel', 'Cluster mode', 'Replication', 'Persistence'] },
    ],
    lessons: [
      { title: 'Redis Data Structures', content: 'Learn strings, lists, sets, hashes, and sorted sets in Redis.', order: 1, duration: 25 },
      { title: 'Caching Patterns & TTL', content: 'Implement cache-aside, write-through, and configure TTL and eviction.', order: 2, duration: 30 },
      { title: 'Pub/Sub & Clustering', content: 'Build messaging with pub/sub and streams, set up Sentinel and clustering.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Database Design & Modeling', briefIntro: 'Design efficient databases from scratch. Learn ER diagrams, normalization, denormalization, and migration strategies.',
    description: 'Design efficient databases — ER diagrams, normalization, denormalization patterns, migration strategies, and schema evolution.',
    category: 'Database Management', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'ER Modeling', level: 'beginner', topics: ['Entities', 'Relationships', 'Cardinality', 'ER diagrams'] },
      { moduleTitle: 'Normalization', level: 'intermediate', topics: ['1NF', '2NF', '3NF', 'BCNF'] },
      { moduleTitle: 'Physical Design', level: 'intermediate', topics: ['Data types', 'Constraints', 'Indexes', 'Views'] },
      { moduleTitle: 'Denormalization', level: 'advanced', topics: ['When to denormalize', 'Materialized views', 'Summary tables', 'Trade-offs'] },
      { moduleTitle: 'Evolution', level: 'advanced', topics: ['Migrations', 'Schema versioning', 'Zero-downtime changes', 'Multi-tenancy'] },
    ],
    lessons: [
      { title: 'ER Diagrams & Relationships', content: 'Model entities, define relationships, and create ER diagrams.', order: 1, duration: 25 },
      { title: 'Normalization & Physical Design', content: 'Apply 1NF through BCNF, choose data types, and create constraints.', order: 2, duration: 30 },
      { title: 'Denormalization & Migration', content: 'Strategically denormalize, create migrations, and evolve schemas safely.', order: 3, duration: 30 },
    ],
  },

  // ── 10. Game Development ────────────────────────────────────────
  {
    title: 'Unity Game Development for Beginners', briefIntro: 'Create 2D and 3D games with Unity. Learn C#, game physics, UI, and publish to multiple platforms.',
    description: 'Build 2D and 3D games with Unity — C# scripting, physics, UI, animations, and multi-platform publishing.',
    category: 'Game Development', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Unity Basics', level: 'beginner', topics: ['Interface', 'GameObjects', 'Components', 'Scenes'] },
      { moduleTitle: 'C# Scripting', level: 'beginner', topics: ['Variables', 'Functions', 'MonoBehaviour', 'Input handling'] },
      { moduleTitle: '2D Games', level: 'intermediate', topics: ['Sprites', 'Tilemaps', '2D physics', 'Platformer mechanics'] },
      { moduleTitle: '3D Games', level: 'intermediate', topics: ['3D models', 'Lighting', 'Camera', 'Character controllers'] },
      { moduleTitle: 'Publishing', level: 'advanced', topics: ['Build settings', 'Platform optimization', 'App stores', 'Analytics'] },
    ],
    lessons: [
      { title: 'Unity Interface & C# Basics', content: 'Navigate Unity editor, create GameObjects, and write basic C# scripts.', order: 1, duration: 30 },
      { title: '2D Game Mechanics', content: 'Build 2D platformers with sprites, tilemaps, physics, and player controls.', order: 2, duration: 40 },
      { title: '3D Games & Publishing', content: 'Create 3D scenes with lighting, cameras, and publish to multiple platforms.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Unreal Engine 5 Essentials', briefIntro: 'Build AAA-quality games with Unreal Engine 5. Learn Blueprints, Nanite, Lumen, and real-time rendering.',
    description: 'Create stunning games with UE5 — Blueprints, Nanite, Lumen, MetaHumans, and real-time rendering techniques.',
    category: 'Game Development', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'UE5 Basics', level: 'beginner', topics: ['Editor layout', 'Actors', 'Levels', 'Navigation'] },
      { moduleTitle: 'Blueprints', level: 'intermediate', topics: ['Variables', 'Functions', 'Events', 'Interfaces'] },
      { moduleTitle: 'Rendering', level: 'intermediate', topics: ['Nanite', 'Lumen', 'Materials', 'Post-processing'] },
      { moduleTitle: 'Gameplay', level: 'advanced', topics: ['Character movement', 'AI controllers', 'Animation', 'Multiplayer basics'] },
      { moduleTitle: 'Advanced', level: 'advanced', topics: ['MetaHumans', 'Niagara particles', 'World partition', 'Optimization'] },
    ],
    lessons: [
      { title: 'UE5 Editor & Blueprints', content: 'Navigate UE5, create levels, and build game logic with visual Blueprints.', order: 1, duration: 35 },
      { title: 'Nanite, Lumen & Materials', content: 'Use Nanite for geometry, Lumen for lighting, and create PBR materials.', order: 2, duration: 40 },
      { title: 'Gameplay & Advanced Features', content: 'Implement character controllers, AI, and explore MetaHumans and Niagara.', order: 3, duration: 45 },
    ],
  },
  {
    title: 'Game Design Principles', briefIntro: 'Design engaging games from concept to prototype. Learn game mechanics, level design, playtesting, and player psychology.',
    description: 'Design engaging games — mechanics, dynamics, aesthetics, level design, balancing, and player psychology.',
    category: 'Game Development', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Game Design Basics', level: 'beginner', topics: ['MDA framework', 'Core loops', 'Player motivation', 'Fun factors'] },
      { moduleTitle: 'Mechanics Design', level: 'intermediate', topics: ['Rules systems', 'Progression', 'Economy', 'Combat design'] },
      { moduleTitle: 'Level Design', level: 'intermediate', topics: ['Layout principles', 'Flow', 'Difficulty curves', 'Environmental storytelling'] },
      { moduleTitle: 'Balancing', level: 'advanced', topics: ['Playtesting', 'Analytics', 'A/B testing', 'Economy balancing'] },
      { moduleTitle: 'Narrative', level: 'advanced', topics: ['Story structures', 'Character arcs', 'Dialogue systems', 'World building'] },
    ],
    lessons: [
      { title: 'Game Design Fundamentals', content: 'Learn the MDA framework, core loops, and what makes games engaging.', order: 1, duration: 25 },
      { title: 'Mechanics & Level Design', content: 'Design game mechanics, progression systems, and compelling level layouts.', order: 2, duration: 30 },
      { title: 'Balancing & Narrative', content: 'Playtest and balance your game, design story structures, and build worlds.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Godot Engine Complete Guide', briefIntro: 'Build games with the open-source Godot engine. Learn GDScript, 2D/3D development, and cross-platform deployment.',
    description: 'Master the open-source Godot engine — GDScript, 2D/3D development, signals, animations, and cross-platform deployment.',
    category: 'Game Development', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Godot Basics', level: 'beginner', topics: ['Scene tree', 'Nodes', 'GDScript', 'Inspector'] },
      { moduleTitle: '2D Development', level: 'intermediate', topics: ['Sprites', 'KinematicBody2D', 'TileMap', 'Camera2D'] },
      { moduleTitle: 'Signals & UI', level: 'intermediate', topics: ['Signal system', 'Control nodes', 'Themes', 'Menus'] },
      { moduleTitle: '3D Development', level: 'advanced', topics: ['MeshInstance', 'CSG', 'Lighting', 'Spatial audio'] },
      { moduleTitle: 'Export', level: 'advanced', topics: ['Export templates', 'Desktop', 'Mobile', 'Web export'] },
    ],
    lessons: [
      { title: 'GDScript & Scene Tree', content: 'Learn GDScript syntax, the scene tree, nodes, and basic game structure in Godot.', order: 1, duration: 30 },
      { title: '2D Games & Signals', content: 'Build 2D games with sprites, physics, TileMap, and the signal system.', order: 2, duration: 35 },
      { title: '3D Development & Exporting', content: 'Create 3D scenes, add lighting, and export to desktop, mobile, and web.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Game Physics & Math', briefIntro: 'Master the math behind game development. Learn vectors, matrices, collision detection, and physics simulation.',
    description: 'Essential math and physics for games — vectors, matrices, collision detection, rigid body physics, and optimization.',
    category: 'Game Development', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Vectors & Matrices', level: 'beginner', topics: ['Vector operations', 'Dot product', 'Cross product', 'Matrix transforms'] },
      { moduleTitle: 'Trigonometry', level: 'intermediate', topics: ['Sin/Cos/Tan', 'Rotation', 'Angles', 'Interpolation'] },
      { moduleTitle: 'Collision Detection', level: 'intermediate', topics: ['AABB', 'Circle/sphere', 'SAT', 'Raycasting'] },
      { moduleTitle: 'Rigid Body Physics', level: 'advanced', topics: ['Forces', 'Torque', 'Impulses', 'Integration methods'] },
      { moduleTitle: 'Advanced', level: 'advanced', topics: ['Spatial partitioning', 'Continuous collision', 'Soft body', 'Cloth simulation'] },
    ],
    lessons: [
      { title: 'Vectors, Matrices & Trigonometry', content: 'Master vector math, matrix transformations, and trigonometry for game dev.', order: 1, duration: 35 },
      { title: 'Collision Detection', content: 'Implement AABB, circle, SAT, and raycasting for accurate collision detection.', order: 2, duration: 40 },
      { title: 'Physics Simulation', content: 'Build rigid body physics with forces, impulses, and integration methods.', order: 3, duration: 45 },
    ],
  },

  // ── 11. Embedded Systems ────────────────────────────────────────
  {
    title: 'Arduino Programming', briefIntro: 'Get started with embedded systems using Arduino. Learn electronics basics, sensors, actuators, and IoT projects.',
    description: 'Build embedded projects with Arduino — electronics basics, sensors, actuators, communication protocols, and IoT.',
    category: 'Embedded Systems', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Arduino Basics', level: 'beginner', topics: ['Board overview', 'IDE setup', 'Digital I/O', 'Analog I/O'] },
      { moduleTitle: 'Sensors', level: 'intermediate', topics: ['Temperature', 'Motion', 'Light', 'Distance'] },
      { moduleTitle: 'Actuators', level: 'intermediate', topics: ['Motors', 'Servos', 'LEDs', 'Displays'] },
      { moduleTitle: 'Communication', level: 'advanced', topics: ['Serial', 'I2C', 'SPI', 'Bluetooth'] },
      { moduleTitle: 'IoT Projects', level: 'advanced', topics: ['WiFi connectivity', 'MQTT', 'Cloud dashboards', 'Home automation'] },
    ],
    lessons: [
      { title: 'Arduino Setup & Digital I/O', content: 'Set up the Arduino IDE, understand the board, and control digital pins.', order: 1, duration: 25 },
      { title: 'Sensors & Actuators', content: 'Read sensor data and control motors, servos, and displays.', order: 2, duration: 30 },
      { title: 'Communication & IoT', content: 'Use serial, I2C, WiFi, and build connected IoT projects.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Raspberry Pi Projects', briefIntro: 'Build projects with Raspberry Pi. Learn Linux, Python GPIO, camera modules, and home server setup.',
    description: 'Build with Raspberry Pi — Linux setup, Python GPIO programming, camera projects, and home server configuration.',
    category: 'Embedded Systems', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Pi Setup', level: 'beginner', topics: ['OS installation', 'SSH', 'Networking', 'Terminal basics'] },
      { moduleTitle: 'GPIO Programming', level: 'intermediate', topics: ['Pin layout', 'Digital output', 'PWM', 'Input handling'] },
      { moduleTitle: 'Sensors & Camera', level: 'intermediate', topics: ['I2C sensors', 'Camera module', 'Image processing', 'Video streaming'] },
      { moduleTitle: 'Server Projects', level: 'advanced', topics: ['Web server', 'File server', 'VPN', 'Home assistant'] },
      { moduleTitle: 'Advanced', level: 'advanced', topics: ['Real-time OS', 'Bare metal', 'Cluster computing', 'Edge AI'] },
    ],
    lessons: [
      { title: 'Pi Setup & GPIO Basics', content: 'Install the OS, configure networking, and control GPIO pins with Python.', order: 1, duration: 25 },
      { title: 'Sensors, Camera & Projects', content: 'Connect sensors, use the camera module, and build practical projects.', order: 2, duration: 35 },
      { title: 'Home Server & Advanced Uses', content: 'Set up web servers, VPN, and explore edge AI with Raspberry Pi.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'IoT Architecture & Protocols', briefIntro: 'Design IoT systems from edge to cloud. Learn MQTT, CoAP, edge computing, and IoT platform architecture.',
    description: 'Design IoT systems — MQTT, CoAP, edge computing, cloud integration, and security for connected devices.',
    category: 'Embedded Systems', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'IoT Overview', level: 'beginner', topics: ['IoT architecture', 'Device types', 'Connectivity', 'Use cases'] },
      { moduleTitle: 'Protocols', level: 'intermediate', topics: ['MQTT', 'CoAP', 'HTTP/2', 'WebSocket'] },
      { moduleTitle: 'Edge Computing', level: 'intermediate', topics: ['Edge vs cloud', 'Data filtering', 'Local processing', 'Gateways'] },
      { moduleTitle: 'Cloud Integration', level: 'advanced', topics: ['AWS IoT', 'Azure IoT Hub', 'Data pipelines', 'Analytics'] },
      { moduleTitle: 'Security', level: 'advanced', topics: ['Device authentication', 'Encryption', 'Firmware updates', 'Threat modeling'] },
    ],
    lessons: [
      { title: 'IoT Architecture & Protocols', content: 'Understand IoT architecture, MQTT, CoAP, and device connectivity.', order: 1, duration: 30 },
      { title: 'Edge Computing & Gateways', content: 'Process data at the edge, filter events, and configure IoT gateways.', order: 2, duration: 35 },
      { title: 'Cloud Integration & Security', content: 'Connect to AWS IoT/Azure IoT Hub and implement device security.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'RTOS & Embedded C Programming', briefIntro: 'Program real-time embedded systems. Learn C for embedded, FreeRTOS, interrupts, and memory management.',
    description: 'Program real-time embedded systems — Embedded C, FreeRTOS, interrupts, DMA, and memory-constrained development.',
    category: 'Embedded Systems', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Embedded C', level: 'beginner', topics: ['Memory layout', 'Pointers', 'Bit manipulation', 'Volatile keyword'] },
      { moduleTitle: 'Peripherals', level: 'intermediate', topics: ['GPIO registers', 'UART', 'SPI', 'I2C'] },
      { moduleTitle: 'Interrupts', level: 'intermediate', topics: ['ISR design', 'Priority', 'Debouncing', 'DMA'] },
      { moduleTitle: 'FreeRTOS', level: 'advanced', topics: ['Tasks', 'Queues', 'Semaphores', 'Mutexes'] },
      { moduleTitle: 'Optimization', level: 'advanced', topics: ['Memory optimization', 'Power management', 'Watchdog timers', 'Bootloaders'] },
    ],
    lessons: [
      { title: 'Embedded C & Peripherals', content: 'Write embedded C, manipulate registers, and interface with UART/SPI/I2C.', order: 1, duration: 40 },
      { title: 'Interrupts & DMA', content: 'Design interrupt service routines, handle priorities, and use DMA transfers.', order: 2, duration: 40 },
      { title: 'FreeRTOS & Optimization', content: 'Create FreeRTOS tasks, use synchronization primitives, and optimize power.', order: 3, duration: 45 },
    ],
  },
  {
    title: 'PCB Design & Electronics', briefIntro: 'Design printed circuit boards from schematic to fabrication. Learn KiCad, component selection, and manufacturing.',
    description: 'Design PCBs — schematic capture, PCB layout, component selection, DRC, and manufacturing with KiCad.',
    category: 'Embedded Systems', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Electronics Basics', level: 'beginner', topics: ['Ohms law', 'Components', 'Circuit analysis', 'Breadboarding'] },
      { moduleTitle: 'Schematic Design', level: 'intermediate', topics: ['KiCad setup', 'Symbol libraries', 'Net lists', 'ERC'] },
      { moduleTitle: 'PCB Layout', level: 'intermediate', topics: ['Footprints', 'Routing', 'Ground planes', 'DRC'] },
      { moduleTitle: 'Manufacturing', level: 'advanced', topics: ['Gerber files', 'BOM', 'Pick & place', 'Assembly'] },
      { moduleTitle: 'Advanced Design', level: 'advanced', topics: ['Multi-layer', 'High-speed', 'EMI/EMC', 'Thermal management'] },
    ],
    lessons: [
      { title: 'Electronics & Schematic Design', content: 'Review electronics fundamentals and create schematics in KiCad.', order: 1, duration: 30 },
      { title: 'PCB Layout & Routing', content: 'Place components, route traces, create ground planes, and run DRC.', order: 2, duration: 35 },
      { title: 'Manufacturing & Advanced Design', content: 'Generate Gerbers, create BOMs, and learn multi-layer design techniques.', order: 3, duration: 35 },
    ],
  },

  // ── 12. Networking ──────────────────────────────────────────────
  {
    title: 'Computer Networking Fundamentals', briefIntro: 'Understand how networks work. Learn OSI model, TCP/IP, routing, switching, and network troubleshooting.',
    description: 'Master networking fundamentals — OSI model, TCP/IP, routing, switching, DNS, DHCP, and troubleshooting.',
    category: 'Networking', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Network Basics', level: 'beginner', topics: ['OSI model', 'TCP/IP', 'Protocols', 'Topologies'] },
      { moduleTitle: 'Layer 2', level: 'intermediate', topics: ['Ethernet', 'Switching', 'VLANs', 'STP'] },
      { moduleTitle: 'Layer 3', level: 'intermediate', topics: ['IP addressing', 'Subnetting', 'Routing', 'NAT'] },
      { moduleTitle: 'Services', level: 'advanced', topics: ['DNS', 'DHCP', 'HTTP/HTTPS', 'Email protocols'] },
      { moduleTitle: 'Troubleshooting', level: 'advanced', topics: ['Ping', 'Traceroute', 'Wireshark', 'Network diagrams'] },
    ],
    lessons: [
      { title: 'OSI Model & TCP/IP', content: 'Understand the 7 layers, TCP/IP protocol suite, and network topologies.', order: 1, duration: 25 },
      { title: 'Switching, Routing & Subnetting', content: 'Configure switches, understand routing protocols, and master subnetting.', order: 2, duration: 35 },
      { title: 'Network Services & Troubleshooting', content: 'Set up DNS, DHCP, and troubleshoot with ping, traceroute, and Wireshark.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Cisco CCNA Preparation', briefIntro: 'Prepare for the Cisco CCNA certification. Learn IOS commands, routing protocols, ACLs, and network automation.',
    description: 'Prepare for CCNA — Cisco IOS, routing protocols, VLANs, ACLs, NAT, and network automation basics.',
    category: 'Networking', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Cisco IOS', level: 'beginner', topics: ['CLI navigation', 'Configuration', 'Show commands', 'Backup/restore'] },
      { moduleTitle: 'Switching', level: 'intermediate', topics: ['VLAN config', 'Trunking', 'EtherChannel', 'Port security'] },
      { moduleTitle: 'Routing', level: 'intermediate', topics: ['Static routes', 'OSPF', 'EIGRP', 'Route redistribution'] },
      { moduleTitle: 'Security', level: 'advanced', topics: ['ACLs', 'NAT/PAT', '802.1X', 'SSH configuration'] },
      { moduleTitle: 'Automation', level: 'advanced', topics: ['REST APIs', 'Python for networking', 'Ansible', 'SDN concepts'] },
    ],
    lessons: [
      { title: 'Cisco IOS & Switching', content: 'Navigate IOS CLI, configure VLANs, trunking, and EtherChannel.', order: 1, duration: 35 },
      { title: 'Routing Protocols', content: 'Configure static routes, OSPF, EIGRP, and route redistribution.', order: 2, duration: 40 },
      { title: 'Security & Automation', content: 'Implement ACLs, NAT, SSH, and automate with Python and Ansible.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Software-Defined Networking (SDN)', briefIntro: 'Modernize networks with SDN. Learn OpenFlow, network virtualization, SD-WAN, and programmable infrastructure.',
    description: 'Master SDN — OpenFlow, network virtualization, SD-WAN, and programmable network infrastructure.',
    category: 'Networking', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'SDN Concepts', level: 'beginner', topics: ['Control plane', 'Data plane', 'SDN architecture', 'Benefits'] },
      { moduleTitle: 'OpenFlow', level: 'intermediate', topics: ['Protocol', 'Flow tables', 'Controllers', 'Mininet'] },
      { moduleTitle: 'Virtualization', level: 'intermediate', topics: ['NFV', 'Virtual switches', 'Overlay networks', 'VXLAN'] },
      { moduleTitle: 'SD-WAN', level: 'advanced', topics: ['Architecture', 'Policies', 'Orchestration', 'Vendor comparison'] },
      { moduleTitle: 'Programmability', level: 'advanced', topics: ['NETCONF/YANG', 'gRPC', 'Intent-based', 'Network as code'] },
    ],
    lessons: [
      { title: 'SDN Architecture & OpenFlow', content: 'Understand SDN planes, OpenFlow protocol, and simulate with Mininet.', order: 1, duration: 35 },
      { title: 'Virtualization & SD-WAN', content: 'Implement NFV, virtual switches, overlay networks, and SD-WAN.', order: 2, duration: 40 },
      { title: 'Network Programmability', content: 'Automate with NETCONF/YANG, gRPC, and intent-based networking.', order: 3, duration: 40 },
    ],
  },
  {
    title: 'Wireless Networking & WiFi', briefIntro: 'Master wireless networking. Learn WiFi standards, antenna design, enterprise WLANs, and wireless security.',
    description: 'Master wireless networking — WiFi standards, antenna basics, enterprise WLANs, troubleshooting, and security.',
    category: 'Networking', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'WiFi Basics', level: 'beginner', topics: ['RF fundamentals', 'WiFi standards', 'Frequency bands', 'SSID/BSSID'] },
      { moduleTitle: 'Configuration', level: 'intermediate', topics: ['AP setup', 'Channel planning', 'Band steering', 'QoS'] },
      { moduleTitle: 'Enterprise', level: 'intermediate', topics: ['WLC', 'CAPWAP', 'Roaming', 'Site surveys'] },
      { moduleTitle: 'Security', level: 'advanced', topics: ['WPA3', '802.1X', 'RADIUS', 'Wireless IDS'] },
      { moduleTitle: 'Troubleshooting', level: 'advanced', topics: ['Spectrum analysis', 'Interference', 'Performance tuning', 'Capacity planning'] },
    ],
    lessons: [
      { title: 'WiFi Standards & RF Basics', content: 'Understand RF, WiFi standards (6/6E), frequency bands, and signal propagation.', order: 1, duration: 25 },
      { title: 'Enterprise WLAN & Configuration', content: 'Set up access points, WLCs, channel planning, and site surveys.', order: 2, duration: 35 },
      { title: 'Security & Troubleshooting', content: 'Implement WPA3, 802.1X, RADIUS, and troubleshoot wireless issues.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Network Automation with Python', briefIntro: 'Automate network operations with Python. Learn Netmiko, NAPALM, Ansible, and infrastructure as code for networks.',
    description: 'Automate networks with Python — Netmiko, NAPALM, Ansible, REST APIs, and network infrastructure as code.',
    category: 'Networking', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Python Basics', level: 'beginner', topics: ['Data structures', 'File handling', 'Regular expressions', 'APIs'] },
      { moduleTitle: 'Netmiko', level: 'intermediate', topics: ['SSH connections', 'Send commands', 'Configuration', 'Multi-vendor'] },
      { moduleTitle: 'NAPALM', level: 'intermediate', topics: ['Getters', 'Configuration management', 'Diff/commit', 'Validation'] },
      { moduleTitle: 'Ansible', level: 'advanced', topics: ['Playbooks', 'Roles', 'Network modules', 'Inventory management'] },
      { moduleTitle: 'Advanced', level: 'advanced', topics: ['CI/CD for networks', 'Testing', 'GitOps', 'Event-driven automation'] },
    ],
    lessons: [
      { title: 'Python & Netmiko', content: 'Automate SSH connections to network devices with Python and Netmiko.', order: 1, duration: 30 },
      { title: 'NAPALM & Configuration', content: 'Manage multi-vendor configurations with NAPALM getters and commits.', order: 2, duration: 35 },
      { title: 'Ansible & GitOps', content: 'Write Ansible playbooks for networks and implement GitOps workflows.', order: 3, duration: 40 },
    ],
  },

  // ═══════════════════════════ NON-TECHNICAL ═══════════════════════════

  // ── 13. Design ──────────────────────────────────────────────────
  {
    title: 'UI/UX Design Principles', briefIntro: 'Master user interface and experience design. Learn user research, wireframing, prototyping, and design systems.',
    description: 'Master UI/UX design — user research, wireframing, prototyping, design systems, and creating beautiful interfaces.',
    category: 'Design', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'UX Research', level: 'beginner', topics: ['User interviews', 'Personas', 'Journey maps', 'Usability testing'] },
      { moduleTitle: 'Wireframing', level: 'beginner', topics: ['Low-fidelity', 'Information architecture', 'User flows', 'Sketching'] },
      { moduleTitle: 'Visual Design', level: 'intermediate', topics: ['Color theory', 'Typography', 'Spacing', 'Hierarchy'] },
      { moduleTitle: 'Prototyping', level: 'intermediate', topics: ['High-fidelity mockups', 'Interactive prototypes', 'Micro-interactions', 'Testing'] },
      { moduleTitle: 'Design Systems', level: 'advanced', topics: ['Component libraries', 'Tokens', 'Documentation', 'Governance'] },
    ],
    lessons: [
      { title: 'User Research & Wireframing', content: 'Conduct user interviews, create personas, and build wireframes.', order: 1, duration: 30 },
      { title: 'Visual Design & Prototyping', content: 'Apply color theory, typography, and create interactive prototypes.', order: 2, duration: 35 },
      { title: 'Design Systems', content: 'Build scalable design systems with reusable components and tokens.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Figma Masterclass', briefIntro: 'Become a Figma power user. Learn auto-layout, components, variants, plugins, and design collaboration.',
    description: 'Master Figma — auto-layout, components, variants, interactive prototypes, plugins, and team collaboration.',
    category: 'Design', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Figma Basics', level: 'beginner', topics: ['Interface', 'Frames', 'Shapes', 'Text'] },
      { moduleTitle: 'Auto-Layout', level: 'intermediate', topics: ['Padding', 'Spacing', 'Resizing', 'Nested layouts'] },
      { moduleTitle: 'Components', level: 'intermediate', topics: ['Main/instance', 'Variants', 'Properties', 'Overrides'] },
      { moduleTitle: 'Prototyping', level: 'advanced', topics: ['Smart animate', 'Overlays', 'Scroll behavior', 'Variables'] },
      { moduleTitle: 'Collaboration', level: 'advanced', topics: ['Dev mode', 'Version history', 'Comments', 'Libraries'] },
    ],
    lessons: [
      { title: 'Figma Interface & Auto-Layout', content: 'Navigate Figma and master auto-layout for responsive designs.', order: 1, duration: 30 },
      { title: 'Components & Variants', content: 'Create powerful component libraries with variants and properties.', order: 2, duration: 35 },
      { title: 'Prototyping & Collaboration', content: 'Build interactive prototypes and collaborate with dev handoff.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Graphic Design with Adobe Suite', briefIntro: 'Create stunning graphics with Adobe tools. Learn Photoshop, Illustrator, and InDesign for print and digital.',
    description: 'Create professional graphics — Photoshop for editing, Illustrator for vectors, and InDesign for layouts.',
    category: 'Design', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Photoshop Basics', level: 'beginner', topics: ['Layers', 'Selection tools', 'Adjustments', 'Retouching'] },
      { moduleTitle: 'Illustrator', level: 'intermediate', topics: ['Pen tool', 'Shapes', 'Gradients', 'Logos'] },
      { moduleTitle: 'InDesign', level: 'intermediate', topics: ['Layouts', 'Master pages', 'Styles', 'Export'] },
      { moduleTitle: 'Advanced Photoshop', level: 'advanced', topics: ['Compositing', 'Smart objects', 'Actions', 'Batch processing'] },
      { moduleTitle: 'Brand Design', level: 'advanced', topics: ['Logo design', 'Brand guidelines', 'Mockups', 'Print preparation'] },
    ],
    lessons: [
      { title: 'Photoshop Essentials', content: 'Master layers, selections, adjustments, and photo retouching in Photoshop.', order: 1, duration: 30 },
      { title: 'Illustrator & InDesign', content: 'Create vector graphics and design layouts for print and digital.', order: 2, duration: 35 },
      { title: 'Brand Design & Advanced Techniques', content: 'Design logos, create brand guidelines, and use advanced compositing.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Motion Design & Animation', briefIntro: 'Bring designs to life with animation. Learn After Effects, Lottie, CSS animations, and motion principles.',
    description: 'Create motion graphics — After Effects, Lottie animations, CSS animations, and motion design principles.',
    category: 'Design', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Motion Principles', level: 'beginner', topics: ['12 principles', 'Timing', 'Easing', 'Anticipation'] },
      { moduleTitle: 'After Effects', level: 'intermediate', topics: ['Keyframes', 'Masks', 'Expressions', 'Compositions'] },
      { moduleTitle: 'CSS Animations', level: 'intermediate', topics: ['Transitions', 'Keyframes', 'Transforms', 'Performance'] },
      { moduleTitle: 'Lottie', level: 'advanced', topics: ['Bodymovin', 'JSON export', 'Web integration', 'Interactivity'] },
      { moduleTitle: 'UI Animation', level: 'advanced', topics: ['Micro-interactions', 'Page transitions', 'Loading states', 'Scroll animations'] },
    ],
    lessons: [
      { title: 'Motion Principles & After Effects', content: 'Learn animation principles and create motion graphics in After Effects.', order: 1, duration: 30 },
      { title: 'CSS & Web Animations', content: 'Build performant CSS animations, transitions, and transforms for the web.', order: 2, duration: 30 },
      { title: 'Lottie & UI Animation', content: 'Export Lottie animations and create engaging micro-interactions.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Design Thinking & Innovation', briefIntro: 'Solve complex problems with design thinking. Learn empathize, define, ideate, prototype, and test methodology.',
    description: 'Apply design thinking — empathize, define, ideate, prototype, and test for innovative problem-solving.',
    category: 'Design', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Empathize', level: 'beginner', topics: ['Observation', 'Interviews', 'Empathy maps', 'Immersion'] },
      { moduleTitle: 'Define', level: 'intermediate', topics: ['Problem statements', 'POV', 'How Might We', 'Insights'] },
      { moduleTitle: 'Ideate', level: 'intermediate', topics: ['Brainstorming', 'Mind mapping', 'SCAMPER', 'Crazy 8s'] },
      { moduleTitle: 'Prototype', level: 'advanced', topics: ['Rapid prototyping', 'Paper prototypes', 'Digital prototypes', 'MVP'] },
      { moduleTitle: 'Test', level: 'advanced', topics: ['User testing', 'Iteration', 'Feedback synthesis', 'Pivoting'] },
    ],
    lessons: [
      { title: 'Empathize & Define', content: 'Conduct research, create empathy maps, and define clear problem statements.', order: 1, duration: 25 },
      { title: 'Ideate & Brainstorm', content: 'Generate ideas with brainstorming, mind mapping, SCAMPER, and Crazy 8s.', order: 2, duration: 25 },
      { title: 'Prototype & Test', content: 'Build rapid prototypes, conduct user testing, and iterate based on feedback.', order: 3, duration: 30 },
    ],
  },

  // ── 14. Marketing ───────────────────────────────────────────────
  {
    title: 'Digital Marketing Fundamentals', briefIntro: 'Learn core digital marketing skills. Master SEO, content marketing, social media, and email campaigns.',
    description: 'Master digital marketing — SEO, content marketing, social media strategy, email marketing, and analytics.',
    category: 'Marketing', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Marketing Basics', level: 'beginner', topics: ['Digital vs traditional', 'Customer journey', 'Funnel', 'KPIs'] },
      { moduleTitle: 'SEO', level: 'intermediate', topics: ['Keyword research', 'On-page SEO', 'Technical SEO', 'Link building'] },
      { moduleTitle: 'Content Marketing', level: 'intermediate', topics: ['Strategy', 'Content calendar', 'Distribution', 'Measurement'] },
      { moduleTitle: 'Social Media', level: 'advanced', topics: ['Platform strategies', 'Paid ads', 'Influencer marketing', 'Community'] },
      { moduleTitle: 'Email Marketing', level: 'advanced', topics: ['List building', 'Segmentation', 'Automation', 'A/B testing'] },
    ],
    lessons: [
      { title: 'Marketing Fundamentals & SEO', content: 'Understand the digital marketing landscape and master SEO techniques.', order: 1, duration: 30 },
      { title: 'Content & Social Media Marketing', content: 'Create content strategies and build social media presence.', order: 2, duration: 30 },
      { title: 'Email Marketing & Analytics', content: 'Build email campaigns, automate sequences, and measure results.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Google Ads & PPC Advertising', briefIntro: 'Master pay-per-click advertising. Learn Google Ads, keyword bidding, ad copy, and campaign optimization.',
    description: 'Master PPC advertising — Google Ads setup, keyword bidding, ad copy, campaign optimization, and ROI tracking.',
    category: 'Marketing', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'PPC Basics', level: 'beginner', topics: ['How PPC works', 'Account structure', 'Bidding', 'Quality Score'] },
      { moduleTitle: 'Search Ads', level: 'intermediate', topics: ['Keyword research', 'Match types', 'Ad copy', 'Extensions'] },
      { moduleTitle: 'Display & Video', level: 'intermediate', topics: ['Display network', 'YouTube ads', 'Targeting', 'Remarketing'] },
      { moduleTitle: 'Optimization', level: 'advanced', topics: ['Bid strategies', 'A/B testing', 'Scripts', 'Automation'] },
      { moduleTitle: 'Analytics', level: 'advanced', topics: ['Conversion tracking', 'Attribution', 'ROI analysis', 'Reporting'] },
    ],
    lessons: [
      { title: 'Google Ads Setup & Search Campaigns', content: 'Set up Google Ads, research keywords, and create search ad campaigns.', order: 1, duration: 30 },
      { title: 'Display, Video & Remarketing', content: 'Create display ads, YouTube campaigns, and set up remarketing audiences.', order: 2, duration: 30 },
      { title: 'Optimization & Analytics', content: 'Optimize bids, track conversions, and analyze campaign ROI.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Social Media Strategy', briefIntro: 'Build a winning social media presence. Learn platform-specific strategies, content planning, and community management.',
    description: 'Build social media presence — platform strategies, content planning, community management, and paid advertising.',
    category: 'Marketing', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Social Strategy', level: 'beginner', topics: ['Goal setting', 'Audience research', 'Platform selection', 'Brand voice'] },
      { moduleTitle: 'Content Creation', level: 'intermediate', topics: ['Visual content', 'Copywriting', 'Hashtags', 'Scheduling'] },
      { moduleTitle: 'Community', level: 'intermediate', topics: ['Engagement', 'Moderation', 'User-generated content', 'Influencers'] },
      { moduleTitle: 'Paid Social', level: 'advanced', topics: ['Facebook Ads', 'Instagram Ads', 'LinkedIn Ads', 'TikTok Ads'] },
      { moduleTitle: 'Analytics', level: 'advanced', topics: ['Metrics', 'Reporting', 'Social listening', 'Competitor analysis'] },
    ],
    lessons: [
      { title: 'Strategy & Content Planning', content: 'Define social goals, research audiences, and plan content calendars.', order: 1, duration: 25 },
      { title: 'Community Building & Engagement', content: 'Build engaged communities, moderate effectively, and leverage UGC.', order: 2, duration: 25 },
      { title: 'Paid Ads & Analytics', content: 'Run paid social campaigns and measure performance with analytics.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Growth Hacking & Analytics', briefIntro: 'Master data-driven marketing. Learn A/B testing, conversion optimization, growth experiments, and analytics tools.',
    description: 'Data-driven marketing — A/B testing, conversion optimization, growth experiments, and marketing analytics.',
    category: 'Marketing', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Growth Mindset', level: 'beginner', topics: ['Growth framework', 'North Star metric', 'Pirate metrics', 'Growth loops'] },
      { moduleTitle: 'Experimentation', level: 'intermediate', topics: ['A/B testing', 'Hypothesis', 'Statistical significance', 'Prioritization'] },
      { moduleTitle: 'CRO', level: 'intermediate', topics: ['Funnel analysis', 'Landing pages', 'Checkout optimization', 'User behavior'] },
      { moduleTitle: 'Analytics Tools', level: 'advanced', topics: ['Google Analytics 4', 'Mixpanel', 'Amplitude', 'Data visualization'] },
      { moduleTitle: 'Advanced Growth', level: 'advanced', topics: ['Viral loops', 'Referral programs', 'Product-led growth', 'Retention'] },
    ],
    lessons: [
      { title: 'Growth Framework & Metrics', content: 'Define your North Star metric and build growth frameworks.', order: 1, duration: 30 },
      { title: 'A/B Testing & CRO', content: 'Design experiments, run A/B tests, and optimize conversion funnels.', order: 2, duration: 35 },
      { title: 'Analytics & Advanced Growth', content: 'Master GA4, build dashboards, and implement viral growth loops.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Content Marketing Mastery', briefIntro: 'Create content that converts. Learn content strategy, SEO writing, distribution channels, and measurement.',
    description: 'Create high-converting content — strategy, SEO writing, distribution, repurposing, and performance measurement.',
    category: 'Marketing', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Content Strategy', level: 'beginner', topics: ['Audience personas', 'Content audit', 'Gap analysis', 'Calendar'] },
      { moduleTitle: 'Writing', level: 'intermediate', topics: ['SEO writing', 'Headlines', 'Storytelling', 'CTAs'] },
      { moduleTitle: 'Distribution', level: 'intermediate', topics: ['Owned channels', 'Earned media', 'Paid promotion', 'Syndication'] },
      { moduleTitle: 'Repurposing', level: 'advanced', topics: ['Blog to video', 'Podcast clips', 'Infographics', 'Social snippets'] },
      { moduleTitle: 'Measurement', level: 'advanced', topics: ['Traffic metrics', 'Engagement', 'Lead generation', 'Revenue attribution'] },
    ],
    lessons: [
      { title: 'Content Strategy & Planning', content: 'Build content strategies, create personas, and plan editorial calendars.', order: 1, duration: 25 },
      { title: 'SEO Writing & Distribution', content: 'Write SEO-optimized content and distribute across multiple channels.', order: 2, duration: 30 },
      { title: 'Repurposing & Measurement', content: 'Repurpose content across formats and measure ROI with analytics.', order: 3, duration: 30 },
    ],
  },

  // ── 15. Business ────────────────────────────────────────────────
  {
    title: 'Project Management Fundamentals', briefIntro: 'Learn essential project management. Master Agile, Scrum, Kanban, risk management, and team leadership.',
    description: 'Master project management — Agile, Scrum, Kanban, risk management, stakeholder communication, and team leadership.',
    category: 'Business', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'PM Basics', level: 'beginner', topics: ['PM lifecycle', 'Scope', 'Schedule', 'Budget'] },
      { moduleTitle: 'Agile & Scrum', level: 'intermediate', topics: ['Agile manifesto', 'Sprints', 'Ceremonies', 'Artifacts'] },
      { moduleTitle: 'Planning', level: 'intermediate', topics: ['WBS', 'Gantt charts', 'Resource allocation', 'Dependencies'] },
      { moduleTitle: 'Risk Management', level: 'advanced', topics: ['Risk identification', 'Assessment', 'Mitigation', 'Contingency'] },
      { moduleTitle: 'Leadership', level: 'advanced', topics: ['Team building', 'Communication', 'Conflict resolution', 'Stakeholders'] },
    ],
    lessons: [
      { title: 'PM Lifecycle & Agile', content: 'Understand PM phases, the Agile manifesto, and Scrum framework.', order: 1, duration: 30 },
      { title: 'Planning & Resource Management', content: 'Create WBS, Gantt charts, and allocate resources effectively.', order: 2, duration: 30 },
      { title: 'Risk Management & Leadership', content: 'Identify risks, build mitigation plans, and lead teams effectively.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Entrepreneurship & Startups', briefIntro: 'Launch your startup. Learn idea validation, business models, fundraising, and scaling strategies.',
    description: 'Launch startups — idea validation, business models, MVPs, fundraising, and scaling strategies.',
    category: 'Business', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Ideation', level: 'beginner', topics: ['Problem discovery', 'Market research', 'Validation', 'Pivoting'] },
      { moduleTitle: 'Business Model', level: 'intermediate', topics: ['Business Model Canvas', 'Revenue models', 'Pricing', 'Unit economics'] },
      { moduleTitle: 'MVP', level: 'intermediate', topics: ['Lean methodology', 'Build-measure-learn', 'Prototyping', 'User testing'] },
      { moduleTitle: 'Fundraising', level: 'advanced', topics: ['Pitch deck', 'Investors', 'Term sheets', 'Valuation'] },
      { moduleTitle: 'Scaling', level: 'advanced', topics: ['Product-market fit', 'Growth strategy', 'Hiring', 'Culture'] },
    ],
    lessons: [
      { title: 'Ideation & Validation', content: 'Discover problems, validate ideas, and conduct market research.', order: 1, duration: 25 },
      { title: 'Business Models & MVP', content: 'Build the Business Model Canvas, define pricing, and create MVPs.', order: 2, duration: 30 },
      { title: 'Fundraising & Scaling', content: 'Create pitch decks, understand term sheets, and scale your startup.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Leadership & Team Management', briefIntro: 'Develop leadership skills for teams. Learn motivation, delegation, feedback, and building high-performance culture.',
    description: 'Develop leadership skills — motivation, delegation, feedback, conflict resolution, and team culture.',
    category: 'Business', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Leadership Styles', level: 'beginner', topics: ['Servant leadership', 'Transformational', 'Situational', 'Authentic'] },
      { moduleTitle: 'Team Building', level: 'intermediate', topics: ['Hiring', 'Onboarding', 'Psychological safety', 'Diversity'] },
      { moduleTitle: 'Communication', level: 'intermediate', topics: ['Active listening', 'Feedback', 'Difficult conversations', '1-on-1s'] },
      { moduleTitle: 'Performance', level: 'advanced', topics: ['Goal setting', 'OKRs', 'Reviews', 'Career development'] },
      { moduleTitle: 'Culture', level: 'advanced', topics: ['Values', 'Remote culture', 'Recognition', 'Burnout prevention'] },
    ],
    lessons: [
      { title: 'Leadership Styles & Team Building', content: 'Explore leadership styles, hire effectively, and build diverse teams.', order: 1, duration: 25 },
      { title: 'Communication & Feedback', content: 'Master active listening, giving feedback, and having difficult conversations.', order: 2, duration: 25 },
      { title: 'Performance & Culture', content: 'Set OKRs, conduct reviews, and build a positive team culture.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Business Strategy & Analysis', briefIntro: 'Think strategically about business. Learn competitive analysis, market positioning, SWOT, and strategic planning.',
    description: 'Strategic business thinking — competitive analysis, market positioning, SWOT, Porter\'s forces, and strategic planning.',
    category: 'Business', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Strategy Basics', level: 'beginner', topics: ['Mission/Vision', 'Competitive advantage', 'Value proposition', 'Market analysis'] },
      { moduleTitle: 'Frameworks', level: 'intermediate', topics: ['SWOT', 'Porter\'s 5 forces', 'BCG matrix', 'Blue ocean'] },
      { moduleTitle: 'Analysis', level: 'intermediate', topics: ['Market sizing', 'Segmentation', 'Positioning', 'Differentiation'] },
      { moduleTitle: 'Execution', level: 'advanced', topics: ['Strategic planning', 'KPIs', 'Balanced scorecard', 'Change management'] },
      { moduleTitle: 'Innovation', level: 'advanced', topics: ['Disruption theory', 'Platform strategy', 'Ecosystem', 'Digital transformation'] },
    ],
    lessons: [
      { title: 'Strategy Fundamentals', content: 'Define mission, vision, competitive advantage, and value propositions.', order: 1, duration: 25 },
      { title: 'Strategic Frameworks', content: 'Apply SWOT, Porter\'s 5 forces, BCG matrix, and Blue Ocean strategy.', order: 2, duration: 30 },
      { title: 'Execution & Innovation', content: 'Create strategic plans, track KPIs, and drive digital transformation.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Product Management', briefIntro: 'Build products users love. Learn product discovery, roadmapping, prioritization, and go-to-market strategies.',
    description: 'Build great products — discovery, roadmapping, prioritization frameworks, user stories, and go-to-market.',
    category: 'Business', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'PM Basics', level: 'beginner', topics: ['PM role', 'Product thinking', 'User stories', 'Acceptance criteria'] },
      { moduleTitle: 'Discovery', level: 'intermediate', topics: ['Customer interviews', 'Jobs-to-be-done', 'Opportunity assessment', 'Prototyping'] },
      { moduleTitle: 'Roadmapping', level: 'intermediate', topics: ['Vision', 'Strategy', 'Themes', 'Now/Next/Later'] },
      { moduleTitle: 'Prioritization', level: 'advanced', topics: ['RICE scoring', 'ICE framework', 'MoSCoW', 'Opportunity scoring'] },
      { moduleTitle: 'Launch', level: 'advanced', topics: ['Go-to-market', 'Beta programs', 'Feature flags', 'Success metrics'] },
    ],
    lessons: [
      { title: 'Product Thinking & Discovery', content: 'Think like a PM, conduct customer interviews, and define user stories.', order: 1, duration: 25 },
      { title: 'Roadmapping & Prioritization', content: 'Build product roadmaps and prioritize with RICE and ICE frameworks.', order: 2, duration: 30 },
      { title: 'Launch & Metrics', content: 'Plan go-to-market, run beta programs, and track success metrics.', order: 3, duration: 30 },
    ],
  },

  // ── 16. Finance ─────────────────────────────────────────────────
  {
    title: 'Personal Finance Mastery', briefIntro: 'Take control of your money. Learn budgeting, saving, investing, debt management, and retirement planning.',
    description: 'Master personal finance — budgeting, saving, investing, debt management, and retirement planning.',
    category: 'Finance', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Budgeting', level: 'beginner', topics: ['Income tracking', '50/30/20 rule', 'Emergency fund', 'Expense categories'] },
      { moduleTitle: 'Saving', level: 'beginner', topics: ['Saving strategies', 'High-yield accounts', 'Automation', 'Goal setting'] },
      { moduleTitle: 'Investing Basics', level: 'intermediate', topics: ['Stocks', 'Bonds', 'Mutual funds', 'ETFs'] },
      { moduleTitle: 'Debt Management', level: 'intermediate', topics: ['Good vs bad debt', 'Snowball method', 'Avalanche method', 'Credit score'] },
      { moduleTitle: 'Retirement', level: 'advanced', topics: ['401k/IRA', 'Compound interest', 'Asset allocation', 'Tax planning'] },
    ],
    lessons: [
      { title: 'Budgeting & Saving', content: 'Create budgets with the 50/30/20 rule and build emergency funds.', order: 1, duration: 20 },
      { title: 'Investing & Debt', content: 'Understand stocks, bonds, ETFs, and manage debt effectively.', order: 2, duration: 25 },
      { title: 'Retirement Planning', content: 'Plan for retirement with 401k/IRA, compound interest, and tax strategies.', order: 3, duration: 25 },
    ],
  },
  {
    title: 'Stock Market Investing', briefIntro: 'Invest intelligently in the stock market. Learn fundamental analysis, technical analysis, portfolio management, and risk.',
    description: 'Invest in stocks — fundamental analysis, technical analysis, portfolio management, and risk assessment.',
    category: 'Finance', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Market Basics', level: 'beginner', topics: ['How markets work', 'Order types', 'Market indices', 'Brokerage accounts'] },
      { moduleTitle: 'Fundamental Analysis', level: 'intermediate', topics: ['Financial statements', 'Ratios', 'Valuation', 'Earnings'] },
      { moduleTitle: 'Technical Analysis', level: 'intermediate', topics: ['Charts', 'Indicators', 'Patterns', 'Volume'] },
      { moduleTitle: 'Portfolio', level: 'advanced', topics: ['Diversification', 'Asset allocation', 'Rebalancing', 'Modern portfolio theory'] },
      { moduleTitle: 'Risk', level: 'advanced', topics: ['Risk tolerance', 'Hedging', 'Options basics', 'Market psychology'] },
    ],
    lessons: [
      { title: 'Market Basics & Fundamental Analysis', content: 'Understand markets, read financial statements, and calculate ratios.', order: 1, duration: 30 },
      { title: 'Technical Analysis', content: 'Read charts, use indicators, and identify patterns for trading decisions.', order: 2, duration: 30 },
      { title: 'Portfolio Management & Risk', content: 'Build diversified portfolios, rebalance assets, and manage risk.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Financial Modeling in Excel', briefIntro: 'Build financial models from scratch. Learn DCF analysis, sensitivity tables, scenario modeling, and dashboard creation.',
    description: 'Build financial models — DCF analysis, sensitivity tables, scenario modeling, and dashboard creation in Excel.',
    category: 'Finance', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Excel for Finance', level: 'beginner', topics: ['Formulas', 'Functions', 'Data tables', 'Charts'] },
      { moduleTitle: 'Financial Statements', level: 'intermediate', topics: ['Income statement', 'Balance sheet', 'Cash flow', 'Linking'] },
      { moduleTitle: 'DCF Model', level: 'intermediate', topics: ['Free cash flow', 'WACC', 'Terminal value', 'Enterprise value'] },
      { moduleTitle: 'Sensitivity', level: 'advanced', topics: ['Data tables', 'Scenario manager', 'Goal seek', 'Monte Carlo'] },
      { moduleTitle: 'Dashboards', level: 'advanced', topics: ['Dynamic charts', 'Pivot tables', 'Slicers', 'VBA macros'] },
    ],
    lessons: [
      { title: 'Excel Foundations for Finance', content: 'Master financial formulas, functions, and data visualization in Excel.', order: 1, duration: 30 },
      { title: 'DCF & Valuation Models', content: 'Build discounted cash flow models, calculate WACC, and value companies.', order: 2, duration: 40 },
      { title: 'Sensitivity Analysis & Dashboards', content: 'Create sensitivity tables, scenario models, and dynamic dashboards.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Cryptocurrency & Digital Assets', briefIntro: 'Navigate the crypto landscape. Learn Bitcoin, Ethereum, DeFi, NFTs, portfolio strategies, and risk management.',
    description: 'Navigate crypto — Bitcoin, Ethereum, DeFi, NFTs, portfolio strategies, and risk management for digital assets.',
    category: 'Finance', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Crypto Basics', level: 'beginner', topics: ['Bitcoin', 'Blockchain', 'Wallets', 'Exchanges'] },
      { moduleTitle: 'Ethereum & DeFi', level: 'intermediate', topics: ['Smart contracts', 'DeFi protocols', 'Yield farming', 'Staking'] },
      { moduleTitle: 'NFTs & Web3', level: 'intermediate', topics: ['NFT markets', 'Digital art', 'Utility NFTs', 'Metaverse'] },
      { moduleTitle: 'Trading', level: 'advanced', topics: ['Technical analysis', 'Risk management', 'Position sizing', 'Tax implications'] },
      { moduleTitle: 'Regulation', level: 'advanced', topics: ['Legal landscape', 'Compliance', 'SEC guidelines', 'Global regulations'] },
    ],
    lessons: [
      { title: 'Crypto Fundamentals', content: 'Understand Bitcoin, blockchain, set up wallets, and use exchanges.', order: 1, duration: 25 },
      { title: 'DeFi, NFTs & Web3', content: 'Explore DeFi protocols, yield farming, NFT markets, and Web3 ecosystem.', order: 2, duration: 30 },
      { title: 'Trading & Regulation', content: 'Apply technical analysis, manage risk, and understand crypto regulations.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Accounting Fundamentals', briefIntro: 'Learn the language of business. Master double-entry bookkeeping, financial statements, and accounting principles.',
    description: 'Master accounting — double-entry bookkeeping, financial statements, GAAP, and management accounting.',
    category: 'Finance', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Accounting Basics', level: 'beginner', topics: ['Accounting equation', 'Debits & credits', 'Chart of accounts', 'Journal entries'] },
      { moduleTitle: 'Financial Statements', level: 'intermediate', topics: ['Income statement', 'Balance sheet', 'Cash flow', 'Notes'] },
      { moduleTitle: 'GAAP Principles', level: 'intermediate', topics: ['Revenue recognition', 'Matching', 'Materiality', 'Conservatism'] },
      { moduleTitle: 'Management Accounting', level: 'advanced', topics: ['Cost accounting', 'Budgeting', 'Variance analysis', 'Break-even'] },
      { moduleTitle: 'Tax Basics', level: 'advanced', topics: ['Income tax', 'Deductions', 'Business entities', 'Tax planning'] },
    ],
    lessons: [
      { title: 'Double-Entry & Journal Entries', content: 'Understand the accounting equation, debits/credits, and journal entries.', order: 1, duration: 25 },
      { title: 'Financial Statements & GAAP', content: 'Prepare income statements, balance sheets, and apply GAAP principles.', order: 2, duration: 30 },
      { title: 'Management Accounting & Tax', content: 'Analyze costs, create budgets, and understand basic tax concepts.', order: 3, duration: 30 },
    ],
  },

  // ── 17. Communication ───────────────────────────────────────────
  {
    title: 'Public Speaking & Presentations', briefIntro: 'Speak with confidence and impact. Learn speech structure, storytelling, slide design, and overcoming anxiety.',
    description: 'Speak with confidence — speech structure, storytelling, slide design, delivery techniques, and overcoming anxiety.',
    category: 'Communication', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Speech Basics', level: 'beginner', topics: ['Structure', 'Opening hooks', 'Body', 'Conclusions'] },
      { moduleTitle: 'Delivery', level: 'intermediate', topics: ['Voice', 'Body language', 'Eye contact', 'Pacing'] },
      { moduleTitle: 'Storytelling', level: 'intermediate', topics: ['Narrative arcs', 'Emotional hooks', 'Data storytelling', 'Humor'] },
      { moduleTitle: 'Slides', level: 'advanced', topics: ['Visual design', 'Minimal text', 'Data visualization', 'Animations'] },
      { moduleTitle: 'Advanced', level: 'advanced', topics: ['Q&A handling', 'Panel discussions', 'Virtual presentations', 'TED-style talks'] },
    ],
    lessons: [
      { title: 'Speech Structure & Delivery', content: 'Structure speeches, use opening hooks, and deliver with confidence.', order: 1, duration: 25 },
      { title: 'Storytelling & Visual Aids', content: 'Craft compelling stories and design impactful presentation slides.', order: 2, duration: 25 },
      { title: 'Advanced Presentation Skills', content: 'Handle Q&A, lead panels, and deliver TED-style virtual presentations.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Business Writing & Email', briefIntro: 'Write clear, professional business communications. Master email etiquette, reports, proposals, and executive summaries.',
    description: 'Write professionally — email etiquette, reports, proposals, executive summaries, and business correspondence.',
    category: 'Communication', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Writing Basics', level: 'beginner', topics: ['Clarity', 'Conciseness', 'Tone', 'Structure'] },
      { moduleTitle: 'Email', level: 'intermediate', topics: ['Subject lines', 'Etiquette', 'Follow-ups', 'Templates'] },
      { moduleTitle: 'Reports', level: 'intermediate', topics: ['Executive summary', 'Data presentation', 'Recommendations', 'Formatting'] },
      { moduleTitle: 'Proposals', level: 'advanced', topics: ['Problem statement', 'Solution', 'Budget', 'Timeline'] },
      { moduleTitle: 'Executive Communication', level: 'advanced', topics: ['Board decks', 'Memos', 'Press releases', 'Stakeholder updates'] },
    ],
    lessons: [
      { title: 'Clear Writing & Email Etiquette', content: 'Write clearly, structure emails professionally, and use proper etiquette.', order: 1, duration: 20 },
      { title: 'Reports & Proposals', content: 'Create executive summaries, data-driven reports, and compelling proposals.', order: 2, duration: 25 },
      { title: 'Executive Communication', content: 'Write board decks, memos, and stakeholder communications.', order: 3, duration: 25 },
    ],
  },
  {
    title: 'Negotiation Skills', briefIntro: 'Negotiate with confidence. Learn preparation strategies, BATNA, persuasion techniques, and win-win outcomes.',
    description: 'Negotiate effectively — preparation, BATNA, persuasion, anchoring, and creating win-win outcomes.',
    category: 'Communication', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Negotiation Basics', level: 'beginner', topics: ['Types', 'Preparation', 'Research', 'Goals'] },
      { moduleTitle: 'Strategy', level: 'intermediate', topics: ['BATNA', 'ZOPA', 'Anchoring', 'Concessions'] },
      { moduleTitle: 'Persuasion', level: 'intermediate', topics: ['Influence principles', 'Framing', 'Rapport', 'Active listening'] },
      { moduleTitle: 'Tactics', level: 'advanced', topics: ['Silence', 'Deadlines', 'Good cop/bad cop', 'Package deals'] },
      { moduleTitle: 'Complex Negotiations', level: 'advanced', topics: ['Multi-party', 'Cross-cultural', 'Salary', 'M&A'] },
    ],
    lessons: [
      { title: 'Preparation & Strategy', content: 'Prepare for negotiations, define BATNA, and understand ZOPA.', order: 1, duration: 25 },
      { title: 'Persuasion & Tactics', content: 'Apply influence principles, framing, anchoring, and tactical moves.', order: 2, duration: 25 },
      { title: 'Complex & Cross-Cultural Negotiation', content: 'Navigate multi-party deals, salary negotiations, and cultural differences.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Interpersonal Communication', briefIntro: 'Build stronger relationships through communication. Learn emotional intelligence, conflict resolution, and active listening.',
    description: 'Build relationships — emotional intelligence, active listening, conflict resolution, and empathic communication.',
    category: 'Communication', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Communication Basics', level: 'beginner', topics: ['Verbal', 'Non-verbal', 'Written', 'Digital'] },
      { moduleTitle: 'Active Listening', level: 'intermediate', topics: ['Paraphrasing', 'Reflecting', 'Open questions', 'Summarizing'] },
      { moduleTitle: 'Emotional Intelligence', level: 'intermediate', topics: ['Self-awareness', 'Self-regulation', 'Empathy', 'Social skills'] },
      { moduleTitle: 'Conflict Resolution', level: 'advanced', topics: ['Styles', 'De-escalation', 'Mediation', 'Compromise'] },
      { moduleTitle: 'Difficult Conversations', level: 'advanced', topics: ['Feedback', 'Bad news', 'Boundaries', 'Assertiveness'] },
    ],
    lessons: [
      { title: 'Communication Styles & Active Listening', content: 'Understand communication types and practice active listening techniques.', order: 1, duration: 20 },
      { title: 'Emotional Intelligence', content: 'Develop self-awareness, empathy, and social skills for better relationships.', order: 2, duration: 25 },
      { title: 'Conflict Resolution & Difficult Conversations', content: 'Resolve conflicts, give feedback, and handle difficult conversations.', order: 3, duration: 25 },
    ],
  },
  {
    title: 'Cross-Cultural Communication', briefIntro: 'Communicate across cultures. Learn cultural dimensions, global business etiquette, and inclusive communication.',
    description: 'Navigate cultural differences — cultural dimensions, global etiquette, inclusive communication, and virtual teams.',
    category: 'Communication', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Cultural Awareness', level: 'beginner', topics: ['Cultural dimensions', 'Stereotypes', 'Cultural intelligence', 'Self-assessment'] },
      { moduleTitle: 'Business Etiquette', level: 'intermediate', topics: ['Greetings', 'Gift giving', 'Dining', 'Meeting styles'] },
      { moduleTitle: 'Communication Styles', level: 'intermediate', topics: ['High/low context', 'Direct/indirect', 'Formal/informal', 'Time orientation'] },
      { moduleTitle: 'Virtual Teams', level: 'advanced', topics: ['Time zones', 'Async communication', 'Tools', 'Trust building'] },
      { moduleTitle: 'Inclusion', level: 'advanced', topics: ['Language sensitivity', 'Unconscious bias', 'Accessibility', 'Allyship'] },
    ],
    lessons: [
      { title: 'Cultural Dimensions & Awareness', content: 'Understand cultural dimensions, build cultural intelligence, and avoid stereotypes.', order: 1, duration: 25 },
      { title: 'Business Etiquette & Styles', content: 'Learn global business etiquette and communication style differences.', order: 2, duration: 25 },
      { title: 'Virtual Teams & Inclusion', content: 'Manage virtual cross-cultural teams and practice inclusive communication.', order: 3, duration: 30 },
    ],
  },

  // ── 18. Psychology ──────────────────────────────────────────────
  {
    title: 'Introduction to Psychology', briefIntro: 'Explore the human mind. Learn cognitive processes, behavior, development, personality, and psychological disorders.',
    description: 'Explore the mind — cognitive processes, behavior, personality, development, and psychological disorders.',
    category: 'Psychology', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Psychology Basics', level: 'beginner', topics: ['History', 'Research methods', 'Schools of thought', 'Ethics'] },
      { moduleTitle: 'Cognitive', level: 'intermediate', topics: ['Perception', 'Memory', 'Learning', 'Problem solving'] },
      { moduleTitle: 'Development', level: 'intermediate', topics: ['Child development', 'Adolescence', 'Adulthood', 'Aging'] },
      { moduleTitle: 'Personality', level: 'advanced', topics: ['Trait theories', 'Big Five', 'Psychoanalytic', 'Humanistic'] },
      { moduleTitle: 'Abnormal', level: 'advanced', topics: ['Anxiety', 'Depression', 'Personality disorders', 'Treatment'] },
    ],
    lessons: [
      { title: 'Foundations of Psychology', content: 'Explore psychology\'s history, research methods, and major schools of thought.', order: 1, duration: 25 },
      { title: 'Cognitive & Developmental Psychology', content: 'Understand perception, memory, learning, and human development.', order: 2, duration: 30 },
      { title: 'Personality & Abnormal Psychology', content: 'Study personality theories, the Big Five, and common psychological disorders.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Behavioral Psychology & Habits', briefIntro: 'Understand and change behavior. Learn habit formation, motivation, behavioral design, and self-improvement science.',
    description: 'Understand behavior change — habit formation, motivation science, behavioral design, and self-improvement.',
    category: 'Psychology', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Habit Science', level: 'beginner', topics: ['Habit loop', 'Cue-routine-reward', 'Keystone habits', 'Habit stacking'] },
      { moduleTitle: 'Motivation', level: 'intermediate', topics: ['Intrinsic vs extrinsic', 'Self-determination', 'Flow state', 'Goal setting'] },
      { moduleTitle: 'Behavioral Design', level: 'intermediate', topics: ['Nudges', 'Choice architecture', 'Defaults', 'Friction'] },
      { moduleTitle: 'Change Psychology', level: 'advanced', topics: ['Stages of change', 'Resistance', 'Implementation intentions', 'Social support'] },
      { moduleTitle: 'Applications', level: 'advanced', topics: ['Productivity systems', 'Exercise habits', 'Digital wellbeing', 'Mindfulness'] },
    ],
    lessons: [
      { title: 'Habit Formation & Science', content: 'Understand the habit loop, keystone habits, and habit stacking strategies.', order: 1, duration: 25 },
      { title: 'Motivation & Behavioral Design', content: 'Apply motivation science, nudge theory, and choice architecture.', order: 2, duration: 25 },
      { title: 'Behavior Change & Applications', content: 'Navigate stages of change and build productivity and wellness habits.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Cognitive Psychology & Decision Making', briefIntro: 'Think better. Learn cognitive biases, heuristics, rational decision-making, and critical thinking skills.',
    description: 'Think better — cognitive biases, heuristics, rational decision-making, and critical thinking skills.',
    category: 'Psychology', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Thinking Systems', level: 'beginner', topics: ['System 1 & 2', 'Fast thinking', 'Slow thinking', 'Mental models'] },
      { moduleTitle: 'Cognitive Biases', level: 'intermediate', topics: ['Confirmation bias', 'Anchoring', 'Availability', 'Dunning-Kruger'] },
      { moduleTitle: 'Decision Making', level: 'intermediate', topics: ['Expected utility', 'Prospect theory', 'Risk assessment', 'Group decisions'] },
      { moduleTitle: 'Critical Thinking', level: 'advanced', topics: ['Logical fallacies', 'Argument analysis', 'Evidence evaluation', 'Debiasing'] },
      { moduleTitle: 'Applications', level: 'advanced', topics: ['Business decisions', 'Medical decisions', 'Legal reasoning', 'Policy making'] },
    ],
    lessons: [
      { title: 'System 1 & 2 Thinking', content: 'Understand dual-process theory and mental models for better thinking.', order: 1, duration: 25 },
      { title: 'Biases & Decision Making', content: 'Identify cognitive biases and apply prospect theory to decisions.', order: 2, duration: 30 },
      { title: 'Critical Thinking & Debiasing', content: 'Analyze arguments, evaluate evidence, and overcome cognitive biases.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Positive Psychology & Wellbeing', briefIntro: 'Thrive, not just survive. Learn happiness science, resilience, gratitude practices, and strengths-based approaches.',
    description: 'Science of thriving — happiness, resilience, gratitude, strengths, and evidence-based wellbeing practices.',
    category: 'Psychology', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Positive Psych Basics', level: 'beginner', topics: ['PERMA model', 'Happiness research', 'Wellbeing science', 'Strengths'] },
      { moduleTitle: 'Gratitude & Mindfulness', level: 'intermediate', topics: ['Gratitude practices', 'Meditation', 'Present moment', 'Savoring'] },
      { moduleTitle: 'Resilience', level: 'intermediate', topics: ['Growth mindset', 'Coping strategies', 'Post-traumatic growth', 'Grit'] },
      { moduleTitle: 'Strengths', level: 'advanced', topics: ['VIA strengths', 'Strengths-based development', 'Flow state', 'Peak performance'] },
      { moduleTitle: 'Applications', level: 'advanced', topics: ['Workplace wellbeing', 'Positive education', 'Relationships', 'Community'] },
    ],
    lessons: [
      { title: 'PERMA & Happiness Science', content: 'Understand the PERMA model, happiness research, and character strengths.', order: 1, duration: 20 },
      { title: 'Gratitude, Mindfulness & Resilience', content: 'Practice gratitude, meditation, and build resilience with a growth mindset.', order: 2, duration: 25 },
      { title: 'Strengths & Applications', content: 'Identify and use your strengths, achieve flow, and apply to work and life.', order: 3, duration: 25 },
    ],
  },
  {
    title: 'Social Psychology', briefIntro: 'Understand group behavior. Learn social influence, conformity, persuasion, group dynamics, and prejudice.',
    description: 'Understand group behavior — social influence, conformity, persuasion, group dynamics, and prejudice.',
    category: 'Psychology', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Social Influence', level: 'beginner', topics: ['Conformity', 'Obedience', 'Compliance', 'Social norms'] },
      { moduleTitle: 'Attitudes', level: 'intermediate', topics: ['Formation', 'Cognitive dissonance', 'Persuasion', 'Attitude change'] },
      { moduleTitle: 'Group Dynamics', level: 'intermediate', topics: ['Groupthink', 'Social loafing', 'Deindividuation', 'Leadership'] },
      { moduleTitle: 'Prejudice', level: 'advanced', topics: ['Stereotypes', 'Discrimination', 'Implicit bias', 'Reducing prejudice'] },
      { moduleTitle: 'Prosocial', level: 'advanced', topics: ['Helping behavior', 'Bystander effect', 'Altruism', 'Cooperation'] },
    ],
    lessons: [
      { title: 'Social Influence & Conformity', content: 'Study conformity, obedience, compliance, and social norms.', order: 1, duration: 25 },
      { title: 'Attitudes & Group Dynamics', content: 'Understand attitude formation, cognitive dissonance, and groupthink.', order: 2, duration: 30 },
      { title: 'Prejudice & Prosocial Behavior', content: 'Examine stereotypes, implicit bias, and the bystander effect.', order: 3, duration: 30 },
    ],
  },

  // ── 19. Photography ─────────────────────────────────────────────
  {
    title: 'Photography Fundamentals', briefIntro: 'Master your camera. Learn exposure triangle, composition, lighting, and shoot stunning photos in any condition.',
    description: 'Master photography — exposure triangle, composition, lighting, focus, and shooting in different conditions.',
    category: 'Photography', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Camera Basics', level: 'beginner', topics: ['Aperture', 'Shutter speed', 'ISO', 'Exposure triangle'] },
      { moduleTitle: 'Composition', level: 'beginner', topics: ['Rule of thirds', 'Leading lines', 'Framing', 'Symmetry'] },
      { moduleTitle: 'Lighting', level: 'intermediate', topics: ['Natural light', 'Golden hour', 'Flash basics', 'Reflectors'] },
      { moduleTitle: 'Focus & Depth', level: 'intermediate', topics: ['Autofocus modes', 'Depth of field', 'Bokeh', 'Hyperfocal'] },
      { moduleTitle: 'Genres', level: 'advanced', topics: ['Portrait', 'Landscape', 'Street', 'Macro'] },
    ],
    lessons: [
      { title: 'Exposure Triangle & Camera Settings', content: 'Master aperture, shutter speed, ISO, and shoot in manual mode.', order: 1, duration: 25 },
      { title: 'Composition & Lighting', content: 'Apply rule of thirds, leading lines, and work with natural light.', order: 2, duration: 25 },
      { title: 'Focus Techniques & Genres', content: 'Control depth of field, autofocus, and shoot portraits, landscapes, and street.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Photo Editing with Lightroom', briefIntro: 'Transform your photos in post-processing. Learn Lightroom workflow, color grading, presets, and batch editing.',
    description: 'Master Lightroom — importing, organizing, editing, color grading, presets, and export for print and web.',
    category: 'Photography', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Lightroom Basics', level: 'beginner', topics: ['Import', 'Library', 'Ratings', 'Collections'] },
      { moduleTitle: 'Basic Edits', level: 'intermediate', topics: ['Exposure', 'White balance', 'Tone curve', 'HSL'] },
      { moduleTitle: 'Color Grading', level: 'intermediate', topics: ['Color wheels', 'Split toning', 'Calibration', 'Profiles'] },
      { moduleTitle: 'Presets', level: 'advanced', topics: ['Creating presets', 'Importing', 'Batch editing', 'Consistency'] },
      { moduleTitle: 'Export', level: 'advanced', topics: ['Print settings', 'Web optimization', 'Watermarks', 'Tethered shooting'] },
    ],
    lessons: [
      { title: 'Lightroom Setup & Basic Edits', content: 'Import photos, organize library, and make basic exposure and color adjustments.', order: 1, duration: 25 },
      { title: 'Color Grading & Tone Curves', content: 'Master color grading with split toning, HSL sliders, and tone curves.', order: 2, duration: 30 },
      { title: 'Presets & Export', content: 'Create and apply presets, batch edit, and export for print and web.', order: 3, duration: 25 },
    ],
  },
  {
    title: 'Portrait Photography', briefIntro: 'Capture compelling portraits. Learn posing, lighting setups, lens selection, and directing subjects with confidence.',
    description: 'Capture stunning portraits — posing, lighting setups, lens selection, directing subjects, and retouching.',
    category: 'Photography', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Portrait Basics', level: 'beginner', topics: ['Lens choice', 'Distance', 'Background', 'Eye contact'] },
      { moduleTitle: 'Posing', level: 'intermediate', topics: ['Body language', 'Hand placement', 'Group poses', 'Natural posing'] },
      { moduleTitle: 'Lighting', level: 'intermediate', topics: ['Rembrandt', 'Butterfly', 'Split', 'Loop lighting'] },
      { moduleTitle: 'Studio', level: 'advanced', topics: ['Strobes', 'Softboxes', 'Backgrounds', 'Gels'] },
      { moduleTitle: 'Retouching', level: 'advanced', topics: ['Skin retouching', 'Dodge & burn', 'Eye enhancement', 'Color correction'] },
    ],
    lessons: [
      { title: 'Lens Selection & Posing', content: 'Choose the right lens, direct subjects, and master natural poses.', order: 1, duration: 25 },
      { title: 'Portrait Lighting Techniques', content: 'Use Rembrandt, butterfly, split, and loop lighting for stunning portraits.', order: 2, duration: 30 },
      { title: 'Studio Setup & Retouching', content: 'Set up studio lighting and retouch portraits professionally.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Drone Photography & Videography', briefIntro: 'Capture the world from above. Learn drone flying, aerial composition, regulations, and cinematic techniques.',
    description: 'Aerial photography — drone flying, composition, regulations, cinematic techniques, and video editing.',
    category: 'Photography', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Drone Basics', level: 'beginner', topics: ['Types of drones', 'Controls', 'Pre-flight checks', 'Battery management'] },
      { moduleTitle: 'Regulations', level: 'beginner', topics: ['Airspace', 'Registration', 'Part 107', 'No-fly zones'] },
      { moduleTitle: 'Aerial Composition', level: 'intermediate', topics: ['Top-down', 'Reveal shots', 'Orbits', 'Leading lines'] },
      { moduleTitle: 'Cinematic Techniques', level: 'advanced', topics: ['Dolly zoom', 'Hyperlapse', 'Waypoints', 'ND filters'] },
      { moduleTitle: 'Editing', level: 'advanced', topics: ['Color grading aerials', 'Stabilization', 'Panorama stitching', 'HDR'] },
    ],
    lessons: [
      { title: 'Drone Flying & Regulations', content: 'Learn to fly safely, understand regulations, and perform pre-flight checks.', order: 1, duration: 25 },
      { title: 'Aerial Composition & Techniques', content: 'Capture stunning aerials with reveal shots, orbits, and cinematic moves.', order: 2, duration: 30 },
      { title: 'Cinematic Editing & Post-Processing', content: 'Edit aerial footage, color grade, and create hyperlapse sequences.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Mobile Photography', briefIntro: 'Take amazing photos with your phone. Learn mobile camera techniques, editing apps, and social media optimization.',
    description: 'Take stunning phone photos — mobile camera techniques, editing apps, and optimizing for social media.',
    category: 'Photography', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Phone Camera', level: 'beginner', topics: ['Settings', 'Lenses', 'Focus tap', 'HDR mode'] },
      { moduleTitle: 'Composition', level: 'beginner', topics: ['Grid overlay', 'Perspectives', 'Minimalism', 'Color'] },
      { moduleTitle: 'Editing Apps', level: 'intermediate', topics: ['Snapseed', 'VSCO', 'Lightroom Mobile', 'Afterlight'] },
      { moduleTitle: 'Social Media', level: 'intermediate', topics: ['Instagram', 'Aspect ratios', 'Filters', 'Hashtags'] },
      { moduleTitle: 'Advanced', level: 'advanced', topics: ['RAW shooting', 'Long exposure', 'Night mode', 'ProRAW'] },
    ],
    lessons: [
      { title: 'Phone Camera Settings & Composition', content: 'Optimize phone camera settings and apply composition rules.', order: 1, duration: 20 },
      { title: 'Mobile Editing Apps', content: 'Edit photos with Snapseed, VSCO, and Lightroom Mobile.', order: 2, duration: 25 },
      { title: 'Social Media & Advanced Techniques', content: 'Optimize for Instagram, shoot in RAW, and use night mode effectively.', order: 3, duration: 25 },
    ],
  },

  // ── 20. Music Production ────────────────────────────────────────
  {
    title: 'Music Production Fundamentals', briefIntro: 'Start making music. Learn DAWs, MIDI, audio recording, basic mixing, and music theory for producers.',
    description: 'Start producing music — DAW setup, MIDI, audio recording, basic mixing, and music theory for producers.',
    category: 'Music Production', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'DAW Basics', level: 'beginner', topics: ['Interface', 'Tracks', 'Timeline', 'Recording'] },
      { moduleTitle: 'MIDI', level: 'beginner', topics: ['MIDI notes', 'Velocity', 'Quantization', 'Controllers'] },
      { moduleTitle: 'Music Theory', level: 'intermediate', topics: ['Scales', 'Chords', 'Progressions', 'Rhythm'] },
      { moduleTitle: 'Basic Mixing', level: 'intermediate', topics: ['Levels', 'Panning', 'EQ basics', 'Effects'] },
      { moduleTitle: 'Arrangement', level: 'advanced', topics: ['Song structure', 'Builds', 'Drops', 'Transitions'] },
    ],
    lessons: [
      { title: 'DAW Setup & MIDI', content: 'Set up your DAW, record MIDI, and understand the production interface.', order: 1, duration: 25 },
      { title: 'Music Theory for Producers', content: 'Learn scales, chords, and chord progressions essential for producers.', order: 2, duration: 30 },
      { title: 'Mixing & Arrangement', content: 'Mix tracks with EQ and effects, and arrange songs with proper structure.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Mixing & Mastering', briefIntro: 'Polish your tracks professionally. Learn EQ, compression, reverb, stereo imaging, and mastering for distribution.',
    description: 'Professional mixing — EQ, compression, reverb, stereo imaging, and mastering for streaming platforms.',
    category: 'Music Production', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1519508234439-4f23643a7e4a?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Mixing Basics', level: 'beginner', topics: ['Gain staging', 'Level balancing', 'Pan law', 'Bus routing'] },
      { moduleTitle: 'EQ & Compression', level: 'intermediate', topics: ['Parametric EQ', 'High-pass filter', 'Compression ratio', 'Sidechain'] },
      { moduleTitle: 'Effects', level: 'intermediate', topics: ['Reverb types', 'Delay', 'Chorus', 'Saturation'] },
      { moduleTitle: 'Stereo Imaging', level: 'advanced', topics: ['Width', 'Mid/Side', 'Haas effect', 'Mono compatibility'] },
      { moduleTitle: 'Mastering', level: 'advanced', topics: ['Limiting', 'LUFS', 'Reference tracks', 'Distribution formats'] },
    ],
    lessons: [
      { title: 'Gain Staging & EQ', content: 'Set proper gain structure, balance levels, and shape sound with EQ.', order: 1, duration: 30 },
      { title: 'Compression & Effects', content: 'Apply compression, reverb, delay, and creative effects to your mix.', order: 2, duration: 35 },
      { title: 'Stereo Imaging & Mastering', content: 'Create wide stereo mixes and master for streaming platform standards.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Electronic Music Production', briefIntro: 'Produce electronic music. Learn synthesis, sound design, beat making, and genre-specific production techniques.',
    description: 'Produce electronic music — synthesis, sound design, beat making, and genre-specific techniques.',
    category: 'Music Production', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Synthesis Basics', level: 'beginner', topics: ['Oscillators', 'Filters', 'Envelopes', 'LFOs'] },
      { moduleTitle: 'Sound Design', level: 'intermediate', topics: ['Bass design', 'Lead sounds', 'Pads', 'FX sounds'] },
      { moduleTitle: 'Beat Making', level: 'intermediate', topics: ['Drum patterns', 'Sampling', 'Swing', 'Layering'] },
      { moduleTitle: 'Genre Techniques', level: 'advanced', topics: ['House', 'Techno', 'DnB', 'Future bass'] },
      { moduleTitle: 'Live Performance', level: 'advanced', topics: ['Ableton Live', 'Controllers', 'Sets', 'DJ integration'] },
    ],
    lessons: [
      { title: 'Synthesis & Sound Design', content: 'Learn oscillators, filters, envelopes, and design bass, lead, and pad sounds.', order: 1, duration: 30 },
      { title: 'Beat Making & Sampling', content: 'Create drum patterns, sample audio, and layer sounds for full beats.', order: 2, duration: 30 },
      { title: 'Genre Production & Performance', content: 'Produce genre-specific tracks and set up live performance workflows.', order: 3, duration: 35 },
    ],
  },
  {
    title: 'Songwriting & Composition', briefIntro: 'Write memorable songs. Learn melody, harmony, lyrics, song structure, and creative inspiration techniques.',
    description: 'Write great songs — melody, harmony, lyrics, structure, and creative techniques for all genres.',
    category: 'Music Production', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Songwriting Basics', level: 'beginner', topics: ['Song forms', 'Verse/chorus', 'Hooks', 'Melody'] },
      { moduleTitle: 'Harmony', level: 'intermediate', topics: ['Chord progressions', 'Key changes', 'Tension/resolution', 'Modes'] },
      { moduleTitle: 'Lyrics', level: 'intermediate', topics: ['Rhyme schemes', 'Imagery', 'Storytelling', 'Rewriting'] },
      { moduleTitle: 'Composition', level: 'advanced', topics: ['Orchestration', 'Counterpoint', 'Film scoring', 'Arrangement'] },
      { moduleTitle: 'Creativity', level: 'advanced', topics: ['Overcoming blocks', 'Co-writing', 'Workflow', 'Industry'] },
    ],
    lessons: [
      { title: 'Song Structure & Melody', content: 'Learn song forms, write memorable melodies, and craft strong hooks.', order: 1, duration: 25 },
      { title: 'Harmony & Lyrics', content: 'Build chord progressions, write evocative lyrics, and use imagery.', order: 2, duration: 25 },
      { title: 'Composition & Creativity', content: 'Compose arrangements, explore film scoring, and overcome creative blocks.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Audio Engineering & Recording', briefIntro: 'Record professional-quality audio. Learn microphone techniques, studio setup, signal flow, and live sound.',
    description: 'Record professional audio — microphone techniques, studio setup, signal flow, and live sound engineering.',
    category: 'Music Production', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Audio Basics', level: 'beginner', topics: ['Sound waves', 'Frequency', 'Amplitude', 'Decibels'] },
      { moduleTitle: 'Microphones', level: 'intermediate', topics: ['Types', 'Polar patterns', 'Placement', 'Stereo techniques'] },
      { moduleTitle: 'Studio Setup', level: 'intermediate', topics: ['Acoustics', 'Treatment', 'Signal flow', 'Patchbay'] },
      { moduleTitle: 'Recording', level: 'advanced', topics: ['Vocals', 'Drums', 'Guitar', 'Orchestra'] },
      { moduleTitle: 'Live Sound', level: 'advanced', topics: ['PA systems', 'Monitors', 'Front of house', 'Troubleshooting'] },
    ],
    lessons: [
      { title: 'Sound Physics & Microphones', content: 'Understand sound waves, frequencies, and choose the right microphone.', order: 1, duration: 25 },
      { title: 'Studio Setup & Signal Flow', content: 'Treat room acoustics, set up signal flow, and configure patchbays.', order: 2, duration: 35 },
      { title: 'Recording & Live Sound', content: 'Record vocals, drums, and guitar, and set up live sound systems.', order: 3, duration: 35 },
    ],
  },

  // ── 21. Writing ─────────────────────────────────────────────────
  {
    title: 'Creative Writing Fundamentals', briefIntro: 'Unlock your writing potential. Learn fiction techniques, character development, plot structure, and world building.',
    description: 'Unlock creativity — fiction techniques, character development, plot structure, dialogue, and world building.',
    category: 'Writing', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Writing Basics', level: 'beginner', topics: ['Show vs tell', 'Point of view', 'Tense', 'Voice'] },
      { moduleTitle: 'Character', level: 'intermediate', topics: ['Character arcs', 'Motivation', 'Backstory', 'Dialogue'] },
      { moduleTitle: 'Plot', level: 'intermediate', topics: ['Three-act structure', 'Hero\'s journey', 'Conflict', 'Pacing'] },
      { moduleTitle: 'World Building', level: 'advanced', topics: ['Setting', 'Magic systems', 'Culture', 'History'] },
      { moduleTitle: 'Revision', level: 'advanced', topics: ['Self-editing', 'Beta readers', 'Workshops', 'Publishing'] },
    ],
    lessons: [
      { title: 'Writing Craft & Voice', content: 'Master show vs tell, point of view, and develop your unique writing voice.', order: 1, duration: 25 },
      { title: 'Character & Plot Development', content: 'Create compelling characters, build plot structure, and write dialogue.', order: 2, duration: 30 },
      { title: 'World Building & Revision', content: 'Construct immersive worlds, revise effectively, and prepare for publishing.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Technical Writing', briefIntro: 'Write clear technical documentation. Learn API docs, user guides, tutorials, and documentation architecture.',
    description: 'Write clear technical docs — API documentation, user guides, tutorials, and information architecture.',
    category: 'Writing', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Tech Writing Basics', level: 'beginner', topics: ['Audience analysis', 'Clarity', 'Structure', 'Formatting'] },
      { moduleTitle: 'Documentation Types', level: 'intermediate', topics: ['API docs', 'User guides', 'Tutorials', 'FAQs'] },
      { moduleTitle: 'Tools', level: 'intermediate', topics: ['Markdown', 'Docs as code', 'Static site generators', 'Version control'] },
      { moduleTitle: 'Information Architecture', level: 'advanced', topics: ['Navigation', 'Search', 'Taxonomy', 'Content models'] },
      { moduleTitle: 'Style & Process', level: 'advanced', topics: ['Style guides', 'Localization', 'Accessibility', 'Content strategy'] },
    ],
    lessons: [
      { title: 'Audience & Clarity', content: 'Analyze your audience, write clearly, and structure technical content.', order: 1, duration: 25 },
      { title: 'Documentation Types & Tools', content: 'Write API docs, tutorials, and use Markdown and docs-as-code tools.', order: 2, duration: 30 },
      { title: 'Architecture & Style', content: 'Design information architecture, create style guides, and plan content.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Copywriting for Conversion', briefIntro: 'Write copy that sells. Learn headlines, CTAs, landing pages, email sequences, and persuasion psychology.',
    description: 'Write copy that converts — headlines, CTAs, landing pages, email sequences, and persuasion psychology.',
    category: 'Writing', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Copy Basics', level: 'beginner', topics: ['Features vs benefits', 'Unique value', 'Target audience', 'Tone'] },
      { moduleTitle: 'Headlines', level: 'intermediate', topics: ['Power words', 'Formulas', 'A/B testing', 'Click-through'] },
      { moduleTitle: 'Landing Pages', level: 'intermediate', topics: ['Above the fold', 'Social proof', 'CTAs', 'Forms'] },
      { moduleTitle: 'Email Sequences', level: 'advanced', topics: ['Welcome series', 'Nurture', 'Sales sequences', 'Subject lines'] },
      { moduleTitle: 'Psychology', level: 'advanced', topics: ['Scarcity', 'Authority', 'Social proof', 'Reciprocity'] },
    ],
    lessons: [
      { title: 'Copywriting Fundamentals', content: 'Write benefits-focused copy, define your audience, and set tone.', order: 1, duration: 25 },
      { title: 'Headlines & Landing Pages', content: 'Write compelling headlines, design landing page copy, and optimize CTAs.', order: 2, duration: 25 },
      { title: 'Email Copy & Persuasion', content: 'Create email sequences and apply persuasion psychology in copywriting.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Blogging & Content Creation', briefIntro: 'Build a successful blog. Learn content strategy, SEO writing, monetization, and growing your audience.',
    description: 'Build a successful blog — content strategy, SEO writing, monetization, audience growth, and email lists.',
    category: 'Writing', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Blog Setup', level: 'beginner', topics: ['Platform selection', 'Domain', 'Design', 'Branding'] },
      { moduleTitle: 'Writing Posts', level: 'intermediate', topics: ['Headlines', 'Structure', 'Engagement', 'Storytelling'] },
      { moduleTitle: 'SEO', level: 'intermediate', topics: ['Keyword research', 'On-page SEO', 'Internal linking', 'Featured snippets'] },
      { moduleTitle: 'Growth', level: 'advanced', topics: ['Email list', 'Social media', 'Guest posting', 'Networking'] },
      { moduleTitle: 'Monetization', level: 'advanced', topics: ['Ads', 'Affiliate marketing', 'Products', 'Sponsorships'] },
    ],
    lessons: [
      { title: 'Blog Setup & Writing', content: 'Choose a platform, design your blog, and write engaging posts.', order: 1, duration: 25 },
      { title: 'SEO & Growth', content: 'Optimize for search engines, build email lists, and grow your audience.', order: 2, duration: 25 },
      { title: 'Monetization', content: 'Monetize with ads, affiliates, products, and sponsorships.', order: 3, duration: 25 },
    ],
  },
  {
    title: 'Screenwriting & Scriptwriting', briefIntro: 'Write for screen. Learn screenplay format, story structure, dialogue, character arcs, and pitching.',
    description: 'Write for screen — screenplay format, story structure, dialogue, character development, and pitching.',
    category: 'Writing', difficulty: 'advanced', thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Format', level: 'beginner', topics: ['Screenplay format', 'Scene headings', 'Action lines', 'Dialogue'] },
      { moduleTitle: 'Story Structure', level: 'intermediate', topics: ['Three acts', 'Beat sheets', 'Midpoint', 'Climax'] },
      { moduleTitle: 'Character', level: 'intermediate', topics: ['Protagonist', 'Antagonist', 'Arc', 'Subtext'] },
      { moduleTitle: 'Dialogue', level: 'advanced', topics: ['Voice', 'Subtext', 'Exposition', 'Conflict'] },
      { moduleTitle: 'Industry', level: 'advanced', topics: ['Pitching', 'Logline', 'Query letters', 'Agents'] },
    ],
    lessons: [
      { title: 'Screenplay Format & Structure', content: 'Master screenplay format, three-act structure, and beat sheets.', order: 1, duration: 25 },
      { title: 'Character & Dialogue', content: 'Create compelling characters, write natural dialogue with subtext.', order: 2, duration: 30 },
      { title: 'Industry & Pitching', content: 'Write loglines, pitch to producers, and navigate the screenwriting industry.', order: 3, duration: 30 },
    ],
  },

  // ── 22. Health & Fitness ────────────────────────────────────────
  {
    title: 'Fitness & Exercise Science', briefIntro: 'Train smarter with science. Learn exercise physiology, program design, nutrition basics, and injury prevention.',
    description: 'Train smart — exercise physiology, program design, nutrition basics, and injury prevention.',
    category: 'Health & Fitness', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Exercise Basics', level: 'beginner', topics: ['Muscle groups', 'Movement patterns', 'Rep ranges', 'Rest periods'] },
      { moduleTitle: 'Program Design', level: 'intermediate', topics: ['Progressive overload', 'Periodization', 'Splits', 'Deloads'] },
      { moduleTitle: 'Cardio', level: 'intermediate', topics: ['HIIT', 'LISS', 'Heart rate zones', 'VO2 max'] },
      { moduleTitle: 'Nutrition', level: 'advanced', topics: ['Macros', 'Meal timing', 'Supplements', 'Hydration'] },
      { moduleTitle: 'Recovery', level: 'advanced', topics: ['Sleep', 'Stretching', 'Foam rolling', 'Injury prevention'] },
    ],
    lessons: [
      { title: 'Exercise Fundamentals', content: 'Understand muscle groups, movement patterns, and proper form.', order: 1, duration: 25 },
      { title: 'Program Design & Cardio', content: 'Design training programs with progressive overload and effective cardio.', order: 2, duration: 30 },
      { title: 'Nutrition & Recovery', content: 'Calculate macros, plan meals, and optimize recovery with sleep and stretching.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Yoga & Mindfulness', briefIntro: 'Find balance through yoga and mindfulness. Learn asanas, breathwork, meditation, and stress management.',
    description: 'Find balance — yoga asanas, breathwork, meditation, and mindfulness for stress management.',
    category: 'Health & Fitness', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Yoga Basics', level: 'beginner', topics: ['Sun salutation', 'Standing poses', 'Seated poses', 'Alignment'] },
      { moduleTitle: 'Breathwork', level: 'intermediate', topics: ['Pranayama', 'Box breathing', '4-7-8', 'Alternate nostril'] },
      { moduleTitle: 'Meditation', level: 'intermediate', topics: ['Mindfulness', 'Body scan', 'Loving-kindness', 'Walking meditation'] },
      { moduleTitle: 'Advanced Asanas', level: 'advanced', topics: ['Inversions', 'Arm balances', 'Backbends', 'Transitions'] },
      { moduleTitle: 'Lifestyle', level: 'advanced', topics: ['Philosophy', 'Ayurveda basics', 'Teaching', 'Retreat planning'] },
    ],
    lessons: [
      { title: 'Yoga Fundamentals', content: 'Learn sun salutations, standing and seated poses, and proper alignment.', order: 1, duration: 25 },
      { title: 'Breathwork & Meditation', content: 'Practice pranayama, box breathing, and mindfulness meditation techniques.', order: 2, duration: 25 },
      { title: 'Advanced Practice & Philosophy', content: 'Master inversions, arm balances, and explore yoga philosophy.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Nutrition Science & Diet Planning', briefIntro: 'Eat smarter with science. Learn macronutrients, micronutrients, meal planning, and evidence-based nutrition.',
    description: 'Evidence-based nutrition — macros, micros, meal planning, dietary patterns, and sports nutrition.',
    category: 'Health & Fitness', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Nutrition Basics', level: 'beginner', topics: ['Macronutrients', 'Micronutrients', 'Calories', 'Water'] },
      { moduleTitle: 'Dietary Patterns', level: 'intermediate', topics: ['Mediterranean', 'Plant-based', 'Keto', 'Intermittent fasting'] },
      { moduleTitle: 'Meal Planning', level: 'intermediate', topics: ['Prep strategies', 'Grocery lists', 'Budget meals', 'Batch cooking'] },
      { moduleTitle: 'Sports Nutrition', level: 'advanced', topics: ['Pre-workout', 'Post-workout', 'Supplements', 'Periodization'] },
      { moduleTitle: 'Special Needs', level: 'advanced', topics: ['Weight management', 'Allergies', 'Gut health', 'Aging nutrition'] },
    ],
    lessons: [
      { title: 'Macros, Micros & Calories', content: 'Understand macronutrients, micronutrients, and caloric needs.', order: 1, duration: 25 },
      { title: 'Diet Patterns & Meal Planning', content: 'Explore dietary patterns and create practical meal plans.', order: 2, duration: 25 },
      { title: 'Sports & Special Nutrition', content: 'Optimize nutrition for exercise, manage weight, and address special needs.', order: 3, duration: 30 },
    ],
  },
  {
    title: 'Mental Health & Stress Management', briefIntro: 'Protect your mental wellbeing. Learn stress management, coping strategies, work-life balance, and when to seek help.',
    description: 'Mental wellbeing — stress management, coping strategies, work-life balance, and professional help.',
    category: 'Health & Fitness', difficulty: 'intermediate', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Understanding Stress', level: 'beginner', topics: ['Stress response', 'Acute vs chronic', 'Triggers', 'Signs'] },
      { moduleTitle: 'Coping Strategies', level: 'intermediate', topics: ['Cognitive reframing', 'Relaxation', 'Exercise', 'Social support'] },
      { moduleTitle: 'Work-Life Balance', level: 'intermediate', topics: ['Boundaries', 'Time management', 'Digital detox', 'Hobbies'] },
      { moduleTitle: 'Mental Health', level: 'advanced', topics: ['Anxiety management', 'Depression awareness', 'Self-care', 'Resilience'] },
      { moduleTitle: 'Professional Help', level: 'advanced', topics: ['When to seek help', 'Therapy types', 'Resources', 'Support systems'] },
    ],
    lessons: [
      { title: 'Understanding & Managing Stress', content: 'Recognize stress triggers and learn immediate coping techniques.', order: 1, duration: 20 },
      { title: 'Coping Strategies & Work-Life Balance', content: 'Practice cognitive reframing, set boundaries, and balance work and life.', order: 2, duration: 25 },
      { title: 'Mental Health & Getting Help', content: 'Understand anxiety, depression, self-care, and when to seek professional help.', order: 3, duration: 25 },
    ],
  },
  {
    title: 'Sleep Science & Optimization', briefIntro: 'Sleep better with science. Learn sleep cycles, circadian rhythm, sleep hygiene, and overcoming insomnia.',
    description: 'Optimize sleep — sleep cycles, circadian rhythm, sleep hygiene, insomnia solutions, and napping strategies.',
    category: 'Health & Fitness', difficulty: 'beginner', thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=3840&auto=format&fit=crop&q=80',
    syllabus: [
      { moduleTitle: 'Sleep Science', level: 'beginner', topics: ['Sleep cycles', 'Stages', 'Circadian rhythm', 'Chronotypes'] },
      { moduleTitle: 'Sleep Hygiene', level: 'beginner', topics: ['Bedroom environment', 'Routine', 'Screen time', 'Temperature'] },
      { moduleTitle: 'Sleep Disruptors', level: 'intermediate', topics: ['Caffeine', 'Alcohol', 'Stress', 'Blue light'] },
      { moduleTitle: 'Insomnia', level: 'advanced', topics: ['CBT-I', 'Sleep restriction', 'Stimulus control', 'Relaxation'] },
      { moduleTitle: 'Optimization', level: 'advanced', topics: ['Napping', 'Jet lag', 'Shift work', 'Tracking devices'] },
    ],
    lessons: [
      { title: 'Sleep Cycles & Circadian Rhythm', content: 'Understand sleep stages, circadian rhythm, and your chronotype.', order: 1, duration: 20 },
      { title: 'Sleep Hygiene & Disruptors', content: 'Optimize your bedroom, build a routine, and eliminate sleep disruptors.', order: 2, duration: 20 },
      { title: 'Insomnia & Optimization', content: 'Overcome insomnia with CBT-I, strategic napping, and manage jet lag.', order: 3, duration: 25 },
    ],
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedCourses = async () => {
  let connectedHere = false;

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      connectedHere = true;
      console.log('✅ Connected to MongoDB');
    }

    // Get or create instructor
    let instructor = await User.findOne({ email: 'instructor@plms.com' });
    if (!instructor) {
      const hashedPassword = await bcrypt.hash('Instructor123!', 12);
      instructor = await User.create({
        name: 'PLMS Instructor',
        email: 'instructor@plms.com',
        password: hashedPassword,
        role: 'instructor',
      });
      console.log('✅ Created instructor user');
    }

    // Clear existing courses, lessons, quizzes
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🗑️  Cleared existing courses, lessons, and quizzes');

    let totalLessons = 0;
    let totalQuizzes = 0;

    for (const courseData of allCourses) {
      const { lessons: lessonsData, ...courseFields } = courseData;

      // Create course
      const course = await Course.create({
        ...courseFields,
        instructor: instructor._id,
        modules: [],
      });

      // Create lessons
      const createdLessons = [];
      for (const lessonData of lessonsData) {
        const lesson = await Lesson.create({
          ...lessonData,
          course: course._id,
        });
        createdLessons.push(lesson);
      }
      totalLessons += createdLessons.length;

      // Update course with module containing created lessons
      await Course.findByIdAndUpdate(course._id, {
        modules: [
          {
            title: `${courseFields.title} — Core Module`,
            lessons: createdLessons.map((l) => l._id),
          },
        ],
      });

      // Create a quiz for every course
      await Quiz.create({
        title: `${course.title} — Assessment`,
        course: course._id,
        questions: [
          {
            questionText: `What is the primary focus of "${course.title}"?`,
            options: [
              { text: 'Understanding core concepts and building practical skills', isCorrect: true },
              { text: 'Advanced theoretical concepts only', isCorrect: false },
              { text: 'Historical context and trivia', isCorrect: false },
              { text: 'Unrelated subject matter', isCorrect: false },
            ],
            points: 1,
            difficulty: 'easy',
          },
          {
            questionText: `Which approach best helps you master "${course.title}"?`,
            options: [
              { text: 'Consistent practice and building real projects', isCorrect: true },
              { text: 'Memorization without application', isCorrect: false },
              { text: 'Passive video watching only', isCorrect: false },
              { text: 'Skipping foundational topics', isCorrect: false },
            ],
            points: 2,
            difficulty: 'medium',
          },
          {
            questionText: `How would you apply "${course.title}" in a real-world scenario?`,
            options: [
              { text: 'By solving real problems and iterating on solutions', isCorrect: true },
              { text: 'By studying theory exclusively', isCorrect: false },
              { text: 'By copying solutions without understanding', isCorrect: false },
              { text: 'By avoiding hands-on practice', isCorrect: false },
            ],
            points: 2,
            difficulty: 'medium',
          },
        ],
        passingScore: 3,
        quizType: 'graded',
      });
      totalQuizzes++;

      console.log(`  ✅ ${course.title}`);
    }

    // Summary
    const categories = [...new Set(allCourses.map((c) => c.category))];
    console.log(`\n══════════════════════════════════════════`);
    console.log(`✅ Seed complete!`);
    console.log(`   📚 ${allCourses.length} courses across ${categories.length} categories`);
    console.log(`   📖 ${totalLessons} lessons`);
    console.log(`   📝 ${totalQuizzes} quizzes`);
    console.log(`   📁 Categories: ${categories.join(', ')}`);
    console.log(`══════════════════════════════════════════\n`);

    return { seeded: true, courses: allCourses.length, categories: categories.length };
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    if (connectedHere) {
      await mongoose.disconnect();
    }
  }
};

if (require.main === module) {
  seedCourses()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedCourses;
