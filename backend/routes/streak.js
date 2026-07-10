const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');
const { protect } = require('../middleware/auth');

router.get('/', protect, streakController.getUserStreak);

module.exports = router;
