const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * @desc    Generate .ics file for study reminders
 * @route   GET /api/calendar/export
 * @access  Protected
 */
const exportCalendar = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseId, daysAhead = 7 } = req.query;

    // Get user's enrollments
    let enrollments;
    if (courseId) {
      enrollments = await Enrollment.find({ user: userId, course: courseId })
        .populate('course', 'title modules')
        .lean();
    } else {
      enrollments = await Enrollment.find({ user: userId })
        .populate('course', 'title modules')
        .lean();
    }

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No enrollments found',
      });
    }

    // Generate ICS content
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PLMS Learning Management System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PLMS Study Schedule
X-WR-TIMEZONE:UTC
X-WR-CALDESC:Study schedule from PLMS Learning Management System
`;

    const startDate = new Date();
    const daysAheadNum = parseInt(daysAhead) || 7;

    // Create study sessions for each enrolled course
    for (const enrollment of enrollments) {
      const course = enrollment.course;
      const completedLessons = enrollment.completedLessons || [];
      
      // Find next incomplete lesson
      let nextLesson = null;
      let moduleTitle = '';
      
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (!completedLessons.includes(lesson._id.toString())) {
            nextLesson = lesson;
            moduleTitle = module.title;
            break;
          }
        }
        if (nextLesson) break;
      }

      if (nextLesson) {
        // Create study sessions for the next N days
        for (let i = 0; i < daysAheadNum; i++) {
          const sessionDate = new Date(startDate);
          sessionDate.setDate(startDate.getDate() + i);
          
          // Set session time to 6 PM UTC (adjust as needed)
          sessionDate.setHours(18, 0, 0, 0);
          
          const sessionEnd = new Date(sessionDate);
          sessionEnd.setHours(19, 0, 0, 0);

          const dateStr = sessionDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const endDateStr = sessionEnd.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const createdDate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const uid = `${userId}-${course._id}-${i}@plms.com`;

          icsContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${createdDate}
DTSTART:${dateStr}
DTEND:${endDateStr}
SUMMARY:Study Session: ${course.title}
DESCRIPTION:Continue learning ${course.title}. Next lesson: ${nextLesson.title} (${moduleTitle}). Progress: ${enrollment.progressPercent}%
LOCATION:Online
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
        }
      }
    }

    icsContent += `END:VCALENDAR`;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="plms-study-schedule.ics"');

    res.status(200).send(icsContent);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get calendar events as JSON (for preview)
 * @route   GET /api/calendar/events
 * @access  Protected
 */
const getCalendarEvents = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseId, daysAhead = 7 } = req.query;

    // Get user's enrollments
    let enrollments;
    if (courseId) {
      enrollments = await Enrollment.find({ user: userId, course: courseId })
        .populate('course', 'title modules')
        .lean();
    } else {
      enrollments = await Enrollment.find({ user: userId })
        .populate('course', 'title modules')
        .lean();
    }

    const events = [];
    const startDate = new Date();
    const daysAheadNum = parseInt(daysAhead) || 7;

    // Create study sessions for each enrolled course
    for (const enrollment of enrollments) {
      const course = enrollment.course;
      const completedLessons = enrollment.completedLessons || [];
      
      // Find next incomplete lesson
      let nextLesson = null;
      let moduleTitle = '';
      
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (!completedLessons.includes(lesson._id.toString())) {
            nextLesson = lesson;
            moduleTitle = module.title;
            break;
          }
        }
        if (nextLesson) break;
      }

      if (nextLesson) {
        // Create study sessions for the next N days
        for (let i = 0; i < daysAheadNum; i++) {
          const sessionDate = new Date(startDate);
          sessionDate.setDate(startDate.getDate() + i);
          sessionDate.setHours(18, 0, 0, 0);
          
          const sessionEnd = new Date(sessionDate);
          sessionEnd.setHours(19, 0, 0, 0);

          events.push({
            id: `${userId}-${course._id}-${i}`,
            title: `Study Session: ${course.title}`,
            description: `Continue learning ${course.title}. Next lesson: ${nextLesson.title} (${moduleTitle}). Progress: ${enrollment.progressPercent}%`,
            start: sessionDate.toISOString(),
            end: sessionEnd.toISOString(),
            location: 'Online',
            courseId: course._id,
            courseTitle: course.title,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportCalendar,
  getCalendarEvents,
};
