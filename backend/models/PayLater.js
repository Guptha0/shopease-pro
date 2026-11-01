const mongoose = require('mongoose');

const dueSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => 'DUE-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
  },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days interest-free
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
});

const payLaterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    creditLimit: {
      type: Number,
      required: true,
      default: 25000, // Pre-approved ₹25,000 credit limit
    },
    availableCredit: {
      type: Number,
      required: true,
      default: 25000,
    },
    usedCredit: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active',
    },
    dues: [dueSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PayLater', payLaterSchema);
