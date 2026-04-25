const mongoose = require('mongoose');
const OTPSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true },
  otp:       { type: String, required: true },
  type:      { type: String, enum: ['email_verify','forgot_password'], required: true },
  expiresAt: { type: Date, required: true },
  isUsed:    { type: Boolean, default: false },
  attempts:  { type: Number, default: 0, max: 5 },
}, { timestamps: true });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ email: 1, type: 1 });
module.exports = mongoose.model('OTP', OTPSchema);