const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'agent', 'system'],
    default: 'user',
  },
  senderName: { type: String },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      default: () => 'TCK-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String },
    userEmail: { type: String },
    subject: {
      type: String,
      required: [true, 'Please provide a ticket subject'],
    },
    category: {
      type: String,
      enum: [
        'Payment Issue',
        'Delivery Delayed',
        'Wrong / Damaged Item',
        'Return / Refund Query',
        'Account & Security',
        'General Inquiry',
      ],
      default: 'General Inquiry',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    orderId: { type: String, default: '' },
    messages: [ticketMessageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);

