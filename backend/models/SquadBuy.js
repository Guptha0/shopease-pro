const mongoose = require('mongoose');

const squadMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  orderId: { type: String },
  joinedAt: { type: Date, default: Date.now },
});

const squadBuySchema = new mongoose.Schema(
  {
    squadCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    squadPrice: { type: Number, required: true }, // 15% discount
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    initiatorName: { type: String, required: true },
    members: [squadMemberSchema],
    targetMembers: { type: Number, default: 2 },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Expired'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SquadBuy', squadBuySchema);
