const mongoose = require('mongoose');

// Disable Mongoose buffering globally — queries will fail fast instead of
// hanging for 10 seconds when the DB isn't connected yet.
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast — don't wait 30s
      socketTimeoutMS: 10000,         // Close idle sockets after 10s
      maxPoolSize: 10,                // Reuse up to 10 connections
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // In serverless, we shouldn't exit the process
    throw error;
  }
};

module.exports = connectDB;

