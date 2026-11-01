const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/returns
// @desc    Submit a return / replacement request
// @access  User (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderId,
      items,
      reason,
      resolution = 'Instant Wallet Refund',
      imageUrl,
      refundAmount,
      pickupAddress,
    } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and return reason are required',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    const returnId = 'RET-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date();
    const pickupDate = new Date(now.getTime() + 86400000 * 2);

    const timeline = [
      {
        status: 'Return Requested',
        timestamp: now,
        description: `Customer initiated return for ${resolution}. Reason: ${reason}.`,
      },
      {
        status: 'Pickup Scheduled',
        timestamp: new Date(now.getTime() + 1000 * 60 * 30),
        description: `Doorstep pickup assigned to BlueDart Express for ${pickupDate.toLocaleDateString('en-IN')}.`,
      },
    ];

    const returnRequest = await Return.create({
      returnId,
      order: order._id,
      orderTracking: order.trackingNumber,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      items: items && items.length > 0 ? items : order.items,
      reason,
      resolution,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
      refundAmount: Number(refundAmount) || order.totalAmount,
      pickupDate,
      pickupAddress: pickupAddress || order.shippingAddress,
      status: 'Return Requested',
      timeline,
    });

    return res.status(201).json({
      success: true,
      message: `Return #${returnId} generated. Doorstep pickup scheduled!`,
      returnRequest,
    });
  } catch (error) {
    console.error('Create return error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating return request',
    });
  }
});

// @route   GET /api/returns/my-returns
// @desc    Fetch logged in user's returns
// @access  User (Protected)
router.get('/my-returns', protect, async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id })
      .populate('order', 'trackingNumber deliverySpeed totalAmount')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error) {
    console.error('Fetch my-returns error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching return requests',
    });
  }
});

// @route   GET /api/returns
// @desc    Admin: get all return requests
// @access  Admin Only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('user', 'name email')
      .populate('order', 'trackingNumber totalAmount createdAt')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error) {
    console.error('Admin fetch returns error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching returns',
    });
  }
});

// @route   PATCH /api/returns/:id/approve
// @desc    Admin: approve refund and auto-credit wallet balance
// @access  Admin Only
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    if (returnRequest.status === 'Refund Approved') {
      return res.status(400).json({ success: false, message: 'Refund has already been approved and credited' });
    }

    returnRequest.status = 'Refund Approved';
    returnRequest.timeline.push({
      status: 'Refund Approved',
      timestamp: new Date(),
      description: `Quality inspection passed. ₹${returnRequest.refundAmount.toLocaleString('en-IN')} instantly credited to customer wallet.`,
    });

    await returnRequest.save();

    // Auto-credit refund to user's wallet
    let wallet = await Wallet.findOne({ user: returnRequest.user });
    if (!wallet) {
      wallet = new Wallet({
        user: returnRequest.user,
        balance: 0,
        rewardsCoins: 0,
      });
    }

    wallet.balance += returnRequest.refundAmount;
    wallet.logTransaction({
      type: 'CREDIT',
      amount: returnRequest.refundAmount,
      description: `Instant Refund for Return #${returnRequest.returnId} (${returnRequest.orderTracking})`,
      referenceId: `REFUND-${returnRequest.returnId}`,
    });

    await wallet.save();

    return res.json({
      success: true,
      message: `Refund of ₹${returnRequest.refundAmount.toLocaleString('en-IN')} approved and credited to customer wallet!`,
      returnRequest,
      walletBalance: wallet.balance,
    });
  } catch (error) {
    console.error('Approve return error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error approving refund',
    });
  }
});

// @route   PATCH /api/returns/:id/status
// @desc    Admin: update return status
// @access  Admin Only
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const returnRequest = await Return.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    returnRequest.status = status;
    returnRequest.timeline.push({
      status,
      timestamp: new Date(),
      description: note || `Return milestone transitioned to ${status}.`,
    });

    await returnRequest.save();

    return res.json({
      success: true,
      message: `Return status updated to ${status}`,
      returnRequest,
    });
  } catch (error) {
    console.error('Update return status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating return status',
    });
  }
});

module.exports = router;

