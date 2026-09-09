/**
 * negotiation.model.js
 *
 * WHAT IS THIS MODEL?
 * -------------------
 * This Mongoose model records an interactive AI-driven price negotiation session
 * between a customer and the OmniRetail AI assistant.
 *
 * HOW IT WORKS:
 * - A customer proposes an offer below the listing price.
 * - The session tracks up to `roundsTotal` (default: 3) rounds of back-and-forth offers.
 * - If an offer meets or exceeds `minAcceptablePrice`, the negotiation is marked 'accepted'
 *   and an Order is automatically generated in the database.
 */

const mongoose = require('mongoose');

// Subdocument Schema for individual chat messages in the negotiation session
const messageSchema = new mongoose.Schema({
  // Who sent this message: the AI bot or the human user
  sender: {
    type: String,
    enum: ['bot', 'user'],
    required: true,
  },
  // Text message content
  content: {
    type: String,
    required: true,
  },
  // Optional price bid associated with this message
  offer: {
    type: Number,
  },
  // Time this message was created
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const negotiationSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
    },
    productSku: {
      type: String,
    },
    basePrice: {
      type: Number,
    },
    minAcceptablePrice: {
      type: Number,
    },
    currentOffer: {
      type: Number,
    },
    customerName: {
      type: String,
    },
    customerInitials: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'accepted', 'rejected', 'expired'],
      default: 'active',
    },
    // Complete chat history between customer and bot
    messages: [messageSchema],
    // Total rounds allowed for counter-offers before final offer
    roundsTotal: {
      type: Number,
      default: 3,
    },
    // Number of rounds used so far
    roundsUsed: {
      type: Number,
      default: 0,
    },
    // Optional expiry timestamp for limited-time offers
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Negotiation = mongoose.model('Negotiation', negotiationSchema);

module.exports = Negotiation;
