require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Template questions to quickly construct quizzes
const questionsTemplates = {
  'Web Development': [
    {
      questionText: 'Which HTML5 element is used to display self-contained content like illustrations, diagrams, or photos?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: '<figure>', isCorrect: true },
        { text: '<picture>', isCorrect: false },
        { text: '<aside>', isCorrect: false },
        { text: '<section>', isCorrect: false }
      ]
    },
    {
      questionText: 'What is the correct syntax to select elements with class "active" in CSS?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: '.active', isCorrect: true },
        { text: '#active', isCorrect: false },
        { text: 'active', isCorrect: false },
        { text: '*active', isCorrect: false }
      ]
    },
    {
      questionText: 'Which function serializes a JavaScript object into a JSON string?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'JSON.stringify()', isCorrect: true },
        { text: 'JSON.parse()', isCorrect: false },
        { text: 'Object.toJSON()', isCorrect: false },
        { text: 'String.serialize()', isCorrect: false }
      ]
    },
    {
      questionText: 'What is the purpose of the HTTP POST method?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'To send data to a server to create/update a resource', isCorrect: true },
        { text: 'To retrieve data from a server', isCorrect: false },
        { text: 'To delete a resource from a server', isCorrect: false },
        { text: 'To check headers of a resource', isCorrect: false }
      ]
    },
    {
      questionText: 'Which SQL statement is used to extract data from a database?',
      points: 2,
      difficulty: 'hard',
      options: [
        { text: 'SELECT', isCorrect: true },
        { text: 'GET', isCorrect: false },
        { text: 'EXTRACT', isCorrect: false },
        { text: 'FETCH', isCorrect: false }
      ]
    }
  ],
  'Data Science': [
    {
      questionText: 'What is the primary Python library used for data manipulation and analysis?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: 'Pandas', isCorrect: true },
        { text: 'NumPy', isCorrect: false },
        { text: 'Matplotlib', isCorrect: false },
        { text: 'Scikit-learn', isCorrect: false }
      ]
    },
    {
      questionText: 'In data science, what does "NaN" stand for?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: 'Not a Number', isCorrect: true },
        { text: 'New and Null', isCorrect: false },
        { text: 'Node Array Network', isCorrect: false },
        { text: 'Numeric and Null', isCorrect: false }
      ]
    },
    {
      questionText: 'Which machine learning algorithm is supervised?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'Linear Regression', isCorrect: true },
        { text: 'K-Means Clustering', isCorrect: false },
        { text: 'Principal Component Analysis (PCA)', isCorrect: false },
        { text: 'Hierarchical Clustering', isCorrect: false }
      ]
    },
    {
      questionText: 'What is the purpose of a validation set during model training?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'To tune model hyperparameters and prevent overfitting', isCorrect: true },
        { text: 'To train the model parameters directly', isCorrect: false },
        { text: 'To evaluate the final performance of the deployed system', isCorrect: false },
        { text: 'To load raw database CSV rows', isCorrect: false }
      ]
    },
    {
      questionText: 'Which activation function is most commonly used in hidden layers of Deep Neural Networks?',
      points: 2,
      difficulty: 'hard',
      options: [
        { text: 'ReLU', isCorrect: true },
        { text: 'Sigmoid', isCorrect: false },
        { text: 'Softmax', isCorrect: false },
        { text: 'Linear', isCorrect: false }
      ]
    }
  ],
  'Design': [
    {
      questionText: 'What does "UI" stand for in digital design?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: 'User Interface', isCorrect: true },
        { text: 'User Interaction', isCorrect: false },
        { text: 'User Integration', isCorrect: false },
        { text: 'Universal Interface', isCorrect: false }
      ]
    },
    {
      questionText: 'What color model is typically used for digital screens?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: 'RGB', isCorrect: true },
        { text: 'CMYK', isCorrect: false },
        { text: 'Pantone', isCorrect: false },
        { text: 'RYB', isCorrect: false }
      ]
    },
    {
      questionText: 'What is the purpose of Auto Layout in Figma?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'To create dynamic, responsive designs that adjust to content changes', isCorrect: true },
        { text: 'To automatically export images to PNG format', isCorrect: false },
        { text: 'To automatically generate CSS code code snippets', isCorrect: false },
        { text: 'To crop layout images', isCorrect: false }
      ]
    },
    {
      questionText: 'Which Gestalt principle states that objects near each other tend to be grouped together?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'Proximity', isCorrect: true },
        { text: 'Similarity', isCorrect: false },
        { text: 'Continuity', isCorrect: false },
        { text: 'Closure', isCorrect: false }
      ]
    },
    {
      questionText: 'What is WCAG compliance primarily concerned with in UI/UX design?',
      points: 2,
      difficulty: 'hard',
      options: [
        { text: 'Web accessibility standards for users with disabilities', isCorrect: true },
        { text: 'Database response rendering speeds', isCorrect: false },
        { text: 'Search engine keyword optimization', isCorrect: false },
        { text: 'File compression formats', isCorrect: false }
      ]
    }
  ],
  'Marketing': [
    {
      questionText: 'What does SEO stand for in growth marketing?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: 'Search Engine Optimization', isCorrect: true },
        { text: 'Social Engagement Operations', isCorrect: false },
        { text: 'Software Engineering Organization', isCorrect: false },
        { text: 'Sales Execution Optimization', isCorrect: false }
      ]
    },
    {
      questionText: 'What is Click-Through Rate (CTR) commonly defined as?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: 'Percentage of impressions that result in a click', isCorrect: true },
        { text: 'Total clicks divided by purchases', isCorrect: false },
        { text: 'Bounce rate times conversion rate', isCorrect: false },
        { text: 'Ad budget spend per click', isCorrect: false }
      ]
    },
    {
      questionText: 'Which file guides search engine crawlers on which directories can be scanned?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'robots.txt', isCorrect: true },
        { text: 'sitemap.xml', isCorrect: false },
        { text: 'index.html', isCorrect: false },
        { text: 'htaccess.conf', isCorrect: false }
      ]
    },
    {
      questionText: 'What is A/B testing primarily used for in marketing?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'Comparing two versions of a webpage to see which performs better', isCorrect: true },
        { text: 'Backing up user databases', isCorrect: false },
        { text: 'Analyzing keyword densities', isCorrect: false },
        { text: 'Checking cross-browser CSS compliance', isCorrect: false }
      ]
    },
    {
      questionText: 'What represents the lifetime value of a customer (LTV)?',
      points: 2,
      difficulty: 'hard',
      options: [
        { text: 'The projected total revenue generated by a customer over their relationship', isCorrect: true },
        { text: 'The initial purchase price of the customer', isCorrect: false },
        { text: 'The cost to acquire the customer (CAC)', isCorrect: false },
        { text: 'The weekly average retention rate', isCorrect: false }
      ]
    }
  ],
  'Business': [
    {
      questionText: 'What is the primary role of a Scrum Master in Agile?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: 'Facilitating Scrum processes and removing impediments for the team', isCorrect: true },
        { text: 'Writing all user stories and code specifications', isCorrect: false },
        { text: 'Managing the project budget allocations', isCorrect: false },
        { text: 'Hiring and firing developers', isCorrect: false }
      ]
    },
    {
      questionText: 'In business, what does KPIs stand for?',
      points: 2,
      difficulty: 'easy',
      options: [
        { text: 'Key Performance Indicators', isCorrect: true },
        { text: 'Key Product Integrations', isCorrect: false },
        { text: 'Kernel Process Instances', isCorrect: false },
        { text: 'Knowledge Performance Index', isCorrect: false }
      ]
    },
    {
      questionText: 'Which methodology focuses on continuous incremental improvements?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'Kaizen / Lean', isCorrect: true },
        { text: 'Waterfall', isCorrect: false },
        { text: 'Six Sigma DMAIC only', isCorrect: false },
        { text: 'Critical Path Method', isCorrect: false }
      ]
    },
    {
      questionText: 'What is project scope creep?',
      points: 2,
      difficulty: 'medium',
      options: [
        { text: 'Uncontrolled changes or growth in a project scope without adjustments to time and cost', isCorrect: true },
        { text: 'Delays in the critical path tasks', isCorrect: false },
        { text: 'Resource reallocation during sprint planning', isCorrect: false },
        { text: 'Database query execution delays', isCorrect: false }
      ]
    },
    {
      questionText: 'What does SWOT analysis evaluate?',
      points: 2,
      difficulty: 'hard',
      options: [
        { text: 'Strengths, Weaknesses, Opportunities, Threats', isCorrect: true },
        { text: 'Sales, Workflows, Operations, Targets', isCorrect: false },
        { text: 'Systems, Wireframes, Outputs, Technology', isCorrect: false },
        { text: 'Schedule, Wages, Objectives, Timelines', isCorrect: false }
      ]
    }
  ]
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB. Clearing existing quizzes...');

    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
    console.log('🧹 Cleared existing Quiz and QuizAttempt collections.');

    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} courses in database.`);

    for (const course of courses) {
      // Pick template questions based on category, fallback to 'Web Development'
      const templateCategory = questionsTemplates[course.category] ? course.category : 'Web Development';
      const questions = questionsTemplates[templateCategory].map(q => ({
        ...q,
        _id: new mongoose.Types.ObjectId()
      }));

      await Quiz.create({
        course: course._id,
        title: course.title,
        questions: questions,
        passingScore: 70,
        quizType: 'graded'
      });
      console.log(`✅ Seeded quiz with 5 questions matching course: "${course.title}"`);
    }

    console.log('🎉 Successfully seeded quizzes for all 15 courses!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding all quizzes:', err);
    process.exit(1);
  }
};

run();
