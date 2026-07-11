const Bookmark = require('../models/Bookmark');

/**
 * @desc    Toggle bookmark for a lesson (create if not exists, delete if exists)
 * @route   POST /api/bookmarks/toggle
 * @access  Protected
 * @body    { lessonId, courseId }
 */
const toggleBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { lessonId, courseId, note } = req.body;

    if (!lessonId || !courseId) {
      return res.status(400).json({ success: false, message: 'lessonId and courseId are required.' });
    }

    const existing = await Bookmark.findOne({ user: userId, lesson: lessonId });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.status(200).json({ success: true, bookmarked: false, message: 'Bookmark removed.' });
    }

    const Lesson = require('../models/Lesson');
    const lesson = await Lesson.findById(lessonId);
    const lessonTitle = lesson ? lesson.title : 'Lesson';

    const bookmark = await Bookmark.create({
      user: userId,
      lesson: lessonId,
      course: courseId,
      note: note || '',
    });

    const { createNotification } = require('./notificationController');
    await createNotification(
      userId,
      'bookmark_added',
      `Bookmarked lesson: "${lessonTitle}"`,
      `/lessons/${lessonId}`
    );

    res.status(201).json({ success: true, bookmarked: true, bookmark });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookmarks for the current user
 * @route   GET /api/bookmarks
 * @access  Protected
 * @query   courseId (optional)
 */
const getBookmarks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.query;

    const filter = { user: userId };
    if (courseId) filter.course = courseId;

    const bookmarks = await Bookmark.find(filter)
      .populate('lesson', 'title duration')
      .populate('course', 'title category')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, bookmarks, total: bookmarks.length });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if a specific lesson is bookmarked
 * @route   GET /api/bookmarks/check/:lessonId
 * @access  Protected
 */
const checkBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { lessonId } = req.params;

    const bookmark = await Bookmark.findOne({ user: userId, lesson: lessonId }).lean();

    res.status(200).json({ success: true, bookmarked: !!bookmark, bookmark: bookmark || null });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a bookmark by ID
 * @route   DELETE /api/bookmarks/:id
 * @access  Protected
 */
const deleteBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found.' });
    }
    res.status(200).json({ success: true, message: 'Bookmark deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleBookmark,
  getBookmarks,
  checkBookmark,
  deleteBookmark,
};
