const mongoose = require('mongoose');
const RefreshTokenSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token:      { type: String, required: true, unique: true },
  expiresAt:  { type: Date, required: true },
  isRevoked:  { type: Boolean, default: false },
  replacedBy: { type: String, default: null },
  family:     { type: String, required: true },
  userAgent:  { type: String, default: '' },
  ip:         { type: String, default: '' },
}, { timestamps: true });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ user: 1, family: 1 });
module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);