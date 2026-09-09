/**
 * auth.middleware.js
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This middleware protects private routes. It checks whether the user is logged in
 * by validating the JSON Web Token (JWT) sent in the HTTP "Authorization" header.
 *
 * It provides two helper middlewares:
 *   1. protect   → Ensures the request has a valid JWT token and attaches the logged-in
 *                  user's database record to `req.user`.
 *   2. authorize → Restricts route access only to users with specific roles (e.g., 'retailer').
 *
 * HOW IT WORKS (STEP-BY-STEP):
 * 1. Client logs in and receives a JWT token.
 * 2. Client sends subsequent requests with header: `Authorization: Bearer <token>`
 * 3. `protect` extracts the token, verifies the signature using JWT_SECRET, and finds the user.
 * 4. If everything is valid, `next()` is called to let the request proceed to the controller.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');

/**
 * Protect Middleware
 * Verifies JWT token and attaches the authenticated user to `req.user`.
 */
const protect = async (req, res, next) => {
  let token;

  // Step 1: Check if the Authorization header exists and begins with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Step 2: Extract the raw token string (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Step 3: Verify token signature with our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Step 4: Fetch user from DB using the ID encoded in the token (exclude password field)
      req.user = await User.findById(decoded.id).select('-password');

      // Step 5: Check if the user still exists in the database
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }

      // Step 6: Success! Move to the next middleware or controller
      return next();
    } catch (error) {
      console.error('[Auth Middleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: token is invalid or expired',
      });
    }
  }

  // Step 7: If no token was provided in the headers
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: no token provided in Authorization header',
    });
  }
};

/**
 * Authorize Middleware (Role-Based Access Control)
 * Checks whether the authenticated user has one of the required roles.
 *
 * Example usage in routes:
 *   router.post('/products', protect, authorize('retailer'), createProduct);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure the user was already authenticated by `protect`
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: please log in first',
      });
    }

    // Check if user's role matches any of the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    // Role is authorized!
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
