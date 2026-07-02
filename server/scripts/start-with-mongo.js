const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');

async function run() {
  console.log('🔄 Starting MongoMemoryServer on port 65424...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 65424,
      dbName: 'plms'
    }
  });
  const uri = mongod.getUri();
  console.log(`✅ MongoMemoryServer successfully started at: ${uri}`);

  // Run seed.js script
  console.log('🌱 Seeding default database courses...');
  const seedProcess = spawn(process.execPath, [path.join(__dirname, 'seed.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      MONGO_URI: uri
    }
  });

  await new Promise((resolve) => {
    seedProcess.on('close', (code) => {
      console.log(`🌱 Seeding process finished with code ${code}`);
      resolve();
    });
  });

  // Start the main express server.js
  console.log('🚀 Launching backend server...');
  const serverProcess = spawn(process.execPath, [path.join(__dirname, '../server.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      MONGO_URI: uri
    }
  });

  serverProcess.on('close', (code) => {
    console.log(`Backend server process exited with code ${code}`);
    mongod.stop();
    process.exit(code);
  });
}

run().catch((err) => {
  console.error('❌ Failed to run start-with-mongo:', err);
});
