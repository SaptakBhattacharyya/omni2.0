/**
 * customer.model.js
 *
 * WHAT IS THIS MODEL?
 * -------------------
 * This Mongoose model represents a Customer Profile in OmniRetail's CRM dashboard.
 * It stores customer purchase summaries, loyalty tiers ('Top', 'Active', 'Inactive'),
 * and reviews/feedback left by the customer.
 */

const mongoose = require('mongoose');

// Subdocument Schema for feedback/reviews left by the customer
const feedbackSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    time: {
      type: String, // Stored as human-readable string or date
    },
  },
  {
    timestamps: true,
  }
);

const customerSchema = new mongoose.Schema(
  {
    // Full name of the customer
    name: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true,
    },
    // Email address
    email: {
      type: String,
      required: [true, 'Please provide customer email'],
      lowercase: true,
      trim: true,
    },
    // Cumulative amount spent across all completed orders in INR ₹
    totalSpend: {
      type: Number,
      default: 0,
      min: [0, 'Total spend cannot be negative'],
    },
    // Customer tier/status
    status: {
      type: String,
      enum: ['Top', 'Active', 'Inactive'],
      default: 'Active',
    },
    // Optional avatar URL
    avatar: {
      type: String,
    },
    // Initials for avatar fallback (e.g. 'JD')
    initials: {
      type: String,
      trim: true,
    },
    // List of feedback and ratings submitted by this customer
    feedback: [feedbackSchema],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
