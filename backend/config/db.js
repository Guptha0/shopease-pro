const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[MongoDB Connection Error] Failed to connect to ${uri}: ${err.message}`);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
};

module.exports = { connectDB, disconnectDB };
