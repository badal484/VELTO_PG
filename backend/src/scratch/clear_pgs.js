const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PG = require('../models/PG');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const PartnerApplication = require('../models/PartnerApplication');

dotenv.config();

const clearAllVeltoData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const pgRes = await PG.deleteMany({});
    const revRes = await Review.deleteMany({});
    const bookRes = await Booking.deleteMany({});
    const appRes = await PartnerApplication.deleteMany({});
    
    console.log(`Deleted ${pgRes.deletedCount} PGs.`);
    console.log(`Deleted ${revRes.deletedCount} Reviews.`);
    console.log(`Deleted ${bookRes.deletedCount} Bookings.`);
    console.log(`Deleted ${appRes.deletedCount} Partner Applications.`);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clearAllVeltoData();