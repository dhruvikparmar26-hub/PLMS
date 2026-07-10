const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  toggleBookmark,
  getBookmarks,
  checkBookmark,
  deleteBookmark,
} = require('../controllers/bookmarkController');

router.route('/')
  .get(protect, getBookmarks);

router.post('/toggle', protect, toggleBookmark);
router.get('/check/:lessonId', protect, checkBookmark);
router.delete('/:id', protect, deleteBookmark);

module.exports = router;
