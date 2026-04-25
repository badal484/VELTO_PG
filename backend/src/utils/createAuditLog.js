const AuditLog = require('../models/AuditLog');

const createAuditLog = async (adminId, action, resourceType, resourceId, prevValue = null, newValue = null, req = null) => {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      resourceType,
      resourceId,
      prevValue,
      newValue,
      ip: req ? req.ip : null,
      userAgent: req ? req.headers['user-agent'] : null,
    });
  } catch (err) {
    console.error('Audit log creation failed:', err.message);
  }
};

module.exports = createAuditLog;