const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model.js');

module.exports = function (passport) {
  // Guard: skip Google strategy if credentials aren't configured
  // (prevents a crash on cold-start when env vars are missing)
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set. Google OAuth disabled.');
    return;
  }

  // ── callbackURL MUST be absolute for Vercel serverless ──────────────────────
  // A relative path like '/api/v1/...' doesn't resolve correctly in serverless.
  // Set BACKEND_URL in your Vercel environment variables, e.g.:
  //   https://omniretail-two.vercel.app
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
        const newUser = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'customer', // Default role for social login
        };

        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If user exists but doesn't have googleId, update it
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

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
