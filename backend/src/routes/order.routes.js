/**
 * order.routes.js
 *
 * Maps order placement, tracking, and fulfillment endpoints to order.controller.js.
 */

const express = require('express');
const router = express.Router();

const {
  getOrders,
  getOrderStats,
  updateOrderStatus,
} = require('../controllers/order.controller.js');

const { protect } = require('../middlewares/auth.middleware.js');

// GET /api/v1/orders/stats - Fetch summary counts for dashboard
// IMPORTANT: /stats MUST precede /:id routes so Express doesn't treat 'stats' as an :id!
router.get('/stats', protect, getOrderStats);

// GET /api/v1/orders - Fetch all orders (with optional ?status= and ?search= filters)
router.get('/', protect, getOrders);

// PUT /api/v1/orders/:id/status - Update fulfillment status of an order
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
