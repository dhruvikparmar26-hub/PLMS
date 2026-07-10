const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { seedGuestData } = require('../utils/guestSeeder');

/**
 * Helper — sign JWT and set as httpOnly cookie.
 */
const signTokenAndSetCookie = (user, statusCode, res) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: userObj,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    // 1. Check validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // 2. Normalize email identically to login
    const name = req.body.name.trim();
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;

    // 3. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use.',
      });
    }

    // 4. Hash password with 12 salt rounds — never store plaintext
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Seed guest user details if email matches guest address
    if (email === 'ananya@learnova.com') {
      try {
        await seedGuestData(user);
      } catch (err) {
        console.error('Failed to seed guest data:', err);
      }
    }

    // 6. Respond 201 with user data (password excluded by select: false)
    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        learningPreferences: user.learningPreferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log in an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // 1. Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // 2. Normalize email identically to signup
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;

    // 3. Find user and explicitly select password (excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 4. Compare password with bcrypt — never compare plaintext
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 5. Sign JWT, set cookie, respond
    signTokenAndSetCookie(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).populate('enrolledCourses');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out — clear auth cookie
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // expire immediately
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @desc    Generate and Send OTP to email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const email = req.body.email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use.',
      });
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in database (overwrite previous OTPs for this email)
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });

    // Print to console beautifully for development testing
    console.log('\n┌────────────────────────────────────────┐');
    console.log('│           SECURE LAB AUTHENTICATION    │');
    console.log('├────────────────────────────────────────┤');
    console.log(`│ Email: ${email.padEnd(31)} │`);
    console.log(`│ OTP Code: ${otpCode.padEnd(28)} │`);
    console.log('│ Expires: 10 minutes                    │');
    console.log('└────────────────────────────────────────┘\n');

    // In development mode, we can send it in the response for a helper UI toast/tooltip
    const responsePayload = {
      success: true,
      message: 'Verification OTP sent successfully.',
    };

    if (process.env.NODE_ENV !== 'production') {
      responsePayload.devOtp = otpCode;
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP and register new user (signup success + auto login)
 * @route   POST /api/auth/verify-otp-signup
 * @access  Public
 */
const verifyOtpAndSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const name = req.body.name.trim();
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;
    const otpCode = req.body.otp ? req.body.otp.trim() : '';

    // 1. Verify OTP exists and is correct
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found or code has expired. Please request a new one.',
      });
    }

    if (otpRecord.otp !== otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
      });
    }

    // 2. Double check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use.',
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Delete the OTP record since it's verified
    await Otp.deleteMany({ email });

    // 6. Sign JWT, set cookie, and automatically log in
    signTokenAndSetCookie(user, 201, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, logout, sendOtp, verifyOtpAndSignup };
