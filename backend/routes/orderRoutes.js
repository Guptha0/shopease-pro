const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Helper to generate tracking number
const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRK-${code}`;
};

// @route   POST /api/orders
// @desc    Place a new order, auto-assign 5-stage timeline, decrement stock
// @access  User (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      deliverySpeed,
      paymentMethod,
      mrpTotal,
      discountAmount,
      couponCode,
      platformFee,
      deliveryCharge,
      taxAmount,
      totalAmount,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Complete delivery address is required' });
    }

    // Verify and decrement stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product '${item.name}' not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}`,
        });
      }
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Tracking number
    let trackingNumber = generateTrackingNumber();
    while (await Order.findOne({ trackingNumber })) {
      trackingNumber = generateTrackingNumber();
    }

    // Initial timeline
    const now = new Date();
    const timeline = [
      {
        status: 'Order Placed',
        location: `${shippingAddress.city || 'Bengaluru'} Online Portal`,
        timestamp: now,
        description: 'Order confirmed and payment verified successfully.',
      },
      {
        status: 'Packed at Bengaluru Fulfillment Hub',
        location: 'Bengaluru Sort Center, KA 560060',
        timestamp: new Date(now.getTime() + 1000 * 60 * 30),
        description: 'Quality check verified and packaged with tamper-evident seal.',
      },
    ];

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      deliverySpeed: deliverySpeed || 'Standard',
      paymentMethod: paymentMethod || 'UPI',
      mrpTotal: mrpTotal || totalAmount,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || '',
      platformFee: platformFee || 5,
      deliveryCharge: deliveryCharge || 0,
      taxAmount: taxAmount || 0,
      totalAmount: Number(totalAmount),
      orderStatus: 'Order Placed',
      trackingNumber,
      courierPartner: deliverySpeed === 'Prime Same-Day Express' ? 'BlueDart Prime' : 'BlueDart Express',
      timeline,
    });

    const populated = await Order.findById(order._id).populate('user', 'name email');
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populated,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating order',
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Fetch user's orders sorted newest first
// @access  User (Protected)
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Fetch my-orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
});

// @route   GET /api/orders/admin/stats
// @desc    Admin KPI summary metrics (GMV, orders count, inventory, conversions)
// @access  Admin Only
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });

    const revAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalGMV: { $sum: '$totalAmount' } } },
    ]);
    const totalGMV = revAgg.length > 0 ? revAgg[0].totalGMV : 0;

    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    return res.json({
      success: true,
      stats: {
        totalRevenue: totalGMV,
        totalOrders,
        totalProducts,
        lowStockCount,
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
});

// @route   GET /api/orders
// @desc    Admin: get all store orders
// @access  Admin Only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Fetch all orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching all orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Single order tracking info
// @access  User / Admin
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Fetch order error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching order' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Admin: update status ('Order Placed' -> 'Packed' -> 'Shipped' -> 'Out for Delivery' -> 'Delivered' / 'Cancelled')
// @access  Admin Only
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, locationNote } = req.body;
    const allowed = [
      'Order Placed',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Restock if cancelled
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderStatus = status;

    // Append new milestone to timeline
    const locationMap = {
      Packed: 'Bengaluru Sort Center, KA',
      Shipped: 'In-Transit via Air Freight Hub',
      'Out for Delivery': `Local Delivery Station (${order.shippingAddress.city})`,
      Delivered: `${order.shippingAddress.city} Doorstep`,
      Cancelled: 'Order Processing Center',
    };

    order.timeline.push({
      status,
      location: locationNote || locationMap[status] || 'Fulfillment Hub',
      timestamp: new Date(),
      description: `Order milestone transitioned to ${status}`,
    });

    const updated = await order.save();
    const populated = await Order.findById(updated._id).populate('user', 'name email');

    return res.json({
      success: true,
      message: `Status updated to '${status}'`,
      order: populated,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

module.exports = router;
