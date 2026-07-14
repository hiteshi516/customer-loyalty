const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../middleware/asyncHandler');

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
});

const getCustomers = asyncHandler(async (req, res) => {
  const { search = '', sort = 'recent', limit } = req.query;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const sortMap = {
    recent: { createdAt: -1 },
    points: { loyaltyPoints: -1, name: 1 },
    name: { name: 1 },
    oldest: { createdAt: 1 }
  };

  const customers = await Customer.find(query)
    .sort(sortMap[sort] || sortMap.recent)
    .limit(Number(limit) || 0);

  res.json(customers);
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const transactions = await Transaction.find({ customerId: customer._id }).sort({ date: -1 });
  res.json({ customer, transactions });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  customer.name = req.body.name ?? customer.name;
  customer.email = req.body.email ?? customer.email;
  customer.phone = req.body.phone ?? customer.phone;

  const updatedCustomer = await customer.save();
  res.json(updatedCustomer);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  await Transaction.deleteMany({ customerId: customer._id });
  await customer.deleteOne();
  res.json({ message: 'Customer and related transactions deleted' });
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
