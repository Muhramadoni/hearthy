const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const userModel    = require('../models/userModel');
const profileModel = require('../models/profileModel');
const { validateRegister, validateLogin } = require('../utils/validators');

const makeToken = (id, email, role) =>
  jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const safeUser = (u) => ({
  id: u.id, name: u.name, email: u.email,
  role: u.role, createdAt: u.created_at,
});

const authController = {
  // POST /api/auth/register
  register: async (req, res, next) => {
    try {
      const { error } = validateRegister(req.body);
      if (error) return res.status(400).json({ status: 'error', message: error.message });

      const { name, email, password } = req.body;

      if (await userModel.findByEmail(email)) {
        return res.status(409).json({ status: 'error', message: 'Email already registered.' });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user   = await userModel.create({ name, email, password: hashed });
      await profileModel.create(user.id);

      res.status(201).json({
        status: 'success',
        message: 'Registration successful! Welcome to Hearthy 🌿',
        data: { token: makeToken(user.id, user.email, user.role), user: safeUser(user) },
      });
    } catch (err) { next(err); }
  },

  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).json({ status: 'error', message: error.message });

      const { email, password } = req.body;
      const user = await userModel.findByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
      }
      if (!user.is_active) {
        return res.status(403).json({ status: 'error', message: 'Account deactivated. Contact support.' });
      }

      await userModel.updateLastLogin(user.id);

      res.json({
        status: 'success',
        message: 'Login successful! Welcome back 👋',
        data: { token: makeToken(user.id, user.email, user.role), user: safeUser(user) },
      });
    } catch (err) { next(err); }
  },

  // POST /api/auth/logout
  logout: (req, res) => {
    res.json({ status: 'success', message: 'Logged out successfully. Stay healthy! 🌿' });
  },

  // GET /api/auth/me
  me: async (req, res, next) => {
    try {
      const user    = await userModel.findById(req.user.id);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });
      const profile = await profileModel.findByUserId(user.id);
      res.json({ status: 'success', data: { user, profile: profile || null } });
    } catch (err) { next(err); }
  },

  // POST /api/auth/refresh
  refreshToken: async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ status: 'error', message: 'Token is required.' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await userModel.findById(decoded.id);
      if (!user || !user.is_active) {
        return res.status(401).json({ status: 'error', message: 'Invalid token. Please login again.' });
      }

      res.json({
        status: 'success',
        message: 'Token refreshed.',
        data: { token: makeToken(user.id, user.email, user.role) },
      });
    } catch (err) {
      if (['JsonWebTokenError','TokenExpiredError'].includes(err.name)) {
        return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
      }
      next(err);
    }
  },
};

module.exports = authController;
