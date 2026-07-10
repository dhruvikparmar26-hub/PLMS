require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Concept = require('../models/Concept');
const MasteryScore = require('../models/MasteryScore');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const { updateConceptMastery } = require('../utils/masteryUpdater');

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/plms';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully!');

    // 1. Create a concept
    console.log('\n--- 1. Creating Concepts ---');
    await Concept.deleteMany({ name: { $in: ['Test Scope', 'Test Closure'] } });
    
    const scopeConcept = await Concept.create({
      name: 'Test Scope',
      category: 'JavaScript',
    });
    console.log('Created prerequisite concept:', scopeConcept.name);

    const closureConcept = await Concept.create({
      name: 'Test Closure',
      category: 'JavaScript',
      prerequisites: [scopeConcept._id],
    });
    console.log('Created concept:', closureConcept.name, 'with prerequisites:', closureConcept.prerequisites);

    // 2. Fetch a user
    console.log('\n--- 2. Fetching User ---');
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No user found in database. Please run seed script first.');
      process.exit(1);
    }
    console.log('Using User:', user.name, `(${user._id})`);

    // 3. Test Mastery score updates manually
    console.log('\n--- 3. Testing MasteryScore updates ---');
    await MasteryScore.deleteMany({ userId: user._id, conceptId: { $in: [scopeConcept._id, closureConcept._id] } });

    console.log('Simulating lesson completion (performance 1.0) on "Test Scope"...');
    await updateConceptMastery(user._id, [scopeConcept._id], 1.0);

    let score1 = await MasteryScore.findOne({ userId: user._id, conceptId: scopeConcept._id });
    console.log('Updated mastery score 1:', score1.score); // Expected: 0.2

    console.log('Simulating quiz submission (performance 0.8) on "Test Scope"...');
    await updateConceptMastery(user._id, [scopeConcept._id], 0.8);

    let score2 = await MasteryScore.findOne({ userId: user._id, conceptId: scopeConcept._id });
    console.log('Updated mastery score 2:', score2.score); // Expected: 0.32

    // Clean up test concepts
    await Concept.deleteMany({ name: { $in: ['Test Scope', 'Test Closure'] } });
    await MasteryScore.deleteMany({ userId: user._id, conceptId: { $in: [scopeConcept._id, closureConcept._id] } });
    
    console.log('\n✅ All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

runTest();
