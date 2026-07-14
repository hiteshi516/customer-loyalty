const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/customer_loyalty_system';

  try {
    mongoose.set('bufferCommands', false);
    cachedConnection = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    
    const connection = await cachedConnection;
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    cachedConnection = null; // Clear cache on error to retry
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

