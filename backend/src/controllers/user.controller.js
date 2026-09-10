/**
 * user.controller.js
 *
 * WHAT IS A CONTROLLER IN MVC?
 * ----------------------------
 * The "Controller" is the C in MVC. It acts as the coordinator / middleman between
 * the Routes and the Models:
 *   1. It receives the incoming HTTP request (`req`).
 *   2. Extracts the data from `req.body`, `req.params`, or `req.query`.
 *   3. Calls the Mongoose User model to query or mutate the database.
 *   4. Sends back the appropriate HTTP status and JSON response (`res`).
 */

const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/user.model.js');
const generateToken = require('../utils/generateToken.js');

/**
 * @desc    Register a new user (Customer or Retailer)
 * @route   POST /api/v1/users/register
 * @access  Public
 */
exports.registerUser = async (req, res, next) => {
  try {
    // Step 1: Extract registration details from request body
    const { name, email, password, role, retailerCategory } = req.body;

    // Step 2: Basic validation checks
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Step 3: Check if a user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Step 4: Ensure retailerCategory is provided if role is 'retailer'
    if (role === 'retailer' && !retailerCategory) {
      return res.status(400).json({
        success: false,
        message: 'Retailers must specify a store category',
      });
    }

    // Step 5: Create and save the new user (password is automatically hashed by user.model.js pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      retailerCategory: role === 'retailer' ? retailerCategory : undefined,
    });

    // Step 6: Respond with user details and a freshly generated JWT token
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      retailerCategory: user.retailerCategory,
      token: generateToken(user._id),
    });
  } catch (error) {
    // Pass validation or server errors to next middleware or return clean status
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/v1/users/login
 * @access  Public
 */
exports.loginUser = async (req, res, next) => {
  try {
    // Step 1: Extract email and password from request body
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Step 2: Find user by email and explicitly include password field (which is select: false by default)
    const user = await User.findOne({ email }).select('+password');

    // Step 3: Verify user exists and check if password matches hashed password
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        retailerCategory: user.retailerCategory,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/profile
 * @access  Private (Logged-in users)
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    // Step 1: `req.user` is automatically attached by our `protect` auth middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Step 2: Return sanitized profile data
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      retailerCategory: user.retailerCategory,
      apiKeyCreatedAt: user.apiKeyCreatedAt,
      hasApiKey: !!user.apiKey,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private (Logged-in users)
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields if provided in request
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password; // Mongoose pre-save hook will hash this!
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      retailerCategory: updatedUser.retailerCategory,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Generate API Key for retailer automated integrations
 * @route   POST /api/v1/users/api-key
 * @access  Private (Retailer only)
 */
exports.generateApiKey = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Restrict API key generation to retailer accounts
    if (user.role !== 'retailer') {
      return res.status(403).json({
        success: false,
        message: 'Only retailer accounts can generate API keys',
      });
    }

    // Generate a secure 32-byte random hex key
    const rawKey = crypto.randomBytes(32).toString('hex');

    // Hash the key using SHA-256 before storing for security
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    user.apiKey = hashedKey;
    user.apiKeyCreatedAt = new Date();
    await user.save();

    // Return the raw key to the retailer ONCE (cannot be retrieved again in plain-text)
    return res.json({ apiKey: rawKey });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while generating API key',
    });
  }
};

/**
 * @desc    Initiate Google OAuth flow
 * @route   GET /api/v1/users/auth/google
 * @access  Public
 */
exports.googleAuth = (req, res, next) => {
  // Determine frontend URL from query or referer to handle multi-environment redirects (localhost, Vercel preview, production)
  let frontendOrigin = null;
  if (req.query.origin) {
    try {
      frontendOrigin = decodeURIComponent(req.query.origin);
    } catch {
      frontendOrigin = req.query.origin;
    }
  } else if (req.headers.referer) {
    try {
      frontendOrigin = new URL(req.headers.referer).origin;
    } catch {
      frontendOrigin = null;
    }
  }

  const frontendUrl = frontendOrigin || process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!passport._strategies || !passport._strategies['google']) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent('Google Sign-In is not configured on this server.')}`
    );
  }

  // Encode origin and requested role into the OAuth state parameter so Google passes it back to the callback
  const statePayload = {
    origin: frontendUrl,
    role: req.query.role || 'customer',
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64');

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state,
  })(req, res, next);
};

/**
 * @desc    Handle Google OAuth callback redirect from Google
 * @route   GET /api/v1/users/auth/google/callback
 * @access  Public
 */
exports.googleAuthCallback = (req, res, next) => {
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Decode originating frontend URL from OAuth state parameter if available
  if (req.query.state) {
    try {
      const parsedState = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
      if (parsedState.origin) {
        frontendUrl = parsedState.origin;
      }
    } catch (e) {
      console.warn('[Passport Google] Failed to decode OAuth state parameter:', e.message);
    }
  }

  if (!passport._strategies || !passport._strategies['google']) {
    return res.redirect(
      `${frontendUrl}/login?error=${encodeURIComponent('Google Sign-In is not configured on this server.')}`
    );
  }

  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      const reason = encodeURIComponent(err ? err.message : 'Google authentication failed');
      return res.redirect(`${frontendUrl}/login?error=${reason}`);
    }

    try {
      // Generate a JWT token for the authenticated Google user
      const token = generateToken(user._id);

      // Package user info for redirect back to frontend
      const userData = encodeURIComponent(
        JSON.stringify({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          retailerCategory: user.retailerCategory,
          token,
        })
      );

      return res.redirect(`${frontendUrl}/login?data=${userData}`);
    } catch (tokenErr) {
      console.error('[Google Callback] Token generation failed:', tokenErr.message);
      const reason = encodeURIComponent('Login succeeded but token generation failed');
      return res.redirect(`${frontendUrl}/login?error=${reason}`);
    }
  })(req, res, next);
};

/**
 * @desc    Synchronize Clerk authenticated user with MongoDB
 * @route   POST /api/v1/users/clerk-sync
 * @access  Public
 */
exports.clerkSync = async (req, res, next) => {
  try {
    const { clerkId, email, name, avatar, role, retailerCategory } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Clerk ID and email are required for synchronization',
      });
    }

    // Step 1: Find user by clerkId or email
    let user = await User.findOne({
      $or: [{ clerkId }, { email: email.toLowerCase() }],
    });

    if (user) {
      let modified = false;
      if (!user.clerkId) {
        user.clerkId = clerkId;
        modified = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Step 2: Create new user document in MongoDB
      user = await User.create({
        clerkId,
        name: name || 'OmniRetail User',
        email: email.toLowerCase(),
        avatar: avatar || null,
        role: role && ['customer', 'retailer'].includes(role) ? role : 'customer',
        retailerCategory: role === 'retailer' ? retailerCategory : undefined,
      });
    }

    // Step 3: Generate our backend JWT token
    const token = generateToken(user._id);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      retailerCategory: user.retailerCategory,
      apiKeyCreatedAt: user.apiKeyCreatedAt,
      hasApiKey: !!user.apiKey,
      token,
    });
  } catch (error) {
    console.error('[Clerk Sync Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during Clerk synchronization',
    });
  }
};

