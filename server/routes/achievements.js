const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');

router.get('/all', achievementController.getAllAchievements);
router.get('/user', protect, achievementController.getUserAchievements);

module.exports = router;
