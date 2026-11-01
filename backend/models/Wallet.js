const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  },
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  referenceId: {
    type: String,
    default: () => 'REF-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0, // Clean slate for new users
    },
    rewardsCoins: {
      type: Number,
      required: true,
      default: 0, // Clean slate for new users
    },
    transactions: [transactionSchema],
  },
  {
    timestamps: true,
  }
);

// Method to log transaction cleanly
walletSchema.methods.logTransaction = function ({ type, amount, description, referenceId }) {
  const txnId = 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  this.transactions.unshift({
    id: txnId,
    type,
    amount: Number(amount),
    description,
    referenceId: referenceId || ('REF-' + Math.random().toString(36).substring(2, 9).toUpperCase()),
    createdAt: new Date(),
  });
};

module.exports = mongoose.model('Wallet', walletSchema);

