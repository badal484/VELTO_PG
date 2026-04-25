const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  email:        { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  phone:        { type: String, required: [true, 'Phone is required'], trim: true },
  password:     { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
  role:         { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  avatar:       { type: String, default: '' },
  avatarFileId: { type: String, default: '' },
  isVerified:   { type: Boolean, default: false },
  isBanned:     { type: Boolean, default: false },
  banReason:    { type: String, default: '' },
  city:         { type: String, default: 'Bangalore' },
  wishlist:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'PG' }],
  lastLogin:    { type: Date },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

UserSchema.methods.getAccessToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' });
};

UserSchema.methods.getRefreshToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });
};

module.exports = mongoose.model('User', UserSchema);
