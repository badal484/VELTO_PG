const express = require('express');
const router = express.Router();
const PartnerApplication = require('../models/PartnerApplication');
const { protect } = require('../middleware/auth');

// @desc    Submit partner application
// @route   POST /api/partner/apply
// @access  Protected
router.post('/apply', protect, async (req, res, next) => {
  try {
    const application = await PartnerApplication.create({
      applicant: req.user._id,
      ...req.body,
      status: 'submitted',
    });
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
});

// @desc    Get own application status
// @route   GET /api/partner/application
// @access  Protected
router.get('/application', protect, async (req, res, next) => {
  try {
    const application = await PartnerApplication.findOne({ applicant: req.user._id }).sort('-createdAt');
    if (!application) return res.status(404).json({ success: false, message: 'No application found' });
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
});

// @desc    Update draft application
// @route   PUT /api/partner/application
// @access  Protected (only if status is submitted or draft)
router.put('/application', protect, async (req, res, next) => {
  try {
    let application = await PartnerApplication.findOne({ applicant: req.user._id, status: 'submitted' });
    if (!application) return res.status(404).json({ success: false, message: 'No active editable application found' });

    application = await PartnerApplication.findByIdAndUpdate(application._id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
