const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const inspectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connected');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (let col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`Collection: ${col.name}, Count: ${count}`);
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspectDB();