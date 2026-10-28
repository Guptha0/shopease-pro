const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./config/db');
const { seedDatabaseIfEmpty } = require('./utils/seederHelper');

dotenv.config();

const runSeed = async () => {
  try {
    console.log('[Seeder Script] Initializing...');
    await connectDB();
    await seedDatabaseIfEmpty(true);
    console.log('✅ [Seeder Script] Seeding complete!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder Script Error]:', error);
    process.exit(1);
  }
};

runSeed();
