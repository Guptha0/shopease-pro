const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const { seedDatabaseIfEmpty } = require('./utils/seederHelper');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB & auto-seed if clean database
connectDB()
  .then(async () => {
    try {
      await seedDatabaseIfEmpty(false);
    } catch (seedErr) {
      console.warn('[Seeder Info] Auto-seed check finished:', seedErr.message);
    }
  })
  .catch((err) => {
    console.error('Fatal: Failed to connect to MongoDB:', err);
  });

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/enterprise', require('./routes/enterpriseRoutes'));

// Root / Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ShopSphere API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 ShopSphere Backend running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👉 Products API: http://localhost:${PORT}/api/products`);
  console.log(`===============================================`);
});

module.exports = app;
