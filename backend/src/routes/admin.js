const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PG = require('../models/PG');
const Booking = require('../models/Booking');
const PartnerApplication = require('../models/PartnerApplication');
const Review = require('../models/Review');
const Payout = require('../models/Payout');
const AuditLog = require('../models/AuditLog');
const SupportChat = require('../models/SupportChat');
const { protect, authorize } = require('../middleware/auth');
const createAuditLog = require('../utils/createAuditLog');
const createNotification = require('../utils/createNotification');
const sendEmail = require('../utils/sendEmail');

router.use(protect);
// General admin authorization, but specific routes below can override or add roles

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// Dashboard is for admin only
router.get('/dashboard', authorize('admin'), async (req, res, next) => {
  try {
    const [users, activePGs, totalBookings, pendingApplicationsCount, revenueAgg, recentBookings, pendingApplicationsList] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        PG.countDocuments({ isActive: true, isVerified: true }),
        Booking.countDocuments(),
        PartnerApplication.countDocuments({ status: 'submitted' }),
        Booking.aggregate([
          { $match: { 'payment.status': 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),
        Booking.find().sort('-createdAt').limit(5)
          .populate('user', 'name')
          .populate('pg', 'name'),
        PartnerApplication.find({ status: 'submitted' }).sort('-createdAt').limit(5)
          .populate('applicant', 'name'),
      ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        activePGs,
        totalBookings,
        pendingApplications: pendingApplicationsCount,
        totalRevenue: revenueAgg[0]?.total || 0,
        recentBookings,
        pendingApplicationsList,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── USERS ────────────────────────────────────────────────────────────────────
// Users management is for admin only
router.get('/users', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isBanned } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
    if (search) {
      const s = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id/ban', async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const prev = { isBanned: user.isBanned, banReason: user.banReason };
    user.isBanned = true;
    user.banReason = reason || 'Violation of terms';
    await user.save();

    await createAuditLog(req.user._id, 'BAN_USER', 'User', user._id, prev, { isBanned: true, banReason: user.banReason }, req);
    res.status(200).json({ success: true, data: user, message: 'User banned' });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id/unban', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const prev = { isBanned: user.isBanned, banReason: user.banReason };
    user.isBanned = false;
    user.banReason = '';
    await user.save();

    await createAuditLog(req.user._id, 'UNBAN_USER', 'User', user._id, prev, { isBanned: false }, req);
    res.status(200).json({ success: true, data: user, message: 'User unbanned' });
  } catch (err) {
    next(err);
  }
});

// ─── PGs ──────────────────────────────────────────────────────────────────────
// PG management is for admin only
router.get('/pgs', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isVerified, isActive, search } = req.query;
    const filter = {};
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      const s = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { 'address.area': { $regex: s, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [pgs, total] = await Promise.all([
      PG.find(filter).populate('owner', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
      PG.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: pgs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/pgs/:id/verify', async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const prev = { isVerified: pg.isVerified };
    pg.isVerified = true;
    await pg.save();

    await createAuditLog(req.user._id, 'VERIFY_PG', 'PG', pg._id, prev, { isVerified: true }, req);
    await createNotification(pg.owner, 'pg_verified', 'PG Verified!',
      `Your property "${pg.name}" has been verified and is now live.`, '/owner/dashboard');
    res.status(200).json({ success: true, data: pg, message: 'PG verified' });
  } catch (err) {
    next(err);
  }
});

router.put('/pgs/:id/feature', async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    pg.featured = !pg.featured;
    await pg.save();

    await createAuditLog(req.user._id, pg.featured ? 'FEATURE_PG' : 'UNFEATURE_PG', 'PG', pg._id, {}, { featured: pg.featured }, req);
    res.status(200).json({ success: true, data: pg, message: `PG ${pg.featured ? 'featured' : 'unfeatured'}` });
  } catch (err) {
    next(err);
  }
});

router.put('/pgs/:id/deactivate', async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const prev = { isActive: pg.isActive };
    pg.isActive = !pg.isActive;
    await pg.save();

    await createAuditLog(req.user._id, pg.isActive ? 'ACTIVATE_PG' : 'DEACTIVATE_PG', 'PG', pg._id, prev, { isActive: pg.isActive }, req);
    res.status(200).json({ success: true, data: pg, message: `PG ${pg.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    next(err);
  }
});

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
// Bookings management is for admin only
router.get('/bookings', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate('pg', 'name address')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PARTNER APPLICATIONS ─────────────────────────────────────────────────────
// Applications are for admin only
router.get('/applications', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [apps, total] = await Promise.all([
      PartnerApplication.find(filter)
        .populate('applicant', 'name email phone')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      PartnerApplication.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: apps,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/applications/:id', async (req, res, next) => {
  try {
    const app = await PartnerApplication.findById(req.params.id)
      .populate('applicant', 'name email phone avatar');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
});

router.put('/applications/:id/approve', async (req, res, next) => {
  try {
    const app = await PartnerApplication.findById(req.params.id).populate('applicant');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    if (app.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Already approved' });
    }

    const pgData = {
      owner: app.applicant._id,
      application: app._id,
      name: app.pgName,
      type: app.pgType,
      description: app.description || 'Premium PG accommodation in Bangalore.',
      address: {
        ...app.address,
        coordinates: (app.address?.coordinates?.coordinates?.length === 2)
          ? app.address.coordinates
          : { type: 'Point', coordinates: [77.5946, 12.9716] } // Default to Bangalore Center [lng, lat]
      },
      rooms: app.rooms.map(r => ({ ...r, availableBeds: r.totalBeds })), // Initialize availability
      amenities: app.amenities,
      foodDetails: app.foodDetails,
      rules: app.rules,
      nearby: app.nearby,
      images: app.images,
      isVerified: true,
      isActive: true,
    };

    const pg = await PG.create(pgData);

    app.status = 'approved';
    app.approvedAt = Date.now();
    app.createdPG = pg._id;
    await app.save();

    const user = await User.findById(app.applicant._id);
    if (user.role !== 'admin') {
      user.role = 'owner';
      await user.save();
    }

    await createAuditLog(req.user._id, 'APPROVE_APPLICATION', 'PartnerApplication', app._id,
      { status: 'submitted' }, { status: 'approved' }, req);
    await createNotification(user._id, 'app_approved', 'Application Approved!',
      `Congratulations! Your PG "${pg.name}" is now live on Velto Stay.`, '/owner/dashboard');

    await sendEmail({
      email: user.email,
      subject: 'Your Partner Application is Approved! 🎉',
      type: 'application_approved',
      data: { userName: user.name, pgName: pg.name },
    });

    res.status(200).json({ success: true, data: pg, message: 'Application approved and PG created' });
  } catch (err) {
    next(err);
  }
});

router.put('/applications/:id/reject', async (req, res, next) => {
  try {
    const { reason } = req.body;
    const app = await PartnerApplication.findById(req.params.id).populate('applicant', 'name email');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    app.status = 'rejected';
    app.rejectReason = reason || 'Does not meet our current standards';
    app.rejectedAt = Date.now();
    await app.save();

    await createAuditLog(req.user._id, 'REJECT_APPLICATION', 'PartnerApplication', app._id,
      { status: app.status }, { status: 'rejected', reason }, req);

    await sendEmail({
      email: app.applicant.email,
      subject: 'Update on Your Partner Application',
      type: 'application_rejected',
      data: { userName: app.applicant.name, reason: app.rejectReason },
    });

    res.status(200).json({ success: true, data: app, message: 'Application rejected' });
  } catch (err) {
    next(err);
  }
});

router.put('/applications/:id/inspection', async (req, res, next) => {
  try {
    const { scheduledDate, notes } = req.body;
    const app = await PartnerApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    app.status = 'inspection_scheduled';
    app.inspection = { scheduled: true, scheduledDate, notes };
    await app.save();

    res.status(200).json({ success: true, data: app, message: 'Inspection scheduled' });
  } catch (err) {
    next(err);
  }
});

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
// Reviews are for admin only
router.get('/reviews', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name email')
        .populate('pg', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/reviews/:id/approve', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await PG.recalculateRating(review.pg);
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

router.put('/reviews/:id/reject', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await PG.recalculateRating(review.pg);
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

// ─── REVENUE CHART ────────────────────────────────────────────────────────────
// Accessible by Admin and Owner
router.get('/revenue-chart', authorize('admin', 'owner'), async (req, res, next) => {
  try {
    const isOwner = req.user.role === 'owner';
    const match = { 'payment.status': 'paid' };
    
    if (isOwner) {
      const pgs = await PG.find({ owner: req.user._id }).select('_id');
      match.pg = { $in: pgs.map(p => p._id) };
    }
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const data = await Booking.aggregate([
      { $match: { ...match, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chart = data.map(d => ({
      month: months[d._id.month - 1],
      year: d._id.year,
      revenue: d.revenue,
      bookings: d.bookings,
    }));

    res.status(200).json({ success: true, data: chart });
  } catch (err) {
    next(err);
  }
});

// ─── PAYOUTS ──────────────────────────────────────────────────────────────────
// Accessible by Admin and Owner
router.get('/payouts', authorize('admin', 'owner'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    
    if (req.user.role === 'owner') {
      filter.owner = req.user._id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [payouts, total] = await Promise.all([
      Payout.find(filter)
        .populate('owner', 'name email')
        .populate('pg', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Payout.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: payouts,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/payouts/generate', async (req, res, next) => {
  try {
    let { month, year } = req.body;
    
    // Default to previous month if not provided
    if (!month || !year) {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      month = d.getMonth() + 1;
      year = d.getFullYear();
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const owners = await User.find({ role: 'owner' });
    const generated = [];

    for (const owner of owners) {
      const pgs = await PG.find({ owner: owner._id });
      for (const pg of pgs) {
        const existing = await Payout.findOne({ owner: owner._id, pg: pg._id, month, year });
        if (existing) continue;

        const bookings = await Booking.find({
          pg: pg._id,
          'payment.status': 'paid',
          'payment.paidAt': { $gte: startDate, $lt: endDate },
        });

        if (!bookings.length) continue;

        const gross = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const commissionPct = pg.commissionPercent || 10;
        const commission = Math.round(gross * commissionPct / 100);
        const net = gross - commission;

        const payout = await Payout.create({
          owner: owner._id,
          pg: pg._id,
          month,
          year,
          bookings: bookings.map(b => b._id),
          grossRevenue: gross,
          commission,
          commissionPercent: commissionPct,
          netAmount: net,
          status: 'pending',
        });
        generated.push(payout);
      }
    }

    res.status(201).json({
      success: true,
      data: generated,
      message: `${generated.length} payout(s) generated`,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/payouts/:id/process', async (req, res, next) => {
  try {
    const { transactionRef, notes } = req.body;
    const payout = await Payout.findById(req.params.id).populate('owner', 'name email');
    if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

    payout.status = 'processed';
    payout.processedAt = Date.now();
    payout.transactionRef = transactionRef || '';
    payout.notes = notes || '';
    await payout.save();

    await createNotification(payout.owner._id, 'payout_processed', 'Payout Processed',
      `Your payout of ₹${payout.netAmount} for ${payout.month}/${payout.year} has been processed.`, '/owner/dashboard');

    await sendEmail({
      email: payout.owner.email,
      subject: `Payout Processed – ${payout.month}/${payout.year}`,
      type: 'payout_processed',
      data: {
        userName: payout.owner.name,
        month: payout.month,
        year: payout.year,
        grossRevenue: payout.grossRevenue,
        commissionPercent: payout.commissionPercent,
        netAmount: payout.netAmount,
        transactionRef: payout.transactionRef,
      },
    });

    res.status(200).json({ success: true, data: payout, message: 'Payout processed' });
  } catch (err) {
    next(err);
  }
});

// ─── SUPPORT ──────────────────────────────────────────────────────────────────
// Support management is for admin only
router.get('/support/chats', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [chats, total] = await Promise.all([
      SupportChat.find(filter)
        .populate('user', 'name email role')
        .populate('assignedTo', 'name')
        .sort('-lastMessage')
        .skip(skip)
        .limit(Number(limit)),
      SupportChat.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: chats,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/support/unread', async (_req, res, next) => {
  try {
    const count = await SupportChat.aggregate([
      { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } },
    ]);
    res.status(200).json({ success: true, data: { unread: count[0]?.total || 0 } });
  } catch (err) {
    next(err);
  }
});

router.put('/support/:id/assign', async (req, res, next) => {
  try {
    const chat = await SupportChat.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.user._id, status: 'in_progress' },
      { new: true }
    );
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.status(200).json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
});

router.put('/support/:id/resolve', async (req, res, next) => {
  try {
    const chat = await SupportChat.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.status(200).json({ success: true, data: chat, message: 'Chat resolved' });
  } catch (err) {
    next(err);
  }
});

router.post('/support/:id/message', async (req, res, next) => {
  try {
    const chat = await SupportChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const msg = {
      sender: req.user._id,
      senderRole: 'admin',
      text: req.body.text,
    };
    chat.messages.push(msg);
    chat.lastMessage = Date.now();
    chat.unreadByUser += 1;
    chat.unreadByAdmin = 0;
    if (chat.status === 'open') chat.status = 'in_progress';
    await chat.save();

    await createNotification(chat.user, 'support_reply', 'Support Reply',
      `An admin replied to your support ticket: "${chat.subject}"`, '/support');

    res.status(200).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
});

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
// Audit logs are for admin only
router.get('/audit-log', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, resourceType } = req.query;
    const filter = {};
    if (resourceType) filter.resourceType = resourceType;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('admin', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;