const express = require('express');
const router = express.Router();
const PayLater = require('../models/PayLater');
const Subscription = require('../models/Subscription');
const GiftCard = require('../models/GiftCard');
const SquadBuy = require('../models/SquadBuy');
const Wallet = require('../models/Wallet');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Helper to get or create PayLater account (Pre-approved ₹25,000 credit limit)
const getOrCreatePayLater = async (userId) => {
  let payLater = await PayLater.findOne({ user: userId });
  if (!payLater) {
    payLater = new PayLater({
      user: userId,
      creditLimit: 25000,
      availableCredit: 25000,
      usedCredit: 0,
      status: 'Active',
      dues: [],
    });
    await payLater.save();
  }
  return payLater;
};

// ==========================================
// 1. PAY LATER (BNPL) ROUTES
// ==========================================

// @route   GET /api/enterprise/paylater
// @desc    Fetch current user's BNPL credit account & dues
router.get('/paylater', protect, async (req, res) => {
  try {
    const payLater = await getOrCreatePayLater(req.user._id);
    return res.json({ success: true, payLater });
  } catch (err) {
    console.error('Fetch PayLater error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching PayLater' });
  }
});

// @route   POST /api/enterprise/paylater/pay
// @desc    Pay using BNPL credit line during checkout
router.post('/paylater/pay', protect, async (req, res) => {
  try {
    const { amount, orderId = 'ORD-NEW' } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const payLater = await getOrCreatePayLater(req.user._id);
    if (payLater.availableCredit < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient BNPL credit limit. Available: ₹${payLater.availableCredit.toLocaleString('en-IN')}`,
      });
    }

    payLater.availableCredit -= numAmount;
    payLater.usedCredit += numAmount;
    payLater.dues.unshift({
      id: 'DUE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      orderId,
      amount: numAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isPaid: false,
    });

    await payLater.save();
    return res.json({
      success: true,
      message: `₹${numAmount.toLocaleString('en-IN')} paid via ShopEase Pay Later! Repay in 30 days.`,
      payLater,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/enterprise/paylater/repay
// @desc    Repay PayLater dues
router.post('/paylater/repay', protect, async (req, res) => {
  try {
    const { dueId, amount } = req.body;
    const payLater = await getOrCreatePayLater(req.user._id);

    const repayAmt = Number(amount) || payLater.usedCredit;
    payLater.usedCredit = Math.max(0, payLater.usedCredit - repayAmt);
    payLater.availableCredit = Math.min(payLater.creditLimit, payLater.availableCredit + repayAmt);

    if (dueId) {
      const targetDue = payLater.dues.find((d) => d.id === dueId || d._id.toString() === dueId);
      if (targetDue) {
        targetDue.isPaid = true;
        targetDue.paidAt = new Date();
      }
    } else {
      payLater.dues.forEach((d) => {
        d.isPaid = true;
        d.paidAt = new Date();
      });
    }

    await payLater.save();
    return res.json({
      success: true,
      message: `₹${repayAmt.toLocaleString('en-IN')} dues successfully repaid! Credit limit restored.`,
      payLater,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. SUBSCRIBE & SAVE (10% OFF) ROUTES
// ==========================================

// @route   GET /api/enterprise/subscriptions
router.get('/subscriptions', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: subscriptions.length, subscriptions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/enterprise/subscriptions
router.post('/subscriptions', protect, async (req, res) => {
  try {
    const { productId, productName, intervalDays = 30, shippingAddress } = req.body;
    let product = null;
    if (productId) {
      product = await Product.findById(productId);
    }
    if (!product && productName) {
      product = await Product.findOne({ name: new RegExp(productName, 'i') });
    }
    if (!product) {
      product = await Product.findOne();
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'No products available for subscription' });
    }

    const discountedPrice = Math.round(product.price * 0.9); // 10% discount
    const nextDelivery = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

    const sub = await Subscription.create({
      user: req.user._id,
      product: product._id,
      productName: product.name,
      productPrice: product.price,
      discountedPrice,
      intervalDays,
      shippingAddress: shippingAddress || req.user.savedAddresses?.[0] || {},
      status: 'Active',
      nextDeliveryDate: nextDelivery,
      orderCount: 1,
    });

    return res.status(201).json({
      success: true,
      message: `Subscribed to ${product.name} with 10% discount! Scheduled every ${intervalDays} days.`,
      subscription: sub,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PATCH /api/enterprise/subscriptions/:id/status
router.patch('/subscriptions/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    sub.status = status;
    await sub.save();
    return res.json({ success: true, message: `Subscription is now ${status}`, subscription: sub });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. DIGITAL GIFT CARDS ROUTES
// ==========================================

// @route   GET /api/enterprise/giftcards/my-cards (and /api/enterprise/giftcards)
router.get(['/giftcards/my-cards', '/giftcards'], protect, async (req, res) => {
  try {
    const cards = await GiftCard.find({ sender: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: cards.length, giftCards: cards });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/enterprise/giftcards/purchase (and /api/enterprise/giftcards/create)
router.post(['/giftcards/purchase', '/giftcards/create'], protect, async (req, res) => {
  try {
    const { amount, theme = 'Tech Geek', recipientName, recipientEmail, personalMessage } = req.body;
    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid gift amount' });
    }

    const code = 'GFT-' + Math.floor(1000 + Math.random() * 9000) + '-' + theme.toUpperCase().replace(/\s+/g, '').slice(0, 4);

    const giftCard = await GiftCard.create({
      code,
      sender: req.user._id,
      senderName: req.user.name,
      recipientName: recipientName || 'Friend',
      recipientEmail: recipientEmail || '',
      amount: numAmt,
      theme,
      personalMessage: personalMessage || 'Enjoy shopping on ShopEase Pro!',
    });

    return res.status(201).json({
      success: true,
      message: `Gift card ${code} created successfully for ₹${numAmt.toLocaleString('en-IN')}!`,
      giftCard,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/enterprise/giftcards/redeem
// @desc    Redeem gift card and auto-credit to Virtual Wallet!
router.post('/giftcards/redeem', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide gift card code' });
    }

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });
    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Invalid gift card code' });
    }

    if (giftCard.isRedeemed) {
      return res.status(400).json({ success: false, message: 'This gift card has already been redeemed' });
    }

    if (new Date() > new Date(giftCard.expiryDate)) {
      return res.status(400).json({ success: false, message: 'This gift card has expired' });
    }

    // Credit recipient's wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = new Wallet({ user: req.user._id, balance: 0, rewardsCoins: 0, transactions: [] });
    }

    wallet.balance += giftCard.amount;
    wallet.transactions.unshift({
      id: 'TXN-' + Date.now().toString(36).toUpperCase(),
      type: 'CREDIT',
      amount: giftCard.amount,
      description: `Redeemed Gift Card (${giftCard.code}) from ${giftCard.senderName}`,
      referenceId: giftCard.code,
      createdAt: new Date(),
    });
    await wallet.save();

    giftCard.isRedeemed = true;
    giftCard.redeemedBy = req.user._id;
    giftCard.redeemedAt = new Date();
    await giftCard.save();

    return res.json({
      success: true,
      message: `₹${giftCard.amount.toLocaleString('en-IN')} credited to your ShopEase Virtual Wallet!`,
      wallet,
      giftCard,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. SQUAD BUY (GROUP PURCHASING) ROUTES
// ==========================================

// @route   POST /api/enterprise/squadbuy/create
router.post('/squadbuy/create', protect, async (req, res) => {
  try {
    const { productId, productName } = req.body;
    let product = null;
    if (productId) {
      product = await Product.findById(productId);
    }
    if (!product && productName) {
      product = await Product.findOne({ name: new RegExp(productName, 'i') });
    }
    if (!product) {
      product = await Product.findOne();
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const squadCode = 'SQD-' + Math.floor(1000 + Math.random() * 9000);
    const originalPrice = product.price;
    const squadPrice = Math.round(originalPrice * 0.85); // 15% Squad discount

    const squad = await SquadBuy.create({
      squadCode,
      product: product._id,
      productName: product.name,
      originalPrice,
      squadPrice,
      initiator: req.user._id,
      initiatorName: req.user.name,
      members: [
        {
          user: req.user._id,
          name: req.user.name,
          email: req.user.email,
          joinedAt: new Date(),
        },
      ],
      targetMembers: 2,
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: `Squad Buy #${squadCode} created! Invite 1 friend within 24 hours to save 15%.`,
      squad,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/enterprise/squadbuy/:code
router.get('/squadbuy/:code', async (req, res) => {
  try {
    const squad = await SquadBuy.findOne({ squadCode: req.params.code.toUpperCase() }).populate('product');
    if (!squad) {
      return res.status(404).json({ success: false, message: 'Squad Buy deal not found' });
    }
    return res.json({ success: true, squad });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/enterprise/squadbuy/:code/join
router.post('/squadbuy/:code/join', protect, async (req, res) => {
  try {
    const squad = await SquadBuy.findOne({ squadCode: req.params.code.toUpperCase() });
    if (!squad) {
      return res.status(404).json({ success: false, message: 'Squad deal not found' });
    }

    if (squad.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Squad group is already full & completed' });
    }

    squad.members.push({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      joinedAt: new Date(),
    });

    if (squad.members.length >= squad.targetMembers) {
      squad.status = 'Completed';
    }

    await squad.save();
    return res.json({
      success: true,
      message: `Joined Squad #${squad.squadCode}! 15% discount unlocked.`,
      squad,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. ABANDONED CART RADAR (ADMIN)
// ==========================================

const SAMPLE_ABANDONED_CARTS = [
  {
    id: 'ABN-1092',
    customerName: 'Kavita Nair',
    email: 'kavita.n@gmail.com',
    phone: '+91 98450 12345',
    abandonedItem: 'Apple iPhone 16 Pro Max 256GB',
    cartValue: 134900,
    timeAgo: '42 mins ago',
    nudgeSent: false,
  },
  {
    id: 'ABN-1093',
    customerName: 'Vikram Sethi',
    email: 'vikram.s@outlook.com',
    phone: '+91 99801 54321',
    abandonedItem: 'Sony WH-1000XM5 Wireless Headphones',
    cartValue: 26990,
    timeAgo: '1 hr 15 mins ago',
    nudgeSent: true,
  },
  {
    id: 'ABN-1094',
    customerName: 'Ananya Sharma',
    email: 'ananya.s@techcorp.in',
    phone: '+91 98765 43210',
    abandonedItem: 'Keychron Q1 Pro Mechanical Keyboard',
    cartValue: 16499,
    timeAgo: '2 hrs ago',
    nudgeSent: false,
  },
];

// @route   GET /api/enterprise/abandoned-carts
router.get('/abandoned-carts', protect, adminOnly, (req, res) => {
  return res.json({ success: true, abandonedCarts: SAMPLE_ABANDONED_CARTS });
});

// @route   POST /api/enterprise/abandoned-carts/nudge
router.post('/abandoned-carts/nudge', protect, adminOnly, (req, res) => {
  const { cartId } = req.body;
  const target = SAMPLE_ABANDONED_CARTS.find((c) => c.id === cartId);
  if (target) {
    target.nudgeSent = true;
  }
  return res.json({
    success: true,
    message: `Automated WhatsApp & SMS recovery alert with 5% promo voucher sent to ${target?.customerName || 'Customer'}!`,
  });
});

module.exports = router;
