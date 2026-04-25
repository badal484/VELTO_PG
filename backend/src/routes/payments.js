const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const createNotification = require('../utils/createNotification');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/order
// @access  Protected
router.post('/order', protect, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const amount = Math.round((booking.totalPrice + (booking.securityDeposit || 0)) * 100);
    const options = {
      amount,
      currency: 'INR',
      receipt: booking.bookingId,
    };

    console.log('Creating Razorpay Order:', { bookingId: booking._id, bookingUID: booking.bookingId, amount });
    const order = await razorpay.orders.create(options);
    
    booking.payment.razorpayOrderId = order.id;
    await booking.save();

    res.status(200).json({ success: true, data: { ...order, key_id: process.env.RAZORPAY_KEY_ID } });
  } catch (err) {
    next(err);
  }
});

// @desc    Verify Razorpay signature
// @route   POST /api/payments/verify
// @access  Protected
router.post('/verify', protect, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const booking = await Booking.findOne({ 'payment.razorpayOrderId': razorpay_order_id }).populate('pg', 'name owner');
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      booking.status = 'confirmed';
      booking.payment.status = 'paid';
      booking.payment.razorpayPaymentId = razorpay_payment_id;
      booking.payment.razorpaySignature = razorpay_signature;
      booking.payment.paidAt = Date.now();
      await booking.save();

      await createNotification(booking.user, 'booking_confirmed', 'Booking Confirmed!', `Your booking ${booking.bookingId} for ${booking.pg?.name} is now confirmed.`, '/dashboard');
      
      // Notify Owner
      if (booking.pg?.owner) {
        await createNotification(booking.pg.owner, 'payment_received', 'Payment Received!', `Payment for booking ${booking.bookingId} has been confirmed.`, '/owner/dashboard');
      }

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    next(err);
  }
});

// @desc    Razorpay Webhook (MUST be registered before express.json() in server.js for raw body)
// This handler is just a placeholder here, the actual implementation goes in server.js or a separate utility
router.post('/webhook', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature === signature) {
    // Process event (e.g. payment.captured)
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(400).json({ status: 'invalid' });
  }
});

module.exports = router;