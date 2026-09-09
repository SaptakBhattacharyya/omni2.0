/**
 * negotiation.routes.js
 *
 * Maps AI price negotiation endpoints to negotiation.controller.js.
 * All negotiation routes require an authenticated user (`protect`).
 */

const express = require('express');
const router = express.Router();

const {
  getNegotiations,
  getNegotiationById,
  sendMessage,
  acceptNegotiation,
  rejectNegotiation,
  createNegotiation,
} = require('../controllers/negotiation.controller.js');

const { protect } = require('../middlewares/auth.middleware.js');

// GET /api/v1/negotiations - Fetch all active negotiations
router.get('/', protect, getNegotiations);

// POST /api/v1/negotiations - Start a new negotiation session for a product
router.post('/', protect, createNegotiation);

// GET /api/v1/negotiations/:id - Retrieve a specific negotiation by ID
router.get('/:id', protect, getNegotiationById);

// POST /api/v1/negotiations/:id/message - Send a message or counter-offer to the AI bot
router.post('/:id/message', protect, sendMessage);

// PUT /api/v1/negotiations/:id/accept - Accept the current offer and place order
router.put('/:id/accept', protect, acceptNegotiation);

// PUT /api/v1/negotiations/:id/reject - Reject the negotiation and close session
router.put('/:id/reject', protect, rejectNegotiation);

module.exports = router;
