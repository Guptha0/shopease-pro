const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Fetch products with multi-faceted search, filters, and sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      sort,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      flashDeals,
    } = req.query;

    const query = {};

    // Filter by Category
    if (category && category !== 'All' && category !== "Today's Flash Deals" && category !== 'Price-Drop Radar') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Flash Deals filter
    if (flashDeals === 'true' || category === "Today's Flash Deals") {
      query.isFlashDeal = true;
    }

    // Filter by Brand
    if (brand && brand !== 'All') {
      const brandsList = brand.split(',').map((b) => b.trim());
      query.brand = { $in: brandsList.map((b) => new RegExp(`^${b}$`, 'i')) };
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Minimum rating
    if (minRating !== undefined && Number(minRating) > 0) {
      query.rating = { $gte: Number(minRating) };
    }

    // Stock availability
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Search query across name, brand, description, category
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    let productsQuery = Product.find(query);

    // Sorting
    if (sort === 'price_asc') {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      productsQuery = productsQuery.sort({ price: -1 });
    } else if (sort === 'rating_desc') {
      productsQuery = productsQuery.sort({ rating: -1, numReviews: -1 });
    } else if (sort === 'biggest_drop' || category === 'Price-Drop Radar') {
      // Products with biggest MRP - price difference
      productsQuery = productsQuery.sort({ discountAmount: -1, createdAt: -1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery.exec();

    // Distinct brands and categories for dynamic filter pills/checkboxes
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');

    return res.json({
      success: true,
      count: products.length,
      categories,
      brands,
      products,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching products',
    });
  }
});

// @route   GET /api/products/:id
// @desc    Fetch single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Fetch product by ID error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching product',
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add a product review & recalculate rating
// @access  Protected (User)
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
    } else {
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      });
    }

    product.numReviews = product.reviews.length;
    product.rating = Number(
      (
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length
      ).toFixed(1)
    );

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      rating: product.rating,
      numReviews: product.numReviews,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error('Add review error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting review',
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Admin Only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      mrp,
      price,
      stock,
      imageUrl,
      gallery,
      specs,
      isFlashDeal,
      badges,
    } = req.body;

    if (!name || !brand || !category || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Generate mock 30-day price history
    const basePrice = Number(price);
    const history = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const fluctuation = (Math.sin(i / 3) * 0.08 + (Math.random() - 0.5) * 0.05);
      const histPrice = Math.round(basePrice * (1 + fluctuation));
      history.push({
        date: d.toISOString().split('T')[0],
        price: histPrice,
      });
    }

    const product = await Product.create({
      name,
      brand,
      category,
      description,
      mrp: mrp ? Number(mrp) : Math.round(Number(price) * 1.3),
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 15,
      imageUrl,
      gallery: gallery || [imageUrl],
      specs: specs || {},
      priceHistory: history,
      isFlashDeal: Boolean(isFlashDeal),
      badges: badges || ['Verified Quality', 'Lowest Price in 30 Days'],
      rating: 4.5,
      numReviews: 1,
      reviews: [
        {
          user: req.user._id,
          name: 'Verified Customer',
          rating: 5,
          comment: 'Excellent build quality and rapid delivery. Highly recommended!',
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Product published successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating product',
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update existing product
// @access  Admin Only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fields = [
      'name',
      'brand',
      'category',
      'description',
      'mrp',
      'price',
      'stock',
      'imageUrl',
      'isFlashDeal',
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        product[f] = req.body[f];
      }
    });

    if (req.body.specs) {
      product.specs = req.body.specs;
    }

    const updated = await product.save();
    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating product',
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Admin Only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: 'Product deleted from store',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting product',
    });
  }
});

module.exports = router;
