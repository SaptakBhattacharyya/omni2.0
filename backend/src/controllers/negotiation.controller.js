/**
 * negotiation.controller.js
 *
 * WHAT IS THIS CONTROLLER?
 * ------------------------
 * Manages interactive price negotiations between customers and the OmniRetail AI assistant.
 *
 * HOW THE AI NEGOTIATION BOT WORKS:
 * 1. A customer starts a negotiation for a product with basePrice and secret minAcceptablePrice.
 * 2. If an active negotiation already exists for this user and product, we return that one.
 * 3. With each message, the user can propose a new price offer:
 *    - Rule A: If offer >= minAcceptablePrice -> Deal accepted immediately! An Order is created.
 *    - Rule B: If max rounds reached (roundsUsed >= roundsTotal) -> Bot presents final take-it-or-leave-it price.
 *    - Rule C: Otherwise -> Bot calculates a counter-offer midway between user offer & minAcceptablePrice.
 */

const Negotiation = require('../models/negotiation.model.js');
const Product = require('../models/product.model.js');
const Order = require('../models/order.model.js');

/**
 * Helper: Automatically creates a purchase order when a negotiation is accepted
 * @param {Object} negotiation
 * @returns {Promise<Object>} Created Order document
 */
const createOrderFromNegotiation = async (negotiation) => {
  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  return await Order.create({
    orderId,
    customer: negotiation.customerName,
    initials: negotiation.customerInitials,
    total: negotiation.currentOffer,
    status: 'Processing',
    items: [
      {
        name: negotiation.productName,
        qty: 1,
        price: negotiation.currentOffer,
      },
    ],
  });
};

/**
 * @desc    Start a new price negotiation session
 * @route   POST /api/v1/negotiations
 * @access  Private (Logged-in customer)
 */
exports.createNegotiation = async (req, res, next) => {
  try {
    // Step 1: Extract productId from request body
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Please provide a productId' });
    }

    // Step 2: Fetch the product from database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Step 3: Check if there's already an active negotiation for this user and product
    const existing = await Negotiation.findOne({
      productSku: product.sku,
      customerName: req.user.name,
      status: 'active',
    });

    if (existing) {
      // Return the ongoing session so the customer can resume chatting
      return res.json(existing);
    }

    // Step 4: Calculate fallback minAcceptablePrice (default: 80% of base price if not set)
    const floorPrice = product.minAcceptablePrice || Math.round(product.basePrice * 0.8);

    // Step 5: Compute customer initials (e.g. 'Jane Doe' -> 'JD')
    const customerInitials = req.user.name
      ? req.user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
      : 'U';

    // Step 6: Create the new negotiation record with initial bot greeting
    const negotiation = await Negotiation.create({
      productName: product.name,
      productImage: product.images?.[0]?.url,
      productSku: product.sku,
      basePrice: product.basePrice,
      minAcceptablePrice: floorPrice,
      currentOffer: product.basePrice,
      customerName: req.user.name,
      customerInitials,
      status: 'active',
      roundsTotal: 3,
      roundsUsed: 0,
      messages: [
        {
          sender: 'bot',
          content: `Hi ${req.user.name.split(' ')[0]}! I'm the OmniRetail AI assistant. I see you're interested in the ${product.name}. The base price is ₹${product.basePrice.toLocaleString('en-IN')}. What's your best offer?`,
          timestamp: new Date(),
        },
      ],
    });

    return res.status(201).json(negotiation);
  } catch (error) {
    console.error('[Create Negotiation Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating negotiation',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all active negotiations
 * @route   GET /api/v1/negotiations
 * @access  Private
 */
exports.getNegotiations = async (req, res, next) => {
  try {
    const negotiations = await Negotiation.find({ status: 'active' }).sort({ createdAt: -1 });
    return res.json(negotiations);
  } catch (error) {
    console.error('[Get Negotiations Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching negotiations' });
  }
};

/**
 * @desc    Get a single negotiation by its MongoDB ID
 * @route   GET /api/v1/negotiations/:id
 * @access  Private
 */
exports.getNegotiationById = async (req, res, next) => {
  try {
    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation session not found' });
    }
    return res.json(negotiation);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching negotiation' });
  }
};

/**
 * @desc    Send a message or propose a new offer in a negotiation
 * @route   POST /api/v1/negotiations/:id/message
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { content, offer } = req.body;

    // Step 1: Find the negotiation session
    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found' });
    }

    // Step 2: Ensure session is still active
    if (negotiation.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Negotiation is already ${negotiation.status}`,
      });
    }

    // Step 3: Append user's message and count the round
    negotiation.messages.push({ sender: 'user', content, offer });
    negotiation.roundsUsed += 1;
    if (offer) {
      negotiation.currentOffer = offer;
    }

    // Step 4: AI Decision Logic
    if (offer && offer >= negotiation.minAcceptablePrice) {
      // Deal ACCEPTED!
      negotiation.status = 'accepted';
      negotiation.messages.push({
        sender: 'bot',
        content: `Deal! I accept ₹${offer.toLocaleString('en-IN')}. Your order has been confirmed.`,
        offer,
      });

      // Automatically create the order in the database
      await createOrderFromNegotiation(negotiation);
    } else if (negotiation.roundsUsed >= negotiation.roundsTotal) {
      // Final round reached -> offer floor price
      const finalPrice = negotiation.minAcceptablePrice;
      negotiation.messages.push({
        sender: 'bot',
        content: `This is my absolute final offer: ₹${finalPrice.toLocaleString('en-IN')}. I cannot go any lower.`,
        offer: finalPrice,
      });
      negotiation.currentOffer = finalPrice;
    } else {
      // Counter-offer: calculate midpoint between user's bid and minimum acceptable price
      const counterOffer = offer
        ? Math.round((offer + negotiation.minAcceptablePrice) / 2)
        : negotiation.minAcceptablePrice;

      negotiation.messages.push({
        sender: 'bot',
        content: `That's a bit low for this item. How about ₹${counterOffer.toLocaleString('en-IN')}? (Round ${negotiation.roundsUsed}/${negotiation.roundsTotal})`,
        offer: counterOffer,
      });
      negotiation.currentOffer = counterOffer;
    }

    // Step 5: Save updated negotiation to database
    await negotiation.save();
    return res.json(negotiation);
  } catch (error) {
    console.error('[Send Message Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error while processing message' });
  }
};

/**
 * @desc    Manually accept the current price offer
 * @route   PUT /api/v1/negotiations/:id/accept
 * @access  Private
 */
exports.acceptNegotiation = async (req, res, next) => {
  try {
    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found' });
    }

    if (negotiation.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Negotiation is already accepted' });
    }

    negotiation.status = 'accepted';
    await negotiation.save();

    // Generate the order
    await createOrderFromNegotiation(negotiation);

    return res.json(negotiation);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while accepting negotiation' });
  }
};

/**
 * @desc    Reject / walk away from a negotiation
 * @route   PUT /api/v1/negotiations/:id/reject
 * @access  Private
 */
exports.rejectNegotiation = async (req, res, next) => {
  try {
    const negotiation = await Negotiation.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!negotiation) {
      return res.status(404).json({ success: false, message: 'Negotiation not found' });
    }

    return res.json(negotiation);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while rejecting negotiation' });
  }
};
