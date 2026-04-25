const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const PG = require('../models/PG');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Protected
router.post('/', protect, async (req, res, next) => {
  try {
    const { pgId, bookingId, rating, title, comment, ratings } = req.body;

    // Check if user had a completed booking for this PG
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      pg: pgId,
      status: 'completed'
    });

    if (!booking && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You must complete a stay before reviewing' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ pg: pgId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this PG' });
    }

    const review = await Review.create({
      user: req.user._id,
      pg: pgId,
      booking: bookingId,
      rating,
      title,
      comment,
      ratings,
      status: 'approved' // Auto-approve for now, can be changed to 'pending' if moderation is needed
    });

    // Recalculate PG rating
    await PG.recalculateRating(pgId);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

// @desc    Get reviews for a PG
// @route   GET /api/reviews/pg/:pgId
// @access  Public
router.get('/pg/:pgId', async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ pg: req.params.pgId, status: 'approved' })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ pg: req.params.pgId, status: 'approved' });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Owner reply to review
// @route   PUT /api/reviews/:id/reply
// @access  Protected (Owner)
router.put('/:id/reply', protect, authorize('owner', 'admin'), async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const pg = await PG.findById(review.pg);
    if (pg.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    review.ownerReply = req.body.reply;
    review.ownerRepliedAt = Date.now();
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

// @desc    Report a review
// @route   POST /api/reviews/:id/report
// @access  Protected
router.post('/:id/report', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.isReported = true;
    review.reportReason = req.body.reason;
    await review.save();

    res.status(200).json({ success: true, message: 'Review reported to moderation' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;