const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout  (protected)
router.post('/logout', authenticate, authController.logout);

// GET  /api/auth/me  (protected)
router.get('/me', authenticate, authController.me);

// POST /api/auth/refresh
router.post('/refresh', authController.refreshToken);

module.exports = router;
