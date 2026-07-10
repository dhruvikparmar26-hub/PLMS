const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
  getDueFlashcards,
} = require('../controllers/flashcardController');

// GET /api/flashcards/due — must come before /:id routes
router.get('/due', protect, getDueFlashcards);

// CRUD
router.route('/')
  .get(protect, getFlashcards)
  .post(protect, createFlashcard);

router.route('/:id')
  .patch(protect, updateFlashcard)
  .delete(protect, deleteFlashcard);

router.post('/:id/review', protect, reviewFlashcard);

module.exports = router;
