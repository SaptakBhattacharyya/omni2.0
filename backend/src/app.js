/**
 * app.js
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This file configures the Express application instance (`app`).
 * Think of `app.js` as the pipeline setup:
 *   1. It attaches security and utility middlewares (Helmet, CORS, JSON parsers).
 *   2. It initializes authentication providers (Passport.js).
 *   3. It ensures database connectivity on each invocation (serverless-friendly).
 *   4. It connects our master API routes (`/api/v1` and `/v1`).
 *   5. It attaches the 404 Not Found and Global Error Handler middlewares at the very end.
 *
 * Notice: We do NOT call `app.listen()` here! Listening on a network port is done in
 * `index.js`. Separating `app.js` from `index.js` allows us to run unit tests without
 * binding to a live network port, and allows Vercel serverless deployments to import `app` directly.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');

const connectDB = require('./config/db.js');
const apiRoutes = require('./routes/index.js');
const { notFound, errorHandler } = require('./middlewares/error.middleware.js');

// ─── 1. Initialize Passport Configuration ─────────────────────────────────────
require('./config/passport.js')(passport);

// ─── 2. Create Express App Instance ───────────────────────────────────────────
const app = express();

// ─── 3. Global Middlewares ───────────────────────────────────────────────────

// Helmet helps secure Express apps by setting various HTTP response headers
app.use(helmet());

// Initialize Passport for authentication strategies (like Google OAuth)
app.use(passport.initialize());

// Configure Cross-Origin Resource Sharing (CORS)
// Allows our React frontend (running on a different port/domain) to communicate with this backend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // In development or if origin is in whitelist, allow request
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Fallback for flexible development
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Lightweight request logging middleware for easy console debugging during development
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.originalUrl}`);
  next();
});

// Body parsers: parse incoming JSON bodies and form submissions
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── 4. Database Connection Middleware ────────────────────────────────────────
// Runs before handling API routes.
// Critical for serverless platforms (e.g. Vercel cold-starts) to ensure
// MongoDB is ready before attempting queries.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please try again shortly.',
    });
  }
});

// ─── 5. Mount API Routes ─────────────────────────────────────────────────────
// Mount all routes under both `/api/v1` (standard) and `/v1` (short alias)
app.use('/api/v1', apiRoutes);
app.use('/v1', apiRoutes);

// Root route welcome message for visitors landing on http://localhost:5000/
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to OmniRetail API',
    healthCheck: '/api/v1/health',
    version: '1.0.0',
  });
});

// ─── 6. Centralized Error Handling Middlewares ─────────────────────────────────
// Any request that did not match an existing route falls through to `notFound`
app.use(notFound);

// Catch-all error handler for any exceptions passed via next(err)
app.use(errorHandler);

module.exports = app;
