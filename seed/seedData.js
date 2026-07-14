require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/customer_loyalty_system';

const customers = [
  {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+91 98765 43210',
    loyaltyPoints: 120
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 99887 76655',
    loyaltyPoints: 80
  },
  {
    name: 'Kabir Rao',
    email: 'kabir.rao@example.com',
    phone: '+91 91234 56780',
    loyaltyPoints: 210
  }
];

const runSeed = async () => {
  await mongoose.connect(mongoUri);
  await Transaction.deleteMany();
  await Customer.deleteMany();

  const createdCustomers = await Customer.insertMany(customers);

  await Transaction.insertMany([
    {
      customerId: createdCustomers[0]._id,
      type: 'Purchase',
      amount: 1200,
      points: 120,
      balanceAfter: 120,
      note: 'Initial purchase'
    },
    {
      customerId: createdCustomers[1]._id,
      type: 'Purchase',
      amount: 800,
      points: 80,
      balanceAfter: 80,
      note: 'Initial purchase'
    },
    {
      customerId: createdCustomers[2]._id,
      type: 'Purchase',
      amount: 2500,
      points: 250,
      balanceAfter: 250,
      note: 'Initial purchase'
    },
    {
      customerId: createdCustomers[2]._id,
      type: 'Redeem',
      amount: 0,
      points: 40,
      balanceAfter: 210,
      note: 'Welcome coupon'
    }
  ]);

  console.log('Seed data inserted successfully');
  await mongoose.disconnect();
};

runSeed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
