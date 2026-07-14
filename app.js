require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { protect } = require('./middleware/authMiddleware');
const requireDatabase = require('./middleware/databaseMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/customers', requireDatabase, protect, customerRoutes);
app.use('/api', requireDatabase, protect, transactionRoutes);

app.use('/customers', requireDatabase, customerRoutes);
app.use((req, res, next) => {
  const legacyApiPaths = ['/purchase', '/redeem', '/transactions', '/dashboard', '/reports'];
  const isLegacyApi = legacyApiPaths.some((routePath) => req.path.startsWith(routePath));

  if (isLegacyApi) {
    return requireDatabase(req, res, next);
  }

  next();
});
app.use('/', transactionRoutes);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Customer Loyalty System running at http://localhost:${PORT}`);
});

module.exports = app;
