const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  imageUrl: { type: String },
});

const returnTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  description: { type: String },
});

const returnSchema = new mongoose.Schema(
  {
    returnId: {
      type: String,
      required: true,
      unique: true,
      default: () => 'RET-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderTracking: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String },
    userEmail: { type: String },
    items: [returnItemSchema],
    reason: {
      type: String,
      required: [true, 'Please provide a return reason'],
    },
    resolution: {
      type: String,
      enum: ['Instant Wallet Refund', 'Replacement'],
      default: 'Instant Wallet Refund',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    pickupDate: {
      type: Date,
      default: () => new Date(Date.now() + 86400000 * 2),
    },
    pickupAddress: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      phone: String,
    },
    status: {
      type: String,
      enum: [
        'Return Requested',
        'Pickup Scheduled',
        'Item Picked Up',
        'Refund Approved',
        'Refund Rejected',
      ],
      default: 'Return Requested',
    },
    timeline: [returnTimelineSchema],
    adminNotes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Return', returnSchema);

