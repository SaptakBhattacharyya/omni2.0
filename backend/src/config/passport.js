const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model.js');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/users/auth/google/callback',
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
