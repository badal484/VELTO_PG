const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const fixUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    // Verify ankhigupta02@gmail.com and make it an owner
    const res1 = await User.updateOne(
      { email: 'ankhigupta02@gmail.com' },
      { $set: { isVerified: true, role: 'owner', name: 'NexBuy' } }
    );
    console.log('Updated ankhi:', res1);

    // Verify admin@test.com
    const res2 = await User.updateOne(
      { email: 'admin@test.com' },
      { $set: { isVerified: true } }
    );
    console.log('Updated admin:', res2);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixUsers();
