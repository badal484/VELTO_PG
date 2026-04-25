const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const createNexBuy = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const email = 'nexxbuyy@gmail.com';
    const password = await bcrypt.hash('12345678', 12);
    
    const user = await User.findOneAndUpdate(
      { email },
      { 
        $set: { 
          name: 'NexBuy',
          password,
          role: 'owner',
          isVerified: true
        } 
      },
      { upsert: true, new: true }
    );
    
    console.log('User NexBuy updated/created:', user.email, user.role, user.isVerified);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createNexBuy();
