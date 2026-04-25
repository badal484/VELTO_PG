const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { generateOTP, hashOTP } = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already exists and is verified' });
    }

    if (!user) {
      // Create user (unverified)
      user = await User.create({ name, email, phone, password });
    } else {
      // Update unverified user
      user.name = name;
      user.phone = phone;
      user.password = password;
      await user.save();
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OTP.create({
      email,
      otp: hashOTP(otpCode),
      type: 'email_verify',
      expiresAt,
    });

    // Send Email
    await sendEmail({
      email,
      subject: 'Verify your email - Velto Stay',
      html: `
        <h2>Welcome to Velto Stay</h2>
        <p>Please use the following OTP to verify your email address:</p>
        <div style="background: #F7F7F7; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; border-radius: 8px; color: #FF385C;">
          ${otpCode}
        </div>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    res.status(201).json({ success: true, message: 'Verification OTP sent to email' });
  } catch (err) {
    next(err);
  }
});
// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    // Generate new OTP
    const otpCode = generateOTP();
    await OTP.create({
      email,
      otp: hashOTP(otpCode),
      type: 'email_verify',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send Email
    await sendEmail({
      email,
      subject: 'New Verification Code - Velto Stay',
      html: `
        <h2>Email Verification</h2>
        <p>Your new verification code is:</p>
        <div style="background: #F7F7F7; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; border-radius: 8px; color: #FF385C;">
          ${otpCode}
        </div>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    res.status(200).json({ success: true, message: 'New OTP sent to email' });
  } catch (err) {
    next(err);
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const hashedOtp = hashOTP(otp);

    const otpRecord = await OTP.findOne({
      email,
      otp: hashedOtp,
      type: 'email_verify',
      expiresAt: { $gt: Date.now() },
      isUsed: false,
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const user = await User.findOne({ email });
    user.isVerified = true;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt body:', JSON.stringify(req.body));

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`Login failed: Account not found for ${email}`);
      return res.status(401).json({ success: false, message: 'Account not found. Please register first.' });
    }

    if (!(await user.matchPassword(password))) {
      console.log(`Login failed for ${email}: Incorrect password`);
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    if (!user.isVerified) {
      console.log(`Login failed for ${email}: Not verified`);
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Account suspended: ${user.banReason}` });
    }

    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken || refreshToken.isRevoked || refreshToken.expiresAt < Date.now()) {
      if (refreshToken) {
        // Reuse detection: revoke entire family
        await RefreshToken.updateMany({ family: refreshToken.family }, { isRevoked: true });
      }
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = await User.findById(refreshToken.user);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    // Rotate token
    const newToken = user.getRefreshToken();
    const newRefreshToken = await RefreshToken.create({
      user: user._id,
      token: newToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      family: refreshToken.family,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    refreshToken.isRevoked = true;
    refreshToken.replacedBy = newToken;
    await refreshToken.save();

    const accessToken = user.getAccessToken();

    res.cookie('refreshToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Protected
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
    }
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otpCode = generateOTP();
    await OTP.create({
      email,
      otp: hashOTP(otpCode),
      type: 'forgot_password',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmail({
      email,
      subject: 'Password Reset OTP - Velto Stay',
      html: `
        <h2>Password Reset Request</h2>
        <p>Use the following OTP to reset your password:</p>
        <div style="background: #F7F7F7; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; border-radius: 8px; color: #FF385C;">
          ${otpCode}
        </div>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    res.status(200).json({ success: true, message: 'Reset OTP sent to email' });
  } catch (err) {
    next(err);
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    const hashedOtp = hashOTP(otp);

    const otpRecord = await OTP.findOne({
      email,
      otp: hashedOtp,
      type: 'forgot_password',
      expiresAt: { $gt: Date.now() },
      isUsed: false,
    });

    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    otpRecord.isUsed = true;
    await otpRecord.save();

    const user = await User.findOne({ email });
    user.password = password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Protected
router.get('/me', protect, (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = user.getAccessToken();
  const refreshToken = user.getRefreshToken();

  // Save refresh token to DB
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    family: crypto.randomBytes(16).toString('hex'),
    userAgent: res.req.headers['user-agent'],
    ip: res.req.ip,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    data: { accessToken, user },
  });
};

module.exports = router;
