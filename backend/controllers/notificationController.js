const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const ActivityLog = require('../models/ActivityLog');

/**
 * Get user's notifications
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ user: userId, read: false }, { read: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

/**
 * Create notification for course match
 */
exports.createCourseMatchNotification = async (courseId) => {
  try {
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) return;

    const users = await User.find({
      learningPreferences: { $in: [course.category] },
    });

    for (const user of users) {
      await Notification.create({
        user: user._id,
        type: 'course_match',
        message: `New course "${course.title}" in ${course.category} is now available!`,
        link: `/courses/${course._id}`,
      });
    }
  } catch (error) {
    console.error('Error creating course match notification:', error);
  }
};

/**
 * Create notification for streak warning (should be called by a scheduled job)
 */
exports.createStreakWarningNotifications = async () => {
  try {
    const today = new Date();
    const hour = today.getHours();

    // Only run in the evening (e.g., after 6 PM)
    if (hour < 18) return;

    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    // Find users who had activity yesterday but not today
    const usersWithActivityYesterday = await ActivityLog.distinct('user', {
      action: { $in: ['lesson_viewed', 'lesson_completed', 'quiz_attempted'] },
      timestamp: {
        $gte: new Date(yesterdayStr),
        $lt: new Date(todayStr),
      },
    });

    for (const userId of usersWithActivityYesterday) {
      const hasActivityToday = await ActivityLog.findOne({
        user: userId,
        action: { $in: ['lesson_viewed', 'lesson_completed', 'quiz_attempted'] },
        timestamp: {
          $gte: new Date(todayStr),
        },
      });

      if (!hasActivityToday) {
        await Notification.create({
          user: userId,
          type: 'streak_warning',
          message: "Don't lose your streak! Complete a lesson today to keep it going.",
          link: '/dashboard',
        });
      }
    }
  } catch (error) {
    console.error('Error creating streak warning notifications:', error);
  }
};

/**
 * Create notification for instructor announcement
 */
exports.createAnnouncementNotification = async (courseId, message) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) return;

    const enrollments = await Enrollment.find({ course: courseId });

    for (const enrollment of enrollments) {
      await Notification.create({
        user: enrollment.user,
        type: 'announcement',
        message: `Announcement for "${course.title}": ${message}`,
        link: `/courses/${course._id}`,
      });
    }
  } catch (error) {
    console.error('Error creating announcement notification:', error);
  }
};
