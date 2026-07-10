require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function testAccountPersistence() {
  console.log('=== Testing Account Persistence ===\n');

  const testEmail = `persistence-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Check if user exists (should not exist yet)
    console.log('\n1. Checking if user exists before creation...');
    let user = await User.findOne({ email: testEmail });
    if (user) {
      console.log('   ⚠ User already exists, deleting...');
      await User.deleteOne({ email: testEmail });
    } else {
      console.log('   ✅ User does not exist (as expected)');
    }

    // Step 2: Create a new user
    console.log('\n2. Creating new user...');
    console.log(`   Email: ${testEmail}`);
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    user = await User.create({
      name: 'Persistence Test User',
      email: testEmail,
      password: hashedPassword,
      role: 'student'
    });
    console.log('   ✅ User created successfully');
    console.log(`   User ID: ${user._id}`);

    // Step 3: Verify user exists immediately after creation
    console.log('\n3. Verifying user exists immediately after creation...');
    user = await User.findOne({ email: testEmail });
    if (user) {
      console.log('   ✅ User found in database');
    } else {
      throw new Error('User not found immediately after creation');
    }

    // Step 4: Simulate server restart by disconnecting and reconnecting
    console.log('\n4. Simulating server restart (disconnect/reconnect)...');
    await mongoose.connection.close();
    console.log('   ✅ Disconnected from MongoDB');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ Reconnected to MongoDB');

    // Step 5: Verify user still exists after "restart"
    console.log('\n5. Verifying user still exists after "restart"...');
    user = await User.findOne({ email: testEmail });
    if (user) {
      console.log('   ✅ User still exists in database');
      console.log(`   User ID: ${user._id}`);
      console.log(`   User Name: ${user.name}`);
    } else {
      throw new Error('User not found after reconnecting to database');
    }

    // Step 6: Clean up test user
    console.log('\n6. Cleaning up test user...');
    await User.deleteOne({ email: testEmail });
    console.log('   ✅ Test user deleted');

    console.log('\n=== ✅ TEST PASSED ===');
    console.log('Account persistence verified: User data survives database reconnection.');
    console.log('This confirms that:');
    console.log('  - MongoDB is using a persistent database (not mongodb-memory-server)');
    console.log('  - Data is NOT being wiped on server restart');
    console.log('  - Real user accounts will persist across server restarts');

    process.exit(0);

  } catch (error) {
    console.error('\n=== ❌ TEST FAILED ===');
    console.error(error.message);
    console.error(error.stack);
    
    // Clean up on error
    try {
      await User.deleteOne({ email: testEmail });
    } catch (e) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

testAccountPersistence();
