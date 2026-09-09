/**
 * customer.routes.js
 *
 * Maps customer management endpoints to customer.controller.js.
 * All customer endpoints are protected and restricted to retailers.
 */

const express = require('express');
const router = express.Router();

const {
  getCustomers,
  getCustomerStats,
} = require('../controllers/customer.controller.js');

const { protect, authorize } = require('../middlewares/auth.middleware.js');

// GET /api/v1/customers/stats - Fetch aggregated customer lifetime & active metrics
// NOTE: /stats MUST be defined before /:id style dynamic routes to prevent route collisions
router.get('/stats', protect, authorize('retailer'), getCustomerStats);

// GET /api/v1/customers - Fetch list of all customers (with optional ?search= filter)
router.get('/', protect, authorize('retailer'), getCustomers);

module.exports = router;
