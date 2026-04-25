const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const adminEmail = 'admin@veltostay.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists. Updating password...');
      existingAdmin.password = 'Admin@123';
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log('Admin updated.');
    } else {
      await User.create({
        name: 'Velto Admin',
        email: adminEmail,
        phone: '9999999999',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true
      });
      console.log('Admin created.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
