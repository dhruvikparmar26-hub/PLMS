const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createConcept,
  getConcepts,
  getConceptMastery,
  backfillConcepts,
} = require('../controllers/conceptController');

router
  .route('/')
  .post(protect, authorize('admin', 'instructor'), createConcept)
  .get(protect, getConcepts);

router.get('/mastery', protect, getConceptMastery);

router.post('/backfill', protect, authorize('admin', 'instructor'), backfillConcepts);

module.exports = router;
