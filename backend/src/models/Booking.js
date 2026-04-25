const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestInfo: {
    name:  String,
    phone: String,
    email: String,
  },
  isWalkIn:        { type: Boolean, default: false },
  pg:              { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  roomType:        { type: String, required: true },
  checkIn:         { type: Date, required: true },
  duration:        { type: Number, required: true, min: 1, max: 24 },
  totalPrice:      { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, default: 0 },
  status:          { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  payment: {
    method:            { type: String, enum: ['online','cash'], default: 'online' },
    status:            { type: String, enum: ['pending','paid','refunded','failed'], default: 'pending' },
    razorpayOrderId:   String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt:            Date,
    refundAmount:      Number,
    refundId:          String,
    refundedAt:        Date,
  },
  specialRequests: { type: String, default: '', maxlength: 500 },
  cancelledAt:     Date,
  cancelReason:    String,
  refundPercent:   Number,
  refundAmount:    Number,
  bookingId:       { type: String, unique: true },
}, { timestamps: true });

BookingSchema.pre('save', function(next) {
  if (!this.bookingId) this.bookingId = 'VLT-' + uuidv4().replace(/-/g,'').substring(0, 10).toUpperCase();
  next();
});

BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ pg: 1, status: 1 });
BookingSchema.index({ bookingId: 1 });
module.exports = mongoose.model('Booking', BookingSchema);