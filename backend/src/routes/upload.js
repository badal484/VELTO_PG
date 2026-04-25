const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const imagekit = require('../config/imagekit');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Upload image to ImageKit
// @route   POST /api/upload/image
// @access  Protected
router.post('/image', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const response = await imagekit.upload({
      file: req.file.buffer,
      fileName: `img_${Date.now()}_${req.file.originalname}`,
      folder: '/velto-stay',
    });

    res.status(200).json({
      success: true,
      data: {
        url: response.url,
        fileId: response.fileId,
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete image from ImageKit
// @route   DELETE /api/upload/image
// @access  Protected
router.delete('/image', protect, async (req, res, next) => {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ success: false, message: 'fileId is required' });

    await imagekit.deleteFile(fileId);
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;