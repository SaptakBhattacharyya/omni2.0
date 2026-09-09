/**
 * db.js
 *
 * WHAT IS THIS FILE?
 * ------------------
 * This file configures and manages our connection to the MongoDB database using Mongoose.
 *
 * WHY CACHING?
 * ------------
 * In traditional Node.js servers, one persistent connection is kept open.
 * However, on serverless platforms (like Vercel), server instances frequently
 * start up and shut down ("cold starts"). If we created a brand new database
 * connection on every API request, the database would quickly run out of connections.
 *
 * By caching the connection promise on Node's `global` object, all requests
 * within the same warm instance reuse the existing connection.
 */

const mongoose = require('mongoose');

// Disable Mongoose buffering globally:
// If the DB isn't ready yet, fail quickly instead of waiting 10 seconds.
mongoose.set('bufferCommands', false);

// Global cache variable to reuse across serverless function invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Fallback MongoDB connection URI for quick local development testing
const FALLBACK_MONGO_URI = 'mongodb+srv://tbhattacharyya1_db_user:omni1234@cluster0.p2l08us.mongodb.net/omniretail?appName=Cluster0';

/**
 * Resolves the MongoDB connection string to use.
 */
const getMongoUri = () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('cluster0.xtryr4i.mongodb.net') || uri.includes('cluster0.eknc3lo.mongodb.net')) {
    return FALLBACK_MONGO_URI;
  }
  return uri;
};

/**
 * Connect to MongoDB database
 * @returns {Promise<mongoose.Connection>}
 */
const connectDB = async () => {
  // 1. Return cached connection if already established
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = getMongoUri();

  // 2. If no connection promise is currently in flight, create one
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if DB is unreachable
      socketTimeoutMS: 10000,         // Close idle sockets after 10s
      maxPoolSize: 10,                // Maintain up to 10 socket connections
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log(`✅ MongoDB Connected successfully: ${m.connection.host}`);
      return m;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  // 3. Await connection promise and cache the connection instance
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
