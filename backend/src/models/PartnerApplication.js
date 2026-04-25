const mongoose = require('mongoose');
const PartnerApplicationSchema = new mongoose.Schema({
  applicant:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['pending','reviewing','approved','rejected','submitted','under_review','inspection_scheduled'], default: 'pending' },
  pgName:      { type: String, required: true, trim: true },
  pgType:      { type: String, enum: ['male','female','co-ed'], required: true },
  description: { type: String, minlength: 100 },
  address: {
    street: String, area: String, landmark: String,
    city: { type: String, default: 'Bangalore' },
    state: { type: String, default: 'Karnataka' },
    pincode: String, googleMapsLink: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] } // [lng, lat]
    },
  },
  rooms: [{ type: { type: String, enum: ['single','double','triple','dormitory'] }, price: Number, securityDeposit: Number, totalBeds: Number, amenities: [String] }],
  amenities:   { type: mongoose.Schema.Types.Mixed, default: {} },
  foodDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  rules:       { type: mongoose.Schema.Types.Mixed, default: {} },
  nearby:      { type: mongoose.Schema.Types.Mixed, default: {} },
  images:      [{ url: String, fileId: String }],
  documents:   [{ url: String, fileId: String, docType: String }],
  inspection:  { scheduled: { type: Boolean, default: false }, scheduledDate: Date, notes: String },
  adminNotes:  String,
  rejectReason: String,
  rejectedAt:  Date,
  approvedAt:  Date,
  createdPG:   { type: mongoose.Schema.Types.ObjectId, ref: 'PG' },
}, { timestamps: true });
module.exports = mongoose.model('PartnerApplication', PartnerApplicationSchema);
