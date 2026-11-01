const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true }, // 10% Subscribe & Save discount
    intervalDays: {
      type: Number,
      enum: [30, 60, 90],
      default: 30,
    },
    shippingAddress: { type: Object, required: true },
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Cancelled'],
      default: 'Active',
    },
    nextDeliveryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    orderCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
