const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String, required: true },
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  description: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: 'Karnataka' },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    deliverySpeed: {
      type: String,
      enum: ['Standard', 'Prime Same-Day Express'],
      default: 'Standard',
    },
    paymentMethod: {
      type: String,
      enum: ['Card', 'UPI', 'NetBanking', 'COD', 'Wallet', 'QR_CODE'],
      default: 'UPI',
    },
    coinsRedeemed: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    isEcoPackaging: { type: Boolean, default: false },
    mrpTotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    platformFee: { type: Number, default: 5 },
    deliveryCharge: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Order Placed',
    },
    trackingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    courierPartner: {
      type: String,
      default: 'BlueDart Express',
    },
    timeline: [timelineSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
