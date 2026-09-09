/**
 * store.model.js
 *
 * WHAT IS THIS MODEL?
 * -------------------
 * This Mongoose model represents a Physical Brick-and-Mortar Store location.
 *
 * GEOSPATIAL QUERIES:
 * It utilizes MongoDB's GeoJSON Point schema and a `2dsphere` index so users can
 * search for stores near their current GPS coordinates ($near / $geometry queries).
 */

const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    // Physical store name (e.g. 'OmniRetail Downtown')
    name: {
      type: String,
      required: [true, 'Please provide store name'],
      trim: true,
    },
    // Street address
    address: {
      type: String,
      required: [true, 'Please provide street address'],
      trim: true,
    },
    // City name
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    // Contact phone number
    phone: {
      type: String,
      trim: true,
    },
    // GeoJSON Point for geospatial proximity queries
    // NOTE: GeoJSON requires coordinates ordered as: [longitude, latitude]!
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    // Operating hours
    openingHours: {
      type: String,
      default: '9:00 AM - 10:00 PM',
    },
    // Identifies if this is the primary flagship store
    isMainBranch: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Create 2dsphere index on location field to support $near / geoNear queries
storeSchema.index({ location: '2dsphere' });

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
