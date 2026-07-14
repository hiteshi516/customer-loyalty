const connectDB = require('../config/db');

const requireDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(503).json({
      message: `Database is not connected: ${error.message}. Verify MONGODB_URI in your environment.`
    });
  }
};

module.exports = requireDatabase;

