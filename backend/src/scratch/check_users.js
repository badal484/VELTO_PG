const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const users = await User.find({}, 'name email role isVerified');
    console.log('Total Users:', users.length);
    console.log(users);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();
