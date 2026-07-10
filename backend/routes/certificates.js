const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyCertificates,
  getCertificate,
  verifyCertificate,
} = require('../controllers/certificateController');

// Public verification (no auth)
router.get('/verify/:code', verifyCertificate);

// Protected routes
router.get('/', protect, getMyCertificates);
router.get('/:id', protect, getCertificate);

module.exports = router;
