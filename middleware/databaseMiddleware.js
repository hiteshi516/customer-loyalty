const mongoose = require('mongoose');

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    message: 'Database is not connected. Start MongoDB and verify MONGODB_URI in .env.'
  });
};

module.exports = requireDatabase;
