const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const PG = require('../models/PG');
const { protect, authorize } = require('../middleware/auth');
const calculateRefund = require('../utils/calculateRefund');
const createNotification = require('../utils/createNotification');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/bookings
router.post('/', protect, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { pgId, roomType, checkIn, duration, totalPrice, securityDeposit, specialRequests } = req.body;

    const pg = await PG.findOneAndUpdate(
      { _id: pgId, isActive: true },
      { $inc: { 'rooms.$[room].availableBeds': -1, totalBookings: 1 } },
      {
        arrayFilters: [{ 'room.type': roomType, 'room.availableBeds': { $gt: 0 } }],
        new: true,
        session,
      }
    );

    if (!pg) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Room not available or PG inactive' });
    }

    const booking = await Booking.create([{
      user: req.user._id,
      pg: pgId,
      roomType,
      checkIn,
      duration,
      totalPrice,
      securityDeposit: securityDeposit || 0,
      specialRequests: specialRequests || '',
      status: 'pending',
    }], { session });

    await session.commitTransaction();
    session.endSession();

    await createNotification(req.user._id, 'booking_pending', 'Booking Initiated',
      `Your booking for ${pg.name} is pending payment.`, `/dashboard`);

    // Notify Owner
    await createNotification(pg.owner, 'new_booking', 'New Booking Received',
      `${req.user.name} has initiated a booking for ${pg.name}.`, `/owner/dashboard`);

    res.status(201).json({ success: true, data: booking[0], message: 'Booking created' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
});

// @route   GET /api/bookings/owner/all  — must be before /:id
router.get('/owner/all', protect, authorize('owner', 'admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pgs = await PG.find({ owner: req.user._id });
    const pgIds = pgs.map(p => p._id);

    const filter = { pg: { $in: pgIds } };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email phone')
        .populate('pg', 'name address')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/bookings/my
router.get('/my', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('pg', 'name address images type')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/bookings/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('pg', 'name address images owner type')
      .populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isPGOwner = booking.pg?.owner?.toString() === req.user._id.toString();
    if (!isOwner && !isPGOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('pg', 'name owner').session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isGuest = booking.user.toString() === req.user._id.toString();
    const isOwner = booking.pg?.owner?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isOwner && !isAdmin) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    console.log(`Cancelling booking ${booking.bookingId} by user ${req.user._id} (${req.user.role})`);
    
    if (booking.status === 'cancelled') {
      console.warn(`Booking ${booking.bookingId} is already cancelled`);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    if (booking.status === 'completed') {
      console.warn(`Cannot cancel completed booking ${booking.bookingId}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed booking' });
    }

    const refundData = calculateRefund(booking.totalPrice, booking.checkIn);
    console.log(`Refund calculated: ${JSON.stringify(refundData)}`);

    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancelReason = reason || '';
    booking.refundPercent = refundData.refundPercent;
    booking.refundAmount = refundData.refundAmount;
    booking.payment.status = refundData.refundAmount > 0 ? 'refunded' : booking.payment.status;
    await booking.save({ session });

    console.log(`Booking ${booking.bookingId} cancelled successfully in database. Status: ${booking.status}`);

    // Restore bed count
    if (booking.pg) {
      const pgId = booking.pg._id || booking.pg;
      const pgName = booking.pg.name || 'Property';
      console.log(`Restoring 1 bed for PG ${pgName} (${pgId}), Room Type: ${booking.roomType}`);
      
      const pgUpdate = await PG.findOneAndUpdate(
        { _id: pgId },
        { $inc: { 'rooms.$[room].availableBeds': 1 } },
        { 
          arrayFilters: [{ 'room.type': booking.roomType }], 
          session,
          new: true 
        }
      );
      
      if (!pgUpdate) {
        console.warn(`Could not update PG ${pgId} bed count. PG might have been deleted or room type mismatch.`);
      } else {
        console.log(`Bed restored successfully for ${pgName}`);
      }
    } else {
      console.warn(`No PG associated with booking ${booking._id}. Skipping bed restoration.`);
    }

    // Issue Razorpay refund if payment was made online
    let refundId = null;
    const isPaid = booking.payment && booking.payment.status === 'paid';
    if (isPaid && booking.payment.razorpayPaymentId && refundData.refundAmount > 0) {
      try {
        console.log(`Initiating Razorpay refund of ₹${refundData.refundAmount} for payment ${booking.payment.razorpayPaymentId}`);
        const refund = await razorpay.payments.refund(booking.payment.razorpayPaymentId, {
          amount: refundData.refundAmount * 100,
          notes: { reason: reason || 'Cancellation refund', bookingId: booking.bookingId },
        });
        refundId = refund.id;
        booking.payment.status = 'refunded';
        booking.payment.refundId = refundId;
        booking.payment.refundAmount = refundData.refundAmount;
        booking.payment.refundedAt = Date.now();
        await booking.save({ session });
        console.log(`Razorpay refund successful: ${refundId}`);
      } catch (refundErr) {
        console.error('Razorpay refund error:', refundErr.message);
        // We don't abort the whole transaction if only the refund fails, 
        // as the cancellation itself is still valid. But we log it.
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Perform side effects after transaction is committed
    // 1. Notify user (if they exist - walk-ins don't have a user record)
    if (booking.user) {
      createNotification(booking.user, 'booking_cancelled', 'Booking Cancelled',
        `Your booking ${booking.bookingId} has been cancelled. ${refundData.refundAmount > 0 ? `Refund of ₹${refundData.refundAmount} initiated.` : 'No refund applicable.'}`,
        '/dashboard'
      ).catch(err => console.error('Notify fail:', err.message));
    }

    // 2. Send cancellation email (don't await - non-critical for response)
    const pgName = booking.pg?.name || 'the property';
    sendEmail({
      email: req.user.email,
      subject: `Booking Cancelled – ${booking.bookingId}`,
      type: 'booking_cancelled',
      data: {
        userName: req.user.name,
        bookingId: booking.bookingId,
        pgName,
        refundAmount: refundData.refundAmount,
        refundMessage: refundData.message,
      },
    }).catch(emailErr => console.error('Cancel email error:', emailErr.message));

    return res.status(200).json({
      success: true,
      data: booking,
      message: refundData.message,
    });
  } catch (err) {
    if (session.inAtomicity()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(err);
  }
});

module.exports = router;