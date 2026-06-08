const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const app = require('./app.js');

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;

// ─── Per-request DB connection middleware (critical for Vercel serverless) ────
// In serverless environments each cold-start has no prior connection,
// so we ensure the DB is connected before any route handler runs.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(503).json({ message: 'Database unavailable. Please try again.' });
  }
});

// Only start the listener if we're not running on Vercel (serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to connect to DB on startup:', err.message);
    process.exit(1);
  });
}

module.exports = app;
