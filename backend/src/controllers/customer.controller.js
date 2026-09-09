/**
 * customer.controller.js
 *
 * WHAT IS THIS CONTROLLER?
 * ------------------------
 * Manages customer data for the retailer dashboard CRM.
 * It provides:
 *   1. getCustomers     → Returns customer list with optional search filter.
 *   2. getCustomerStats → Computes CRM metrics: total customers, active customers,
 *                         and average lifetime customer spending.
 */

const Customer = require('../models/customer.model.js');

/**
 * @desc    Get all customers (with optional name search query)
 * @route   GET /api/v1/customers
 * @access  Private (Retailer only)
 */
exports.getCustomers = async (req, res, next) => {
  try {
    // Step 1: Read optional ?search= query parameter from URL
    const { search } = req.query;

    // Step 2: Build MongoDB query filter
    const query = {};
    if (search) {
      // Case-insensitive regex match on customer name
      query.name = { $regex: search, $options: 'i' };
    }

    // Step 3: Query Customer model and sort by highest total spend first
    const customers = await Customer.find(query).sort({ totalSpend: -1 });

    // Step 4: Send the customer list
    return res.json(customers);
  } catch (error) {
    console.error('[Customer Controller Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching customers' });
  }
};

/**
 * @desc    Get customer analytics & aggregate statistics
 * @route   GET /api/v1/customers/stats
 * @access  Private (Retailer only)
 */
exports.getCustomerStats = async (req, res, next) => {
  try {
    // Step 1: Count total customer records
    const total = await Customer.countDocuments();

    // Step 2: Count customers whose status is 'Active' or 'Top'
    const activeToday = await Customer.countDocuments({
      status: { $in: ['Active', 'Top'] },
    });

    // Step 3: Calculate average customer lifetime spend
    const allCustomers = await Customer.find().select('totalSpend');
    const avgLifetimeValue =
      allCustomers.length > 0
        ? Math.round(allCustomers.reduce((sum, c) => sum + (c.totalSpend || 0), 0) / allCustomers.length)
        : 0;

    // Step 4: Return calculated statistics
    return res.json({
      total,
      activeToday,
      avgLifetimeValue,
    });
  } catch (error) {
    console.error('[Customer Stats Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error while calculating customer statistics' });
  }
};
