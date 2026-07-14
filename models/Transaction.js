const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    type: {
      type: String,
      enum: ['Purchase', 'Redeem'],
      required: true
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Amount cannot be negative']
    },
    points: {
      type: Number,
      required: true,
      min: [1, 'Points must be at least 1']
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: [0, 'Balance cannot be negative']
    },
    note: {
      type: String,
      trim: true,
      maxlength: [140, 'Note cannot exceed 140 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
