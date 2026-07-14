const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret-change-before-production', {
    expiresIn: '7d'
  });

const sendAuth = (res, user, statusCode = 200) => {
  res.status(statusCode).json({
    token: createToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider
    }
  });
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error('An account already exists with this email');
  }

  const user = await User.create({ name, email, password, authProvider: 'local' });
  sendAuth(res, user, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !user.password || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  sendAuth(res, user);
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    res.status(503);
    throw new Error('Google login is not configured. Add GOOGLE_CLIENT_ID to .env.');
  }

  if (!credential) {
    res.status(400);
    throw new Error('Google credential is required');
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
  const payload = ticket.getPayload();

  let user = await User.findOne({ email: payload.email }).select('+googleId');

  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      avatar: payload.picture,
      authProvider: 'google',
      googleId: payload.sub
    });
  } else {
    user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
    user.googleId = payload.sub;
    user.avatar = payload.picture || user.avatar;
    await user.save();
  }

  sendAuth(res, user);
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const googleConfig = (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
};

module.exports = {
  signup,
  login,
  googleLogin,
  me,
  googleConfig
};
