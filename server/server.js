require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

// ── Register all Mongoose models ──────────────────────────────────────────────
require('./models/User');
require('./models/Course');
require('./models/Lesson');
require('./models/Enrollment');
require('./models/Quiz');
require('./models/QuizAttempt');
require('./models/ActivityLog');
require('./models/SpacedRepetition');
require('./models/PlacementQuiz');
require('./models/Achievement');
require('./models/UserAchievement');
require('./models/Note');
require('./models/Notification');
require('./models/Flashcard');
require('./models/Bookmark');
require('./models/QAPost');
require('./models/Certificate');
require('./models/StudySession');

const PORT = process.env.PORT || 5000;

// ── Create HTTP server (needed for Socket.io) ─────────────────────────────────
const httpServer = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to app so controllers can access it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  // Join a personal room keyed by userId for targeted notifications
  socket.on('join', (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });

  // Join a category room for real-time leaderboard updates
  socket.on('join_category', (category) => {
    if (category) {
      socket.join(`category:${category}`);
    }
  });

  // Leave category room
  socket.on('leave_category', (category) => {
    if (category) {
      socket.leave(`category:${category}`);
    }
  });

  socket.on('disconnect', () => {});
});

// ── Export io for use in controllers ──────────────────────────────────────────
module.exports = { io };

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Socket.io: enabled`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use — stop the other process or set a different PORT in .env`);
    } else {
      console.error('❌ Server error:', err);
    }
    process.exit(1);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Closing server gracefully...`);
    httpServer.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startServer();

