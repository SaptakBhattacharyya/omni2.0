/**
 * dashboard.controller.js
 *
 * WHAT IS THIS CONTROLLER?
 * ------------------------
 * Supplies aggregate KPI metrics for the Retailer Analytics Dashboard:
 *   1. getDashboardStats → Calculates acceptance rates, total orders, customers,
 *                          offers, and lists recent active negotiations.
 *   2. factoryReset      → Danger zone: Wipes all demo records for clean testing.
 */

const Order = require('../models/order.model.js');
const Customer = require('../models/customer.model.js');
const Negotiation = require('../models/negotiation.model.js');
const Product = require('../models/product.model.js');

/**
 * @desc    Get dashboard KPI analytics
 * @route   GET /api/v1/dashboard/stats
 * @access  Private (Retailer only)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Step 1: Query negotiation metrics
    const totalNegotiations = await Negotiation.countDocuments();
    const acceptedNegotiations = await Negotiation.countDocuments({ status: 'accepted' });
    const rejectedNegotiations = await Negotiation.countDocuments({ status: 'rejected' });

    // Step 2: Calculate offer acceptance rate percentage
    const acceptanceRate =
      totalNegotiations > 0
        ? parseFloat(((acceptedNegotiations / totalNegotiations) * 100).toFixed(1))
        : 0;

    // Step 3: Count total orders and customers
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // Step 4: Fetch the 6 most recent active negotiations
    const activeNegotiations = await Negotiation.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(6);

    // Step 5: Send aggregate stats payload
    return res.json({
      totalOffers: totalNegotiations,
      acceptanceRate,
      wastedTripsAvoided: rejectedNegotiations,
      totalOrders,
      totalCustomers,
      activeNegotiations,
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Factory Reset (Clears orders, customers, negotiations, and products)
 * @route   DELETE /api/v1/dashboard/factory-reset
 * @access  Private (Retailer only)
 */
exports.factoryReset = async (req, res, next) => {
  try {
    // Step 1: Extra role check (also enforced by authorize middleware)
    if (req.user.role !== 'retailer') {
      return res.status(403).json({ success: false, message: 'Access denied: Only retailers can reset data' });
    }

    // Step 2: Concurrently delete collections using Promise.all
    await Promise.all([
      Order.deleteMany({}),
      Customer.deleteMany({}),
      Negotiation.deleteMany({}),
      Product.deleteMany({}),
    ]);

    return res.json({
      success: true,
      message: 'All data has been cleared successfully',
    });
  } catch (error) {
    console.error('[Factory Reset Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset database data' });
  }
};
