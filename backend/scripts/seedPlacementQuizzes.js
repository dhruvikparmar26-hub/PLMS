const mongoose = require('mongoose');
const PlacementQuiz = require('./models/PlacementQuiz');
require('dotenv').config();

const placementQuizzes = [
  {
    category: 'Web Development',
    questions: [
      {
        questionText: 'What does HTML stand for?',
        options: [
          { text: 'Hyper Text Markup Language', isCorrect: true },
          { text: 'Home Tool Markup Language', isCorrect: false },
          { text: 'Hyperlinks and Text Markup Language', isCorrect: false },
          { text: 'Hyper Tool Multi Language', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'Which CSS property controls text size?',
        options: [
          { text: 'font-style', isCorrect: false },
          { text: 'text-size', isCorrect: false },
          { text: 'font-size', isCorrect: true },
          { text: 'text-style', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What is the correct syntax for referring to an external script called "app.js"?',
        options: [
          { text: '<script href="app.js">', isCorrect: false },
          { text: '<script name="app.js">', isCorrect: false },
          { text: '<script src="app.js">', isCorrect: true },
          { text: '<script file="app.js">', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'Which HTML tag is used to define an internal style sheet?',
        options: [
          { text: '<script>', isCorrect: false },
          { text: '<style>', isCorrect: true },
          { text: '<css>', isCorrect: false },
          { text: '<link>', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What is the default display value of <div> elements?',
        options: [
          { text: 'inline', isCorrect: false },
          { text: 'inline-block', isCorrect: false },
          { text: 'block', isCorrect: true },
          { text: 'flex', isCorrect: false },
        ],
        points: 1,
      },
    ],
    passingScore: 60,
    isActive: true,
  },
  {
    category: 'Data Science',
    questions: [
      {
        questionText: 'Which library is commonly used for data manipulation in Python?',
        options: [
          { text: 'NumPy', isCorrect: false },
          { text: 'Pandas', isCorrect: true },
          { text: 'Matplotlib', isCorrect: false },
          { text: 'Scikit-learn', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What does the "fit" method do in machine learning?',
        options: [
          { text: 'Tests the model', isCorrect: false },
          { text: 'Trains the model on data', isCorrect: true },
          { text: 'Saves the model', isCorrect: false },
          { text: 'Loads the model', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'Which data structure is used to store key-value pairs in Python?',
        options: [
          { text: 'List', isCorrect: false },
          { text: 'Tuple', isCorrect: false },
          { text: 'Dictionary', isCorrect: true },
          { text: 'Set', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What is the purpose of a confusion matrix?',
        options: [
          { text: 'To store model weights', isCorrect: false },
          { text: 'To evaluate classification performance', isCorrect: true },
          { text: 'To normalize data', isCorrect: false },
          { text: 'To handle missing values', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'Which library is used for data visualization in Python?',
        options: [
          { text: 'Pandas', isCorrect: false },
          { text: 'NumPy', isCorrect: false },
          { text: 'Matplotlib', isCorrect: true },
          { text: 'TensorFlow', isCorrect: false },
        ],
        points: 1,
      },
    ],
    passingScore: 60,
    isActive: true,
  },
  {
    category: 'Design',
    questions: [
      {
        questionText: 'What is the primary purpose of a wireframe?',
        options: [
          { text: 'Final visual design', isCorrect: false },
          { text: 'Layout and structure planning', isCorrect: true },
          { text: 'Color palette selection', isCorrect: false },
          { text: 'Typography choice', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'Which color model is used for digital displays?',
        options: [
          { text: 'CMYK', isCorrect: false },
          { text: 'RGB', isCorrect: true },
          { text: 'Pantone', isCorrect: false },
          { text: 'HSL', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What does UI stand for?',
        options: [
          { text: 'User Integration', isCorrect: false },
          { text: 'User Interface', isCorrect: true },
          { text: 'Universal Interaction', isCorrect: false },
          { text: 'Unit Implementation', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What is the 60-30-10 rule in design?',
        options: [
          { text: 'Font sizes', isCorrect: false },
          { text: 'Color proportion', isCorrect: true },
          { text: 'Layout spacing', isCorrect: false },
          { text: 'Image resolution', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What is a mockup?',
        options: [
          { text: 'Low-fidelity sketch', isCorrect: false },
          { text: 'High-fidelity visual design', isCorrect: true },
          { text: 'Interactive prototype', isCorrect: false },
          { text: 'User testing script', isCorrect: false },
        ],
        points: 1,
      },
    ],
    passingScore: 60,
    isActive: true,
  },
  {
    category: 'Marketing',
    questions: [
      {
        questionText: 'What does SEO stand for?',
        options: [
          { text: 'Search Engine Optimization', isCorrect: true },
          { text: 'Social Engagement Online', isCorrect: false },
          { text: 'Site Enhancement Option', isCorrect: false },
          { text: 'Search Entry Organization', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What is the primary goal of A/B testing?',
        options: [
          { text: 'Increase server speed', isCorrect: false },
          { text: 'Compare two versions to determine better performance', isCorrect: true },
          { text: 'Reduce costs', isCorrect: false },
          { text: 'Improve code quality', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What is a conversion rate?',
        options: [
          { text: 'Number of website visitors', isCorrect: false },
          { text: 'Percentage of visitors who take desired action', isCorrect: true },
          { text: 'Cost per click', isCorrect: false },
          { text: 'Social media followers', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What does CTR stand for in digital marketing?',
        options: [
          { text: 'Cost Through Rate', isCorrect: false },
          { text: 'Click Through Rate', isCorrect: true },
          { text: 'Customer Target Rating', isCorrect: false },
          { text: 'Campaign Tracking Report', isCorrect: false },
        ],
        points: 1,
      },
      {
        questionText: 'What is the purpose of a call-to-action (CTA)?',
        options: [
          { text: 'To display contact information', isCorrect: false },
          { text: 'To prompt users to take specific action', isCorrect: true },
          { text: 'To show legal disclaimers', isCorrect: false },
          { text: 'To display navigation menu', isCorrect: false },
        ],
        points: 1,
      },
    ],
    passingScore: 60,
    isActive: true,
  },
];

async function seedPlacementQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plms');
    console.log('Connected to MongoDB');

    // Clear existing placement quizzes
    await PlacementQuiz.deleteMany({});
    console.log('Cleared existing placement quizzes');

    // Insert new placement quizzes
    await PlacementQuiz.insertMany(placementQuizzes);
    console.log('Inserted placement quizzes');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding placement quizzes:', error);
    process.exit(1);
  }
}

seedPlacementQuizzes();
