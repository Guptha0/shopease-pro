const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/tickets
// @desc    Open a new support ticket
// @access  User (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const { subject, category = 'General Inquiry', priority = 'Medium', orderId = '', message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ticket subject and description',
      });
    }

    const ticketId = 'TCK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const ticket = await Ticket.create({
      ticketId,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      subject,
      category,
      priority,
      status: 'Open',
      orderId,
      messages: [
        {
          sender: 'user',
          senderName: req.user.name,
          text: message,
          timestamp: new Date(),
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: `Support Ticket #${ticketId} created successfully. Our team will respond shortly.`,
      ticket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating support ticket',
    });
  }
});

// @route   GET /api/tickets/my-tickets
// @desc    Retrieve logged in user's support tickets
// @access  User (Protected)
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error('Fetch my-tickets error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tickets',
    });
  }
});

// @route   GET /api/tickets
// @desc    Admin: get all support tickets
// @access  Admin Only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('user', 'name email').sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error('Admin fetch tickets error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tickets',
    });
  }
});

// @route   PATCH /api/tickets/:id/resolve
// @desc    Admin: resolve ticket and append agent reply
// @access  Admin Only
router.patch('/:id/resolve', protect, adminOnly, async (req, res) => {
  try {
    const { replyText = 'Issue investigated and resolved by ShopEase Support Desk.' } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = 'Resolved';
    ticket.messages.push({
      sender: 'agent',
      senderName: req.user.name || 'ShopEase Support Lead',
      text: replyText,
      timestamp: new Date(),
    });

    await ticket.save();

    return res.json({
      success: true,
      message: `Ticket #${ticket.ticketId} marked as Resolved!`,
      ticket,
    });
  } catch (error) {
    console.error('Resolve ticket error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error resolving ticket',
    });
  }
});

// @route   POST /api/tickets/:id/messages
// @desc    Append message to an existing ticket
// @access  User / Admin
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const isAgent = req.user.role === 'admin';
    ticket.messages.push({
      sender: isAgent ? 'agent' : 'user',
      senderName: req.user.name,
      text,
      timestamp: new Date(),
    });

    if (isAgent && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    await ticket.save();

    return res.json({
      success: true,
      message: 'Message appended',
      ticket,
    });
  } catch (error) {
    console.error('Append ticket message error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error appending message',
    });
  }
});

module.exports = router;

