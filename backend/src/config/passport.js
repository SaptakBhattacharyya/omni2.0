/**
 * passport.js
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This file sets up "Passport.js" authentication strategies, specifically Google OAuth 2.0.
 *
 * HOW GOOGLE OAUTH 2.0 WORKS:
 * 1. User clicks "Sign in with Google" on the frontend.
 * 2. Frontend directs browser to: `/api/v1/users/auth/google`.
 * 3. Passport redirects user to Google's login consent screen.
 * 4. User logs in with Google and approves permissions.
 * 5. Google redirects browser back to our backend callback URL:
 *    `/api/v1/users/auth/google/callback` with an authorization code.
 * 6. Passport exchanges the code for the user's Google profile (name, email, ID).
 * 7. In the callback below, we either find an existing user or create a new user in MongoDB.
 * 8. Finally, we generate our own JWT token and redirect the user back to the React frontend!
 */

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model.js');

module.exports = function (passport) {
  // Guard: If Google OAuth credentials aren't provided in .env, log a warning and skip.
  // This prevents the backend from crashing during local development if the user doesn't need Google login.
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  [Passport] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set. Google OAuth is disabled.');
    return;
  }

  // The callback URL where Google sends the user back after login.
  // Note: Must be an absolute URL (e.g. http://localhost:5000/api/v1/users/auth/google/callback)
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const callbackURL = `${backendUrl}/api/v1/users/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          if (!email) {
            return done(new Error('No email address found in Google profile'), null);
          }

          // Check if a user with this email already exists in our database
          let user = await User.findOne({ email });

          if (user) {
            // If the user registered earlier with email/password, link their Google ID
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // If user doesn't exist, create a new customer account
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || 'Google User',
            email: email,
            role: 'customer', // Default role for OAuth signups
          });

          return done(null, user);
        } catch (err) {
          console.error('[Passport Google Strategy Error]:', err);
          return done(err, null);
        }
      }
    )
  );

  // Passport session support (even if we primarily use JWTs, passport requires these)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
