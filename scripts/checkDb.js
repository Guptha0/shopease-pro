const mongoose = require('mongoose');
const { connectDB } = require('../backend/config/db');
const User = require('../backend/models/User');
const Product = require('../backend/models/Product');
const { seedDatabaseIfEmpty } = require('../backend/utils/seederHelper');

async function check() {
  await connectDB();
  const userCount = await User.countDocuments();
  const prodCount = await Product.countDocuments();
  console.log('Current DB state: users =', userCount, 'products =', prodCount);
  if (userCount === 0) {
    console.log('Seeding database now...');
    await seedDatabaseIfEmpty(true);
    console.log('Seed completed!');
  }
  const users = await User.find({}, 'email role');
  console.log('Users in DB:', users);
  process.exit(0);
}

check().catch(console.error);

