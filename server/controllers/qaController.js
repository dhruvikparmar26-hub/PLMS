const QAPost = require('../models/QAPost');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * @desc    Get all posts for a course or lesson
 * @route   GET /api/qa/:courseId
 * @access  Protected (enrolled users + instructor/admin)
 * @query   lessonId, page, limit, type
 */
const getPosts = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonId, page = 1, limit = 20, type } = req.query;

    const filter = { course: courseId };
    if (lessonId) filter.lesson = lessonId;
    if (type) filter.type = type;

    const total = await QAPost.countDocuments(filter);
    const posts = await QAPost.find(filter)
      .populate('author', 'name role')
      .populate('replies.author', 'name role')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      posts,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new post
 * @route   POST /api/qa/:courseId
 * @access  Protected
 * @body    { body, title, type, lessonId }
 */
const createPost = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const { body, title, type, lessonId } = req.body;

    if (!body) {
      return res.status(400).json({ success: false, message: 'Post body is required.' });
    }

    const post = await QAPost.create({
      course: courseId,
      lesson: lessonId || null,
      author: userId,
      body,
      title: title || '',
      type: type || 'question',
    });

    const populated = await QAPost.findById(post._id).populate('author', 'name role').lean();

    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a reply to a post
 * @route   POST /api/qa/:courseId/posts/:postId/reply
 * @access  Protected
 * @body    { body }
 */
const addReply = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { body } = req.body;

    if (!body) {
      return res.status(400).json({ success: false, message: 'Reply body is required.' });
    }

    const post = await QAPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const isInstructorReply = ['instructor', 'admin'].includes(req.user.role);

    post.replies.push({
      author: userId,
      body,
      isInstructorReply,
    });

    await post.save();

    const populated = await QAPost.findById(postId)
      .populate('author', 'name role')
      .populate('replies.author', 'name role')
      .lean();

    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upvote or un-upvote a post
 * @route   PATCH /api/qa/posts/:postId/upvote
 * @access  Protected
 */
const toggleUpvotePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await QAPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const hasUpvoted = post.upvotes.some((uid) => uid.toString() === userId.toString());

    if (hasUpvoted) {
      post.upvotes = post.upvotes.filter((uid) => uid.toString() !== userId.toString());
    } else {
      post.upvotes.push(userId);
    }

    await post.save();

    res.status(200).json({ success: true, upvotes: post.upvotes.length, hasUpvoted: !hasUpvoted });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle pin on a post (instructor/admin only)
 * @route   PATCH /api/qa/posts/:postId/pin
 * @access  Protected (instructor/admin)
 */
const togglePin = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!['instructor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only instructors or admins can pin posts.' });
    }

    const post = await QAPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.status(200).json({ success: true, isPinned: post.isPinned });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark post as resolved
 * @route   PATCH /api/qa/posts/:postId/resolve
 * @access  Protected
 */
const resolvePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await QAPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const isAuthor = post.author.toString() === userId.toString();
    const isAdmin = ['instructor', 'admin'].includes(req.user.role);

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only post author or instructor can resolve.' });
    }

    post.isResolved = !post.isResolved;
    await post.save();

    res.status(200).json({ success: true, isResolved: post.isResolved });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  addReply,
  toggleUpvotePost,
  togglePin,
  resolvePost,
};
