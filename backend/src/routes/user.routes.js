const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  generateApiKey,
  updateUserProfile,
} = require('../controllers/user.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');
const passport = require('passport');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/api-key', protect, generateApiKey);

// Google Auth — initiate OAuth flow
router.get('/auth/google', (req, res, next) => {
  if (!passport._strategies['google']) {
    return res.status(503).json({ message: 'Google Sign-In is not configured on this server.' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

// Google Auth — callback after Google redirects back
router.get('/auth/google/callback', (req, res, next) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!passport._strategies['google']) {
    return res.redirect(`${frontendUrl}/login?error=Google+auth+not+configured`);
  }

  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      const reason = encodeURIComponent(err ? err.message : 'Google authentication failed');
      return res.redirect(`${frontendUrl}/login?error=${reason}`);
    }

    try {
      const generateToken = require('../utils/generateToken');
      const token = generateToken(user._id);

      const userData = encodeURIComponent(JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        retailerCategory: user.retailerCategory,
        token,
      }));

      res.redirect(`${frontendUrl}/login?data=${userData}`);
    } catch (tokenErr) {
      console.error('Token generation failed:', tokenErr.message);
      const reason = encodeURIComponent('Login succeeded but token generation failed');
      res.redirect(`${frontendUrl}/login?error=${reason}`);
    }
  })(req, res, next);
});

module.exports = router;
