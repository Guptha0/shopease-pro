const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

// Helper to ensure user has a wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = new Wallet({
      user: userId,
      balance: 0,
      rewardsCoins: 0,
      transactions: [
        {
          id: 'TXN-INIT-01',
          type: 'CREDIT',
          amount: 0,
          description: 'ShopEase Pro FinTech Wallet Activated',
          referenceId: 'WALLET-ACTIVE',
          createdAt: new Date(),
        },
      ],
    });
    await wallet.save();
  }
  return wallet;
};

// @route   GET /api/wallet
// @desc    Fetch current user's balance, coin points, and full transaction history
// @access  User (Protected)
router.get('/', protect, async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id);

    // Sort transactions newest first
    wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      wallet: {
        _id: wallet._id,
        user: wallet.user,
        balance: wallet.balance,
        rewardsCoins: wallet.rewardsCoins,
        transactions: wallet.transactions,
      },
    });
  } catch (error) {
    console.error('Fetch wallet error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching wallet',
    });
  }
});

// @route   POST /api/wallet/add-money
// @desc    Simulate adding money via UPI/Card (updates balance & logs transaction)
// @access  User (Protected)
router.post('/add-money', protect, async (req, res) => {
  try {
    const { amount, paymentMethod = 'UPI', upiId = 'user@okaxis' } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid top-up amount greater than zero',
      });
    }

    const wallet = await getOrCreateWallet(req.user._id);
    wallet.balance += numAmount;

    const refId = 'UPI-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const desc = paymentMethod === 'UPI'
      ? `Money Loaded via UPI (${upiId})`
      : `Money Loaded via ${paymentMethod}`;

    wallet.logTransaction({
      type: 'CREDIT',
      amount: numAmount,
      description: desc,
      referenceId: refId,
    });

    await wallet.save();

    return res.json({
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN')} added successfully to your ShopEase Wallet!`,
      wallet: {
        _id: wallet._id,
        balance: wallet.balance,
        rewardsCoins: wallet.rewardsCoins,
        transactions: wallet.transactions,
      },
    });
  } catch (error) {
    console.error('Add money error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding money to wallet',
    });
  }
});

// @route   POST /api/wallet/pay
// @desc    Deduct balance securely during checkout with instant balance verification
// @access  User (Protected)
router.post('/pay', protect, async (req, res) => {
  try {
    const { amount, orderId = '', description = '' } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount',
      });
    }

    const wallet = await getOrCreateWallet(req.user._id);

    if (wallet.balance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Available: ₹${wallet.balance.toLocaleString('en-IN')}, Required: ₹${numAmount.toLocaleString('en-IN')}`,
        availableBalance: wallet.balance,
        shortfall: numAmount - wallet.balance,
      });
    }

    wallet.balance -= numAmount;

    const refId = 'ORD-' + (orderId || Math.random().toString(36).substring(2, 9).toUpperCase());
    wallet.logTransaction({
      type: 'DEBIT',
      amount: numAmount,
      description: description || `Payment for ShopEase Order #${orderId || 'NEW'}`,
      referenceId: refId,
    });

    await wallet.save();

    return res.json({
      success: true,
      message: `Payment of ₹${numAmount.toLocaleString('en-IN')} debited successfully from ShopEase Wallet`,
      wallet: {
        _id: wallet._id,
        balance: wallet.balance,
        rewardsCoins: wallet.rewardsCoins,
        transactions: wallet.transactions,
      },
    });
  } catch (error) {
    console.error('Wallet payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error processing wallet payment',
    });
  }
});

// @route   POST /api/wallet/referral
// @desc    Simulate/claim referral reward of ₹100
// @access  User (Protected)
router.post('/referral', protect, async (req, res) => {
  try {
    const { referralCode = 'FRIEND-REF' } = req.body;
    const wallet = await getOrCreateWallet(req.user._id);

    const bonus = 100;
    wallet.balance += bonus;

    wallet.logTransaction({
      type: 'CREDIT',
      amount: bonus,
      description: `Referral Reward: Friend joined via ${referralCode}`,
      referenceId: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    });

    await wallet.save();

    return res.json({
      success: true,
      message: '₹100 Referral Cash successfully credited to your wallet!',
      wallet: {
        _id: wallet._id,
        balance: wallet.balance,
        rewardsCoins: wallet.rewardsCoins,
        transactions: wallet.transactions,
      },
    });
  } catch (error) {
    console.error('Referral claim error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error claiming referral bonus',
    });
  }
});

// @route   POST /api/wallet/claim-price-drop
// @desc    Claim 7-day price drop protection refund
// @access  User (Protected)
router.post('/claim-price-drop', protect, async (req, res) => {
  try {
    const { productName = 'Eligible Item', dropAmount = 500, orderTracking = 'TRK-RECENT' } = req.body;
    const numDrop = Number(dropAmount) || 500;
    const wallet = await getOrCreateWallet(req.user._id);

    wallet.balance += numDrop;

    wallet.logTransaction({
      type: 'CREDIT',
      amount: numDrop,
      description: `7-Day Price-Drop Protection Guarantee Refund: ${productName}`,
      referenceId: 'DROP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    });

    await wallet.save();

    return res.json({
      success: true,
      message: `₹${numDrop.toLocaleString('en-IN')} Price-Drop Protection refund automatically credited to your wallet!`,
      wallet: {
        _id: wallet._id,
        balance: wallet.balance,
        rewardsCoins: wallet.rewardsCoins,
        transactions: wallet.transactions,
      },
    });
  } catch (error) {
    console.error('Price-drop claim error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error claiming price drop guarantee',
    });
  }
});

module.exports = router;

