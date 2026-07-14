const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../middleware/asyncHandler');

const calculatePoints = (amount) => Math.floor(Number(amount) / 100) * 10;

const addPurchase = asyncHandler(async (req, res) => {
  const { customerId, amount, note } = req.body;
  const purchaseAmount = Number(amount);

  if (!customerId || !Number.isFinite(purchaseAmount) || purchaseAmount <= 0) {
    res.status(400);
    throw new Error('Customer and a valid purchase amount are required');
  }

  const points = calculatePoints(purchaseAmount);

  if (points < 1) {
    res.status(400);
    throw new Error('Purchase amount must earn at least 1 point');
  }

  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { $inc: { loyaltyPoints: points } },
    { new: true, runValidators: true }
  );

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const transaction = await Transaction.create({
    customerId,
    type: 'Purchase',
    amount: purchaseAmount,
    points,
    balanceAfter: customer.loyaltyPoints,
    note
  });

  res.status(201).json({ customer, transaction });
});

const redeemPoints = asyncHandler(async (req, res) => {
  const { customerId, points, note } = req.body;
  const redeemValue = Number(points);

  if (!customerId || !Number.isInteger(redeemValue) || redeemValue <= 0) {
    res.status(400);
    throw new Error('Customer and a valid whole-number point value are required');
  }

  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, loyaltyPoints: { $gte: redeemValue } },
    { $inc: { loyaltyPoints: -redeemValue } },
    { new: true, runValidators: true }
  );

  if (!customer) {
    res.status(400);
    throw new Error('Customer not found or insufficient loyalty points');
  }

  const transaction = await Transaction.create({
    customerId,
    type: 'Redeem',
    amount: 0,
    points: redeemValue,
    balanceAfter: customer.loyaltyPoints,
    note
  });

  res.status(201).json({ customer, transaction });
});

const getTransactions = asyncHandler(async (req, res) => {
  const { customerId, type, limit = 50 } = req.query;
  const query = {};

  if (customerId) query.customerId = customerId;
  if (type) query.type = type;

  const transactions = await Transaction.find(query)
    .populate('customerId', 'name email phone')
    .sort({ date: -1 })
    .limit(Number(limit) || 50);

  res.json(transactions);
});

const getDashboard = asyncHandler(async (req, res) => {
  const [totalCustomers, pointStats, recentTransactions, topCustomers] = await Promise.all([
    Customer.countDocuments(),
    Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          points: { $sum: '$points' },
          amount: { $sum: '$amount' }
        }
      }
    ]),
    Transaction.find()
      .populate('customerId', 'name email phone')
      .sort({ date: -1 })
      .limit(6),
    Customer.find().sort({ loyaltyPoints: -1, name: 1 }).limit(5)
  ]);

  const purchases = pointStats.find((item) => item._id === 'Purchase');
  const redemptions = pointStats.find((item) => item._id === 'Redeem');

  res.json({
    totalCustomers,
    totalPointsIssued: purchases?.points || 0,
    totalPointsRedeemed: redemptions?.points || 0,
    totalPurchaseAmount: purchases?.amount || 0,
    recentTransactions,
    topCustomers
  });
});

const getMonthlyReport = asyncHandler(async (req, res) => {
  const report = await Transaction.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        points: { $sum: '$points' },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ]);

  res.json(report);
});

module.exports = {
  addPurchase,
  redeemPoints,
  getTransactions,
  getDashboard,
  getMonthlyReport
};
