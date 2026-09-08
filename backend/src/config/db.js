const mongoose = require('mongoose');

// Disable Mongoose buffering globally — queries will fail fast instead of
// hanging for 10 seconds when the DB isn't connected yet.
mongoose.set('bufferCommands', false);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const FALLBACK_MONGO_URI = 'mongodb+srv://tbhattacharyya1_db_user:omni1234@cluster0.p2l08us.mongodb.net/omniretail?appName=Cluster0';

const getMongoUri = () => {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('cluster0.xtryr4i.mongodb.net') || uri.includes('cluster0.eknc3lo.mongodb.net')) {
    return FALLBACK_MONGO_URI;
  }
  return uri;
};

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = getMongoUri();

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000, // Fail fast — don't hang serverless functions
      socketTimeoutMS: 10000,         // Close idle sockets after 10s
      maxPoolSize: 10,                // Reuse up to 10 connections
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log(`MongoDB Connected: ${m.connection.host}`);
      return m;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

