const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  addReply,
  toggleUpvotePost,
  togglePin,
  resolvePost,
} = require('../controllers/qaController');

// Course-level thread list + create
router.route('/:courseId')
  .get(protect, getPosts)
  .post(protect, createPost);

// Post actions
router.post('/:courseId/posts/:postId/reply', protect, addReply);
router.patch('/posts/:postId/upvote', protect, toggleUpvotePost);
router.patch('/posts/:postId/pin', protect, togglePin);
router.patch('/posts/:postId/resolve', protect, resolvePost);

module.exports = router;
