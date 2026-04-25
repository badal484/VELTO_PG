const express = require('express');
const router = express.Router();
const SupportChat = require('../models/SupportChat');
const { protect, authorize } = require('../middleware/auth');

// @desc    Start a new support chat
// @route   POST /api/support/chat
// @access  Protected
router.post('/chat', protect, async (req, res, next) => {
  try {
    const { subject, category, bookingRef, message } = req.body;
    const chat = await SupportChat.create({
      user: req.user._id,
      userRole: req.user.role === 'owner' ? 'owner' : 'user',
      subject,
      category,
      bookingRef,
      messages: [{
        sender: req.user._id,
        senderRole: req.user.role,
        text: message
      }],
      unreadByAdmin: 1
    });
    res.status(201).json({ success: true, data: chat });

    if (global.io) {
      global.io.to('admins').emit('new_support_chat', {
        _id: chat._id,
        subject: chat.subject,
        user: { _id: req.user._id, name: req.user.name }
      });
    }
  } catch (err) {
    next(err);
  }
});

// @desc    Get my support chats
// @route   GET /api/support/chat/my
// @access  Protected
router.get('/chat/my', protect, async (req, res, next) => {
  try {
    const chats = await SupportChat.find({ user: req.user._id }).sort('-lastMessage');
    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single chat with messages
// @route   GET /api/support/chat/:id
// @access  Protected
router.get('/chat/:id', protect, async (req, res, next) => {
  try {
    const chat = await SupportChat.findById(req.params.id)
      .populate('messages.sender', 'name avatar role')
      .populate('assignedTo', 'name');

    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (chat.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Reset unread count for the person fetching
    if (chat.user.toString() === req.user._id.toString()) {
      chat.unreadByUser = 0;
    } else if (req.user.role === 'admin') {
      chat.unreadByAdmin = 0;
    }
    await chat.save();

    res.status(200).json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
});

// @desc    Send message in chat
// @route   POST /api/support/chat/:id/message
// @access  Protected
router.post('/chat/:id/message', protect, async (req, res, next) => {
  try {
    const chat = await SupportChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const isUser = chat.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isUser && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });

    const message = {
      sender: req.user._id,
      senderRole: req.user.role,
      text: req.body.text
    };

    chat.messages.push(message);
    chat.lastMessage = Date.now();
    
    if (isUser) chat.unreadByAdmin += 1;
    if (isAdmin) chat.unreadByUser += 1;

    await chat.save();
    
    if (global.io) {
      // Notify the other party
      const targetRoom = isUser ? 'admins' : chat.user.toString();
      global.io.to(targetRoom).emit('new_message', {
        chatId: chat._id,
        message
      });
    }

    res.status(200).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});

// @desc    Long-poll for new messages
// @route   GET /api/support/chat/:id/poll
// @access  Protected
router.get('/chat/:id/poll', protect, async (req, res, next) => {
  try {
    const { after } = req.query; // timestamp
    const chat = await SupportChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const newMessages = chat.messages.filter(m => new Date(m.createdAt) > new Date(after));
    res.status(200).json({ success: true, data: newMessages });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
