const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const priceHistorySchema = new mongoose.Schema({
  date: { type: String, required: true },
  price: { type: Number, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide product brand'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    mrp: {
      type: Number,
      required: [true, 'Please provide Maximum Retail Price (MRP)'],
      min: [0, 'MRP cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide current sale price'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      default: 15,
      min: [0, 'Stock cannot be negative'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide product image URL'],
    },
    gallery: [{ type: String }],
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    priceHistory: [priceHistorySchema],
    isFlashDeal: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    badges: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
