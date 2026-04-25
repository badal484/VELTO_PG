const crypto = require('crypto');
exports.generateOTP = () => crypto.randomInt(100000, 999999).toString();
exports.hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');