/**
 * product.routes.js
 *
 * Maps product catalog and inventory endpoints to product.controller.js.
 */

const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  bulkImport,
} = require('../controllers/product.controller.js');

const { protect, authorize } = require('../middlewares/auth.middleware.js');

// ─── Browsing Products (Authenticated Customers & Retailers) ──────────────────
// GET /api/v1/products - Fetch all products (with optional ?category= and ?search=)
router.get('/', protect, getProducts);

// GET /api/v1/products/:id - Fetch details of a single product
router.get('/:id', protect, getProductById);

// ─── Retailer Product Management (Restricted to 'retailer' role) ──────────────
// POST /api/v1/products - Create a new product listing
router.post('/', protect, authorize('retailer'), createProduct);

// PUT /api/v1/products/:id - Update an existing product
router.put('/:id', protect, authorize('retailer'), updateProduct);

// POST /api/v1/products/import - Bulk import products via JSON array
router.post('/import', protect, authorize('retailer'), bulkImport);

module.exports = router;
