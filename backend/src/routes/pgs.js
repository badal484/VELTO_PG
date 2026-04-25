const express = require('express');
const router = express.Router();
const PG = require('../models/PG');
const { protect, optionalProtect } = require('../middleware/auth');
const Booking = require('../models/Booking');

// @desc    Get all PGs with filters
// @route   GET /api/pgs
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      city, area, type, priceMin, priceMax, amenities,
      meals, roomType, search, lat, lng, radius, sort, page = 1, limit = 10
    } = req.query;

    const query = { isActive: true, isVerified: true };

    if (city) query['address.city'] = city;
    if (area) query['address.area'] = area;
    if (type) query.type = type;
    if (priceMin || priceMax) {
      query.priceFrom = {};
      if (priceMin) query.priceFrom.$gte = Number(priceMin);
      if (priceMax) query.priceFrom.$lte = Number(priceMax);
    }
    if (amenities) {
      const amenityList = amenities.split(',');
      amenityList.forEach(a => { query[`amenities.${a}`] = true; });
    }
    if (meals === 'true') {
      query.$or = [
        ...(query.$or || []),
        { 'amenities.meals': true },
        { 'foodDetails.mealsProvided': true }
      ];
    }
    if (roomType) {
      const types = roomType.split(',').filter(Boolean);
      query.rooms = { $elemMatch: { type: { $in: types }, availableBeds: { $gt: 0 } } };
    }

    if (search) {
      const keywords = search.split(/\s+/).filter(k => k.length > 2);
      if (keywords.length > 0) {
        query.$or = keywords.flatMap(k => {
          const safeK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = { $regex: safeK, $options: 'i' };
          return [
            { name: regex },
            { 'address.area': regex },
            { description: regex }
          ];
        });
      } else {
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { name: { $regex: safeSearch, $options: 'i' } },
          { 'address.area': { $regex: safeSearch, $options: 'i' } }
        ];
      }
    }

    if (lat && lng) {
      const radiusKm = Number(radius) || 3;
      query['address.coordinates'] = {
        $geoWithin: { $centerSphere: [[Number(lng), Number(lat)], radiusKm / 6378.1] }
      };
    }

    let sortQuery = {};
    if (sort === 'price_asc') sortQuery.priceFrom = 1;
    else if (sort === 'price_desc') sortQuery.priceFrom = -1;
    else if (sort === 'rating') sortQuery.rating = -1;
    else sortQuery.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const pgs = await PG.find(query).sort(sortQuery).skip(skip).limit(Number(limit));
    const total = await PG.countDocuments(query);

    res.status(200).json({
      success: true,
      data: pgs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get featured PGs
// @route   GET /api/pgs/featured
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const pgs = await PG.find({ isActive: true, isVerified: true, featured: true }).limit(8);
    res.status(200).json({ success: true, data: pgs });
  } catch (err) {
    next(err);
  }
});

// @desc    Get single PG
// @route   GET /api/pgs/:id
// @access  Public
router.get('/:id', optionalProtect, async (req, res, next) => {
  try {
    // Increment view count using findByIdAndUpdate to avoid validation issues on save()
    const pg = await PG.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } }, 
      { new: true }
    ).populate('owner', 'name avatar');
    
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    let canReview = false;
    if (req.user) {
      const booking = await Booking.findOne({
        user: req.user._id,
        pg: pg._id,
        status: { $in: ['confirmed', 'completed'] },
        duration: { $gte: 1 }
      });
      canReview = !!booking;
    }

    res.status(200).json({ success: true, data: pg, canReview });
  } catch (err) {
    next(err);
  }
});

// @desc    Toggle wishlist
// @route   POST /api/pgs/:id/wishlist
// @access  Protected
router.post('/:id/wishlist', protect, async (req, res, next) => {
  try {
    const user = req.user;
    const pgId = req.params.id;

    const index = user.wishlist.indexOf(pgId);
    if (index === -1) {
      user.wishlist.push(pgId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ success: true, data: user.wishlist, message: 'Wishlist updated' });
  } catch (err) {
    next(err);
  }
});

// @desc    Increment view count
// @route   POST /api/pgs/:id/view
// @access  Public
router.post('/:id/view', async (req, res, next) => {
  try {
    await PG.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
