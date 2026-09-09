/**
 * store.routes.js
 *
 * Maps physical store branch endpoints to store.controller.js.
 */

const express = require('express');
const router = express.Router();

const {
  getNearbyStores,
  getStoreStock,
  seedStores,
} = require('../controllers/store.controller.js');

// GET /api/v1/stores/nearby - Find stores near GPS coordinates (?lat=..&lng=..&radius=..)
router.get('/nearby', getNearbyStores);

// GET /api/v1/stores/:storeId/stock/:productId - Check stock availability at a specific branch
router.get('/:storeId/stock/:productId', getStoreStock);

// POST /api/v1/stores/seed - Populate initial store branch data if empty
router.post('/seed', seedStores);

module.exports = router;
