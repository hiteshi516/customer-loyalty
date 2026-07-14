const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, 'Please enter a valid phone number']
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: [0, 'Loyalty points cannot be negative']
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
