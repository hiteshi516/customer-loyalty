const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/customer_loyalty_system';

  try {
    mongoose.set('bufferCommands', false);
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('Start MongoDB and check MONGODB_URI in your .env file.');
  }
};

module.exports = connectDB;
