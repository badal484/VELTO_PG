const mongoose = require('mongoose');
const PayoutSchema = new mongoose.Schema({
  owner:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pg:                { type: mongoose.Schema.Types.ObjectId, ref: 'PG' },
  month:             { type: Number, required: true, min: 1, max: 12 },
  year:              { type: Number, required: true },
  bookings:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  grossRevenue:      { type: Number, required: true },
  commission:        { type: Number, required: true },
  commissionPercent: { type: Number, default: 10 },
  netAmount:         { type: Number, required: true },
  status:            { type: String, enum: ['pending','processed','failed'], default: 'pending' },
  processedAt:       Date,
  transactionRef:    String,
  notes:             String,
}, { timestamps: true });
module.exports = mongoose.model('Payout', PayoutSchema);