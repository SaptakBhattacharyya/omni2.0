/**
 * dashboard.routes.js
 *
 * Maps retailer analytics dashboard endpoints to dashboard.controller.js.
 */

const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  factoryReset,
} = require('../controllers/dashboard.controller.js');

const { protect, authorize } = require('../middlewares/auth.middleware.js');

// GET /api/v1/dashboard/stats - Fetch overall business KPIs (acceptance rate, orders, active chats)
router.get('/stats', protect, authorize('retailer'), getDashboardStats);

// DELETE /api/v1/dashboard/factory-reset - Wipe all demo data (Retailer/Admin only)
router.delete('/factory-reset', protect, authorize('retailer'), factoryReset);

module.exports = router;
