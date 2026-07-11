const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getUserNotifications);
router.post('/', protect, notificationController.createCustomNotification);
router.put('/:notificationId/read', protect, notificationController.markAsRead);
router.put('/read-all', protect, notificationController.markAllAsRead);

module.exports = router;
