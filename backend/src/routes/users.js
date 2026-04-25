const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PG = require('../models/PG');
const { protect } = require('../middleware/auth');
const imagekit = require('../config/imagekit');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Protected
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Protected
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, city } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, city },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Protected
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// Avatar upload is handled in upload.js, but we'll link it here
// POST /api/users/avatar -> handled in upload.js

// @desc    Delete avatar
// @route   DELETE /api/users/avatar
// @access  Protected
router.delete('/avatar', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.avatarFileId) {
      await imagekit.deleteFile(user.avatarFileId);
      user.avatar = '';
      user.avatarFileId = '';
      await user.save();
    }
    res.status(200).json({ success: true, data: user, message: 'Avatar deleted' });
  } catch (err) {
    next(err);
  }
});

// @desc    Get wishlist PGs
// @route   GET /api/users/wishlist
// @access  Protected
router.get('/wishlist', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json({ success: true, data: user.wishlist });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
