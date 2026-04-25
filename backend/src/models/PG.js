const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  type:            { type: String, enum: ['single','double','triple','dormitory'], required: true },
  price:           { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, default: 0 },
  totalBeds:       { type: Number, required: true, min: 1 },
  availableBeds:   { type: Number, required: true, min: 0 },
  amenities:       [String],
  images:          [{ url: String, fileId: String }],
});

const PGSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerApplication' },
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true, minlength: 50 },
  type:        { type: String, enum: ['male','female','co-ed'], required: true },
  images:      [{ url: String, fileId: String }],
  address: {
    street:      { type: String, required: true },
    area:        { type: String, required: true },
    landmark:    String,
    city:        { type: String, default: 'Bangalore' },
    state:       { type: String, default: 'Karnataka' },
    pincode:     { type: String, required: true },
    googleMapsLink: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    },
  },
  rooms: [RoomSchema],
  amenities: {
    wifi: Boolean, ac: Boolean, meals: Boolean, laundry: Boolean, parking: Boolean,
    gym: Boolean, security: Boolean, powerBackup: Boolean, housekeeping: Boolean,
    tv: Boolean, waterPurifier: Boolean, geyser: Boolean, refrigerator: Boolean,
    studyTable: Boolean, wardrobe: Boolean, attachedBathroom: Boolean,
    cctv: Boolean, biometricEntry: Boolean, fireExtinguisher: Boolean,
  },
  foodDetails: {
    mealsProvided: Boolean,
    mealType: { type: String, enum: ['veg_only','non_veg','both'] },
    mealsIncluded: String,
    mealCharges: Number,
    kitchenAvailable: Boolean,
  },
  rules: {
    guestAllowed: Boolean, smokingAllowed: Boolean, drinkingAllowed: Boolean,
    petsAllowed: Boolean, curfewTime: { type: String, default: 'None' },
    minStayMonths: { type: Number, default: 1 }, noticePeriodDays: { type: Number, default: 30 },
    additionalRules: String,
  },
  nearby: { metro: String, bus: String, hospital: String, market: String, college: String, itPark: String },
  priceFrom:         { type: Number },
  rating:            { type: Number, default: 0 },
  reviewCount:       { type: Number, default: 0 },
  isVerified:        { type: Boolean, default: false },
  isActive:          { type: Boolean, default: true },
  featured:          { type: Boolean, default: false },
  totalBookings:     { type: Number, default: 0 },
  views:             { type: Number, default: 0 },
  commissionPercent: { type: Number, default: 10 },
}, { timestamps: true });

PGSchema.pre('save', function(next) {
  if (this.rooms?.length) this.priceFrom = Math.min(...this.rooms.map(r => r.price));
  next();
});

PGSchema.statics.recalculatePriceFrom = async function(pgId) {
  const pg = await this.findById(pgId);
  if (pg?.rooms?.length) { pg.priceFrom = Math.min(...pg.rooms.map(r => r.price)); await pg.save(); }
};

PGSchema.statics.recalculateRating = async function(pgId) {
  const Review = require('./Review');
  const stats = await Review.aggregate([
    { $match: { pg: new mongoose.Types.ObjectId(pgId), status: 'approved' } },
    { $group: { _id: '$pg', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length) {
    await this.findByIdAndUpdate(pgId, { rating: Math.round(stats[0].avg * 10) / 10, reviewCount: stats[0].count });
  } else {
    await this.findByIdAndUpdate(pgId, { rating: 0, reviewCount: 0 });
  }
};

PGSchema.index({ 'address.city': 1 });
PGSchema.index({ 'address.area': 1 });
PGSchema.index({ 'address.coordinates': '2dsphere' });
PGSchema.index({ priceFrom: 1 });
PGSchema.index({ rating: -1 });
PGSchema.index({ isActive: 1, isVerified: 1 });
PGSchema.index({ name: 'text', description: 'text', 'address.area': 'text' });

module.exports = mongoose.model('PG', PGSchema);
