const express = require('express');
const router = express.Router();
const PG = require('../models/PG');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('owner', 'admin'));

// @desc    Get owner's properties
// @route   GET /api/owner/pgs
router.get('/pgs', async (req, res, next) => {
  try {
    const pgs = await PG.find({ owner: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: pgs });
  } catch (err) {
    next(err);
  }
});

// @desc    Toggle PG status (Active/Inactive)
// @route   PUT /api/owner/pgs/:id/status
router.put('/pgs/:id/status', async (req, res, next) => {
  try {
    const pg = await PG.findOne({ _id: req.params.id, owner: req.user._id });
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found or not authorized' });

    const updatedPg = await PG.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: !pg.isActive } },
      { new: true, runValidators: false }
    );

    res.status(200).json({ success: true, data: updatedPg, message: `Property ${updatedPg.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    next(err);
  }
});

// @desc    Update room availability
// @route   PUT /api/owner/pgs/:id/rooms/:roomType
router.put('/pgs/:id/rooms/:roomType', async (req, res, next) => {
  try {
    const { availableBeds } = req.body;
    
    // Find the PG first to ensure ownership
    const pg = await PG.findOne({ _id: req.params.id, owner: req.user._id });
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found or not authorized' });

    // Use findOneAndUpdate with arrayFilters for targeted update without full validation
    const updatedPg = await PG.findOneAndUpdate(
      { _id: req.params.id, 'rooms.type': req.params.roomType },
      { $set: { 'rooms.$[room].availableBeds': Number(availableBeds) } },
      { 
        arrayFilters: [{ 'room.type': req.params.roomType }],
        new: true,
        runValidators: false 
      }
    );

    if (!updatedPg) return res.status(404).json({ success: false, message: 'Room type not found' });
    
    res.status(200).json({ success: true, data: updatedPg, message: 'Availability updated' });
  } catch (err) {
    next(err);
  }
});

// @desc    Record a walk-in booking
// @route   POST /api/owner/pgs/:id/walk-in
router.post('/pgs/:id/walk-in', async (req, res, next) => {
  try {
    const { guestInfo, roomType, checkIn, duration, totalPrice } = req.body;
    
    const pg = await PG.findOne({ _id: req.params.id, owner: req.user._id });
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found or not authorized' });

    // Find room and check availability
    const room = pg.rooms.find(r => r.type === roomType);
    if (!room) return res.status(404).json({ success: false, message: 'Room type not found' });
    if (room.availableBeds <= 0) return res.status(400).json({ success: false, message: 'No beds available' });

    // Create booking
    const booking = await Booking.create({
      pg: pg._id,
      guestInfo,
      roomType,
      checkIn: checkIn || Date.now(),
      duration: duration || 1,
      totalPrice: totalPrice || room.price,
      status: 'confirmed',
      isWalkIn: true,
      payment: {
        method: 'cash',
        status: 'paid',
        paidAt: Date.now()
      }
    });

    // Update bed count
    await PG.findOneAndUpdate(
      { _id: pg._id, 'rooms.type': roomType },
      { $inc: { 'rooms.$[room].availableBeds': -1, totalBookings: 1 } },
      { arrayFilters: [{ 'room.type': roomType }] }
    );

    res.status(201).json({ success: true, data: booking, message: 'Walk-in booking recorded' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;