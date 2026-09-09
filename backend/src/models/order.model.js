/**
 * order.model.js
 *
 * WHAT IS THIS MODEL?
 * -------------------
 * This Mongoose model represents a customer Purchase Order in the OmniRetail system.
 * Orders can be created either directly through standard checkout or automatically
 * when a price negotiation is successfully concluded between a customer and the AI bot.
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Item price cannot be negative'],
  },
});

const orderSchema = new mongoose.Schema(
  {
    // Unique human-readable Order Identifier (e.g. 'ORD-12345')
    orderId: {
      type: String,
      required: [true, 'Please provide an order ID'],
      unique: true,
      trim: true,
    },
    // Customer's full name
    customer: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true,
    },
    // Customer initials for display in the UI avatar (e.g. 'JD')
    initials: {
      type: String,
      trim: true,
    },
    // Total order amount in INR ₹
    total: {
      type: Number,
      required: [true, 'Please provide the total order amount'],
      min: [0, 'Order total cannot be negative'],
    },
    // Current shipment / fulfillment status
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    // List of ordered items (embedded subdocuments)
    items: [orderItemSchema],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
