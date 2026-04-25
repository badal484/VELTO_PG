const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const fixPhones = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const res = await User.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: '9999999999' } }
    );
    
    console.log('Updated phones:', res);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixPhones();