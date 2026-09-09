/**
 * product.controller.js
 *
 * WHAT IS THIS CONTROLLER?
 * ------------------------
 * Manages product inventory and catalog items in OmniRetail:
 *   1. getProducts    → Fetches products with category and name search filtering.
 *   2. getProductById → Fetches details of a single product.
 *   3. createProduct  → Retailer creates a single new product.
 *   4. updateProduct  → Retailer updates an existing product.
 *   5. bulkImport     → Batch import multiple products simultaneously.
 */

const Product = require('../models/product.model.js');

/**
 * @desc    Get all products (with optional category and search filters)
 * @route   GET /api/v1/products
 * @access  Private
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    // Build filter criteria
    const query = {};
    if (category) {
      query.storeCategory = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    console.error('[Get Products Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching products' });
  }
};

/**
 * @desc    Get a single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Private
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching product' });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private (Retailer only)
 */
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/v1/products/:id
 * @access  Private (Retailer only)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Bulk import an array of products
 * @route   POST /api/v1/products/import
 * @access  Private (Retailer only)
 */
exports.bulkImport = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format: Expected a non-empty array of products.',
      });
    }

    // ordered: false allows valid documents to be inserted even if some fail due to duplicate SKU
    const result = await Product.insertMany(products, { ordered: false });

    return res.status(201).json({
      success: true,
      message: `${result.length} products imported successfully`,
      count: result.length,
    });
  } catch (error) {
    // If some documents succeeded but others failed (e.g., duplicate SKU)
    if (error.insertedDocs && error.insertedDocs.length > 0) {
      return res.status(207).json({
        success: true,
        message: 'Partial import completed',
        count: error.insertedDocs.length,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Bulk import failed',
      error: error.message,
    });
  }
};
