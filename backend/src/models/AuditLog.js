const mongoose = require('mongoose');
const AuditLogSchema = new mongoose.Schema({
  admin:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:       { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId:   { type: mongoose.Schema.Types.ObjectId },
  prevValue:    { type: mongoose.Schema.Types.Mixed },
  newValue:     { type: mongoose.Schema.Types.Mixed },
  ip:           String,
  userAgent:    String,
}, { timestamps: true });
AuditLogSchema.index({ admin: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
module.exports = mongoose.model('AuditLog', AuditLogSchema);
