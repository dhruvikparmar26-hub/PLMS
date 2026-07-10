const StudySession = require('../models/StudySession');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Get all study sessions for the current user
 * @route   GET /api/study-sessions
 * @access  Protected
 */
const getUserStudySessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let query = { user: userId };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const sessions = await StudySession.find(query)
      .populate('course', 'title thumbnail category')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get study sessions for a specific week
 * @route   GET /api/study-sessions/week
 * @access  Protected
 */
const getWeeklySessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { weekStart } = req.query;

    // Default to current week if no date provided
    const weekStartDate = weekStart 
      ? new Date(weekStart)
      : getStartOfWeek(new Date());

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    const sessions = await StudySession.find({
      user: userId,
      scheduledDate: {
        $gte: weekStartDate,
        $lte: weekEndDate,
      },
    })
      .populate('course', 'title thumbnail category')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      sessions,
      weekStart: weekStartDate,
      weekEnd: weekEndDate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's study sessions
 * @route   GET /api/study-sessions/today
 * @access  Protected
 */
const getTodaySessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await StudySession.find({
      user: userId,
      scheduledDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $in: ['planned', 'completed'] },
    })
      .populate('course', 'title thumbnail category')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available courses for study sessions
 * @route   GET /api/study-sessions/courses
 * @access  Protected
 */
const getAvailableCourses = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // First try to get enrolled courses
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title thumbnail category')
      .lean();

    const enrolledCourses = enrollments.map(e => e.course);

    // If no enrollments, get all courses
    let courses = enrolledCourses;
    if (enrolledCourses.length === 0) {
      courses = await Course.find({})
        .select('title thumbnail category')
        .lean();
    }

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new study session
 * @route   POST /api/study-sessions
 * @access  Protected
 */
const createStudySession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseId, title, description, scheduledDate, duration } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const session = await StudySession.create({
      user: userId,
      course: courseId,
      title: title || `Study: ${course.title}`,
      description,
      scheduledDate: new Date(scheduledDate),
      duration: parseInt(duration),
      status: 'planned',
    });

    const populatedSession = await StudySession.findById(session._id)
      .populate('course', 'title thumbnail category');

    res.status(201).json({
      success: true,
      session: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a study session
 * @route   PUT /api/study-sessions/:id
 * @access  Protected
 */
const updateStudySession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { title, description, scheduledDate, duration, status, actualDuration } = req.body;

    const session = await StudySession.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found',
      });
    }

    // Update fields
    if (title !== undefined) session.title = title;
    if (description !== undefined) session.description = description;
    if (scheduledDate !== undefined) session.scheduledDate = new Date(scheduledDate);
    if (duration !== undefined) session.duration = parseInt(duration);
    if (status !== undefined) {
      session.status = status;
      if (status === 'completed') {
        session.completedAt = new Date();
        session.actualDuration = actualDuration || session.duration;
      }
    }

    await session.save();

    // If marked as complete, create ActivityLog entry
    if (status === 'completed' && !session.activityLogged) {
      await ActivityLog.create({
        user: userId,
        action: 'study_session_completed',
        metadata: {
          courseId: session.course,
          sessionId: session._id,
          timeSpent: (session.actualDuration || session.duration) * 60, // convert to seconds
          extra: {
            title: session.title,
            scheduledDate: session.scheduledDate,
          },
        },
      });
      session.activityLogged = true;
      await session.save();
    }

    const populatedSession = await StudySession.findById(session._id)
      .populate('course', 'title thumbnail category');

    res.status(200).json({
      success: true,
      session: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a study session
 * @route   DELETE /api/study-sessions/:id
 * @access  Protected
 */
const deleteStudySession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const session = await StudySession.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found',
      });
    }

    await StudySession.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Study session deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a study session as complete
 * @route   POST /api/study-sessions/:id/complete
 * @access  Protected
 */
const completeStudySession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { actualDuration } = req.body;

    const session = await StudySession.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found',
      });
    }

    session.status = 'completed';
    session.completedAt = new Date();
    session.actualDuration = actualDuration || session.duration;

    await session.save();

    // Create ActivityLog entry
    await ActivityLog.create({
      user: userId,
      action: 'study_session_completed',
      metadata: {
        courseId: session.course,
        sessionId: session._id,
        timeSpent: session.actualDuration * 60, // convert to seconds
        extra: {
          title: session.title,
          scheduledDate: session.scheduledDate,
        },
      },
    });

    const populatedSession = await StudySession.findById(session._id)
      .populate('course', 'title thumbnail category');

    res.status(200).json({
      success: true,
      session: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get start of week (Monday)
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

module.exports = {
  getUserStudySessions,
  getWeeklySessions,
  getTodaySessions,
  getAvailableCourses,
  createStudySession,
  updateStudySession,
  deleteStudySession,
  completeStudySession,
};
