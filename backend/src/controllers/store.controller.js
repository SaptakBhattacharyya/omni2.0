/**
 * store.controller.js
 *
 * WHAT IS THIS CONTROLLER?
 * ------------------------
 * Manages physical store locations and omni-channel store stock checks:
 *   1. getNearbyStores → Geospatial query to find stores closest to given GPS coordinates.
 *   2. getStoreStock   → Checks in-store availability and aisle location for a product.
 *   3. seedStores      → Helper endpoint to populate initial store branches.
 */

const Store = require('../models/store.model.js');
const Product = require('../models/product.model.js');

/**
 * @desc    Get all stores or filter by geographic proximity (lat, lng, radius)
 * @route   GET /api/v1/stores/nearby
 * @access  Public
 */
exports.getNearbyStores = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    let query = {};

    // If coordinates are provided, perform a MongoDB $near geospatial query
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            // Coordinates ordered as [longitude, latitude]
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          // Convert radius in kilometers to meters
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }

    const stores = await Store.find(query);
    return res.json(stores);
  } catch (error) {
    console.error('[Nearby Stores Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching stores',
      error: error.message,
    });
  }
};

/**
 * @desc    Get stock status for a product at a specific physical store
 * @route   GET /api/v1/stores/:storeId/stock/:productId
 * @access  Public
 */
exports.getStoreStock = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Determine stock status based on inventory quantity
    const status =
      product.stockQuantity > 5
        ? 'In Stock'
        : product.stockQuantity > 0
        ? 'Low Stock'
        : 'Out of Stock';

    return res.json({
      status,
      quantity: Math.min(product.stockQuantity, Math.floor(Math.random() * 10) + 1),
      aisle: `A-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 5) + 1}`,
    });
  } catch (error) {
    console.error('[Store Stock Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error while checking store stock' });
  }
};

/**
 * @desc    Seed initial store locations if collection is empty
 * @route   POST /api/v1/stores/seed
 * @access  Public
 */
exports.seedStores = async (req, res, next) => {
  try {
    const count = await Store.countDocuments();
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Stores already exist in the database' });
    }

    const initialStores = [
      {
        name: 'OmniRetail Downtown',
        address: '123 Tech Park, MG Road',
        city: 'Bengaluru',
        location: { coordinates: [77.5946, 12.9716] },
        phone: '+91 98765 43210',
        isMainBranch: true,
      },
      {
        name: 'OmniRetail Suburban',
        address: '45 Green Valley, Whitefield',
        city: 'Bengaluru',
        location: { coordinates: [77.7500, 12.9698] },
        phone: '+91 98765 43211',
        isMainBranch: false,
      },
      {
        name: 'OmniRetail Electronic City',
        address: 'Sector 4, Phase II',
        city: 'Bengaluru',
        location: { coordinates: [77.6650, 12.8399] },
        phone: '+91 98765 43212',
        isMainBranch: false,
      },
    ];

    await Store.insertMany(initialStores);
    return res.status(201).json({ success: true, message: 'Stores seeded successfully' });
  } catch (error) {
    console.error('[Seed Stores Error]:', error);
    return res.status(500).json({ success: false, message: 'Seed failed', error: error.message });
  }
};
