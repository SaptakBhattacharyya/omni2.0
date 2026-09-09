/**
 * product.model.js
 *
 * WHAT IS THIS MODEL?
 * -------------------
 * This Mongoose model represents a Product in the OmniRetail catalog.
 *
 * KEY FIELDS:
 * - sku: Unique Stock Keeping Unit identifier (e.g. 'PROD001').
 * - basePrice: The regular listing price displayed to customers.
 * - minAcceptablePrice: The lowest secret floor price our AI chatbot will accept during negotiations.
 * - negotiationEnabled: Flag enabling dynamic AI price negotiation for this product.
 * - stockQuantity: Available physical inventory count.
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Unique barcode/SKU identifier
    sku: {
      type: String,
      required: [true, 'Please provide a product SKU'],
      unique: true,
      trim: true,
    },
    // Product title
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    // Detailed description of the product
    description: {
      type: String,
      trim: true,
    },
    // Default retail selling price (in INR ₹)
    basePrice: {
      type: Number,
      required: [true, 'Please provide a base price'],
      min: [0, 'Base price cannot be negative'],
    },
    // Minimum price floor the AI negotiation bot can accept
    minAcceptablePrice: {
      type: Number,
      min: [0, 'Minimum price cannot be negative'],
    },
    // Broad retail category (e.g. 'Electronics', 'Fashion', 'Grocery')
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    // Specific department or store category
    storeCategory: {
      type: String,
    },
    // When true, customers can negotiate the price with the AI assistant
    negotiationEnabled: {
      type: Boolean,
      default: false,
    },
    // High-level stock status
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    // Physical inventory quantity
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    // Indicates surplus stock that may qualify for promotional discounts
    isSurplus: {
      type: Boolean,
      default: false,
    },
    // Product gallery images
    images: [
      {
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    // Dynamic key-value pairs (e.g. { Brand: 'Sony', Color: 'Black' })
    specifications: {
      type: Map,
      of: String,
    },
    // Available variant options
    variants: {
      sizes: [String],
      colors: [String],
    },
  },
  {
    timestamps: true, // Automatically records createdAt and updatedAt
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
