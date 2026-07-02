// Override process environment for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'unit-test-jwt-key';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Register all Mongoose schemas to avoid MissingSchemaError
require('../models/User');
require('../models/Course');
require('../models/Lesson');
require('../models/Enrollment');
require('../models/Quiz');
require('../models/QuizAttempt');
require('../models/ActivityLog');

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  // If mongoose is connected, disconnect first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  // Start memory server and connect
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Drop database and disconnect connection
  if (mongoose.connection.readyState !== 0) {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clean users collection before each test runs
  await User.deleteMany({});
});

describe('Authentication API Endpoints', () => {
  const testUser = {
    name: 'Test Student',
    email: 'student@example.com',
    password: 'password123',
  };

  it('should register a new user successfully (Signup Success)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.user).toHaveProperty('email', testUser.email.toLowerCase());
    expect(res.body.user).not.toHaveProperty('password');

    // Verify user is actually saved in MongoDB test DB
    const savedUser = await User.findOne({ email: testUser.email.toLowerCase() });
    expect(savedUser).toBeDefined();
    expect(savedUser.name).toEqual(testUser.name);
  });

  it('should fail registration if email is already in use (Signup Duplicate Email)', async () => {
    // Sign up once
    await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    // Sign up again with the exact same email
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', 'Email already in use.');
  });

  it('should authenticate user and return token cookie (Login Success)', async () => {
    // Register the test user
    await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    // Attempt login with correct credentials
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');

    // Confirm that the 'token' cookie is set in the headers
    const cookieHeader = res.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader[0]).toContain('token=');
  });

  it('should deny authentication with incorrect password (Login Wrong Password)', async () => {
    // Register the test user
    await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    // Attempt login with incorrect password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrong_password_here',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', 'Invalid email or password.');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('should reject requests to protected routes without an auth token (Access Protected without Token)', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', 'Not authenticated. Please log in.');
  });
});
