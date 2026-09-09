/**
 * index.js
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This is the Main Entry Point of the OmniRetail Node.js application.
 *
 * LIFECYCLE SEQUENCE:
 * 1. Loads environment variables from `.env` via `dotenv.config()`.
 *    (This MUST happen before anything else so that DB credentials and PORT are available).
 * 2. Imports the pre-configured Express application from `app.js`.
 * 3. Connects to the MongoDB database via `connectDB()`.
 * 4. Starts the HTTP server on the configured PORT (e.g. 5000) using `app.listen()`.
 * 5. Exports `app` for deployment environments like Vercel Serverless Functions.
 */

// Step 1: Load .env variables into process.env before any other module executes
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db.js');
const app = require('./app.js');

const PORT = process.env.PORT || 5000;

// Step 2: Start the HTTP server listener
// Note: In Vercel serverless environments, Vercel automatically wraps `app` and handles incoming requests,
// so we only start a standalone persistent HTTP listener when running locally or in standard container servers.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 OmniRetail Server running in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`📍 Listening on: http://localhost:${PORT}`);
        console.log(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
        console.log(`====================================================`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to MongoDB on startup:', err.message);
      process.exit(1);
    });
}

module.exports = app;
