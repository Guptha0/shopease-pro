const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: { type: String, default: 'ShopEase Customer' },
    recipientEmail: { type: String, default: '' },
    recipientName: { type: String, default: 'Friend' },
    amount: { type: Number, required: true },
    theme: {
      type: String,
      default: 'Tech Geek',
    },
    personalMessage: { type: String, default: 'Enjoy shopping on ShopEase Pro!' },
    isRedeemed: { type: Boolean, default: false },
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    redeemedAt: { type: Date },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GiftCard', giftCardSchema);
