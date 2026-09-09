/**
 * order.controller.js
 *
 * WHAT IS THIS CONTROLLER?
 * ------------------------
 * Manages customer Orders in the OmniRetail platform:
 *   1. getOrders         → Lists orders with optional filters (status, search by order ID).
 *   2. getOrderStats     → Calculates summary counts for retailer dashboard KPI cards.
 *   3. updateOrderStatus → Allows retailers to transition orders (e.g. Processing -> Shipped).
 */

const Order = require('../models/order.model.js');

/**
 * @desc    Get all orders (with optional status filter and orderId search)
 * @route   GET /api/v1/orders
 * @access  Private
 */
exports.getOrders = async (req, res, next) => {
  try {
    // Step 1: Read query params from URL
    const { status, search } = req.query;

    // Step 2: Build MongoDB query filter
    const query = {};
    if (status && status !== 'All Statuses') {
      query.status = status;
    }
    if (search) {
      query.orderId = { $regex: search, $options: 'i' };
    }

    // Step 3: Fetch orders sorted newest first
    const orders = await Order.find(query).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    console.error('[Get Orders Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
};

/**
 * @desc    Get order status counts for dashboard metrics
 * @route   GET /api/v1/orders/stats
 * @access  Private
 */
exports.getOrderStats = async (req, res, next) => {
  try {
    // Count orders across different lifecycle states
    const newOrders = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'Processing' });
    const returned = await Order.countDocuments({ status: 'Cancelled' });

    return res.json({
      newOrders,
      pending,
      returned,
    });
  } catch (error) {
    console.error('[Order Stats Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error while calculating order stats' });
  }
};

/**
 * @desc    Update the fulfillment status of an order
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide a new order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
