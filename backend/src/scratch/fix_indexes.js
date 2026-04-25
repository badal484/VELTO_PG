const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const db = mongoose.connection.db;
    const collection = db.collection('bookings');
    
    // Check indexes
    const indexes = await collection.indexes();
    console.log('Current Indexes:', indexes.map(i => i.name));
    
    if (indexes.some(i => i.name === 'qrCode_1')) {
      await collection.dropIndex('qrCode_1');
      console.log('Dropped qrCode_1 index');
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixIndexes();
