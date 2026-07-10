const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.get('/', protect, noteController.getUserNotes);
router.get('/lesson/:lessonId', protect, noteController.getNoteForLesson);
router.post('/', protect, noteController.saveNote);
router.delete('/:noteId', protect, noteController.deleteNote);

module.exports = router;
