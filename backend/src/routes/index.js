/**
 * routes/index.js
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is the Central Routing Hub (the master table of contents) for our entire API.
 * Instead of cluttering `app.js` with individual route imports, this file aggregates
 * all feature routes together and exports a single master router.
 *
 * All routes mounted here will be accessible under the `/api/v1` and `/v1` prefixes.
 */

const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./user.routes.js');
const productRoutes = require('./product.routes.js');
const orderRoutes = require('./order.routes.js');
const negotiationRoutes = require('./negotiation.routes.js');
const customerRoutes = require('./customer.routes.js');
const storeRoutes = require('./store.routes.js');
const dashboardRoutes = require('./dashboard.routes.js');

const router = express.Router();

/**
 * Health Check Endpoint
 * GET /api/v1/health (and /v1/health)
 * Used by monitoring tools, load balancers, and developers to verify server status.
 */
router.get('/health', (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;

  res.status(200).json({
    status: 'success',
    message: 'SPY_HEALTH_CHECK_OK',
    serverTime: new Date().toISOString(),
    database: isDbReady ? 'connected' : 'disconnected',
  });
});

// ─── Mount Resource Routers ──────────────────────────────────────────────────
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/negotiations', negotiationRoutes);
router.use('/customers', customerRoutes);
router.use('/stores', storeRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
