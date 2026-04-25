const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createRikle = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    let user = await User.findOne({ email: 'riklestork@gmail.com' });
    if (user) {
      console.log('User Rikle already exists');
    } else {
      user = await User.create({
        name: 'RIKLE',
        email: 'riklestork@gmail.com',
        phone: '1234567890',
        password: '12345678',
        role: 'user',
        isVerified: true
      });
      console.log('User Rikle created: riklestork@gmail.com / 12345678');
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createRikle();