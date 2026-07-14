const express = require('express');
const {
  addPurchase,
  redeemPoints,
  getTransactions,
  getDashboard,
  getMonthlyReport
} = require('../controllers/transactionController');

const router = express.Router();

router.post('/purchase', addPurchase);
router.post('/redeem', redeemPoints);
router.get('/transactions', getTransactions);
router.get('/dashboard', getDashboard);
router.get('/reports/monthly', getMonthlyReport);

module.exports = router;
