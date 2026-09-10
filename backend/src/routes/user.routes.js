/**
 * user.routes.js
 *
 * WHAT IS A ROUTE FILE IN MVC?
 * ----------------------------
 * The Route file is the dispatcher / table-of-contents for URLs.
 * It maps each HTTP method and URL path to its matching Controller function.
 *
 * It is also where we attach route-specific middlewares (like `protect` for authentication).
 */

const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  generateApiKey,
  googleAuth,
  googleAuthCallback,
  clerkSync,
} = require('../controllers/user.controller.js');

const { protect } = require('../middlewares/auth.middleware.js');

// ─── Public Authentication Routes ─────────────────────────────────────────────
// POST /api/v1/users/register - Register a new customer or retailer
router.post('/register', registerUser);

// POST /api/v1/users/login - Authenticate user & get JWT token
router.post('/login', loginUser);

// POST /api/v1/users/clerk-sync - Synchronize Clerk user with MongoDB and get JWT token
router.post('/clerk-sync', clerkSync);

// ─── Protected User Profile Routes ────────────────────────────────────────────
// GET /api/v1/users/profile - Get current logged-in user profile
router.get('/profile', protect, getUserProfile);

// PUT /api/v1/users/profile - Update user profile information
router.put('/profile', protect, updateUserProfile);

// POST /api/v1/users/api-key - Generate API Key for retailer automated integrations
router.post('/api-key', protect, generateApiKey);

// ─── Google OAuth Routes ──────────────────────────────────────────────────────
// GET /api/v1/users/auth/google - Initiate Google login consent flow
router.get('/auth/google', googleAuth);

// GET /api/v1/users/auth/google/callback - Callback route Google redirects to after login
router.get('/auth/google/callback', googleAuthCallback);

module.exports = router;
