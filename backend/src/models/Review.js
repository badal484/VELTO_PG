const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pg:      { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating:  { type: Number, required: true, min: 1, max: 5, validate: { validator: Number.isInteger, message: 'Rating must be a whole number' } },
  title:   { type: String, required: true, trim: true, maxlength: 100 },
  comment: { type: String, required: true, minlength: 20, maxlength: 1000 },
  ratings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    food:        { type: Number, min: 1, max: 5 },
    safety:      { type: Number, min: 1, max: 5 },
    value:       { type: Number, min: 1, max: 5 },
    staff:       { type: Number, min: 1, max: 5 },
  },
  status:         { type: String, enum: ['pending','approved','rejected','flagged'], default: 'approved' },
  ownerReply:     { type: String, maxlength: 500 },
  ownerRepliedAt: Date,
  isReported:     { type: Boolean, default: false },
  reportReason:   String,
}, { timestamps: true });
ReviewSchema.index({ pg: 1, user: 1 }, { unique: true });
ReviewSchema.index({ pg: 1, status: 1, createdAt: -1 });
module.exports = mongoose.model('Review', ReviewSchema);
