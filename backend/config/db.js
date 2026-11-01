const mongoose = require('mongoose');

process.env.MONGOMS_STARTUP_TIMEOUT = process.env.MONGOMS_STARTUP_TIMEOUT || '60000';

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere';

  try {
    // Attempt standard connection first with short timeout if local
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB Standalone Unavailable] ${err.message}. Initializing MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB Memory Server Connected] In-memory DB active at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB Fatal Error] Could not start memory server: ${memErr.message}`);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (e) {
    // ignore
  }
};

module.exports = { connectDB, disconnectDB };
