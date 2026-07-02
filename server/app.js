const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // Trust first proxy for rate limiting and secure cookies

// --------------- Security Middleware ---------------
app.use(helmet());

// --------------- Global Rate Limiter ---------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// --------------- CORS ---------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true, // allow cookies to be sent cross-origin
  })
);

// --------------- Body Parsers ---------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Health Check ---------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- API Routes ---------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/instructor', require('./routes/instructor'));
app.use('/api/streak', require('./routes/streak'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/placement-quiz', require('./routes/placementQuiz'));
app.use('/api/adaptive', require('./routes/adaptive'));
app.use('/api/spaced-repetition', require('./routes/spacedRepetition'));
app.use('/api/pace-forecast', require('./routes/paceForecast'));
app.use('/api/daily-goal', require('./routes/dailyGoal'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/qa', require('./routes/qa'));
app.use('/api/certificates', require('./routes/certificates'));

// --------------- 404 Handler ---------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --------------- Global Error Handler ---------------
app.use(errorHandler);

module.exports = app;
