const express = require('express');
const { signup, login, googleLogin, me, googleConfig } = require('../controllers/authController');
const requireDatabase = require('../middleware/databaseMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/google-config', googleConfig);
router.post('/signup', requireDatabase, signup);
router.post('/login', requireDatabase, login);
router.post('/google', requireDatabase, googleLogin);
router.get('/me', requireDatabase, protect, me);

module.exports = router;
