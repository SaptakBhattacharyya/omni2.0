// ─── MUST be first — loads .env before any module reads process.env ──────────
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db.js');
const app = require('./app.js');

const PORT = process.env.PORT || 5000;

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
