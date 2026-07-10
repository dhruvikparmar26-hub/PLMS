const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

/**
 * @desc    Issue a certificate when a course is 100% complete
 *          Called internally from lessonController upon completion
 * @param   userId, courseId, enrollmentId
 * @returns certificate object or null
 */
const issueCertificate = async (userId, courseId, enrollmentId, quizAvgScore = null) => {
  try {
    // Check if already issued
    const existing = await Certificate.findOne({ user: userId, course: courseId });
    if (existing) return existing;

    // Determine grade
    let grade = 'Pass';
    if (quizAvgScore !== null) {
      if (quizAvgScore >= 90) grade = 'Distinction';
      else if (quizAvgScore >= 75) grade = 'Merit';
    }

    const cert = new Certificate({
      user: userId,
      course: courseId,
      enrollment: enrollmentId,
      grade,
    });

    await cert.save();
    return cert;
  } catch (error) {
    console.error('Error issuing certificate:', error);
    return null;
  }
};

/**
 * @desc    Get all certificates for current user
 * @route   GET /api/certificates
 * @access  Protected
 */
const getMyCertificates = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const certificates = await Certificate.find({ user: userId })
      .populate('course', 'title category difficulty thumbnail')
      .populate('user', 'name')
      .sort({ issuedAt: -1 })
      .lean();

    res.status(200).json({ success: true, certificates, total: certificates.length });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single certificate by ID
 * @route   GET /api/certificates/:id
 * @access  Protected
 */
const getCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title category difficulty')
      .populate('user', 'name')
      .lean();

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    // Only the certificate owner or admin can view it via this route
    if (
      certificate.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify a certificate by verification code (public route)
 * @route   GET /api/certificates/verify/:code
 * @access  Public
 */
const verifyCertificate = async (req, res, next) => {
  try {
    const { code } = req.params;

    const certificate = await Certificate.findOne({ verificationCode: code })
      .populate('course', 'title category difficulty')
      .populate('user', 'name')
      .lean();

    if (!certificate) {
      return res.status(404).json({ success: false, valid: false, message: 'Certificate not found or invalid code.' });
    }

    res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        verificationCode: certificate.verificationCode,
        userName: certificate.user.name,
        courseName: certificate.course.title,
        courseCategory: certificate.course.category,
        grade: certificate.grade,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueCertificate,
  getMyCertificates,
  getCertificate,
  verifyCertificate,
};
