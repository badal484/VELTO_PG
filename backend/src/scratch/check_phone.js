const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const checkPhone = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const users = await User.find({}, 'email name phone');
    console.log(users);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkPhone();