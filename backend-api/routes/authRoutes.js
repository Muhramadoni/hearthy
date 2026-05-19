/**
 * @fileoverview Rute Autentikasi (Auth Routes).
 * Mendefinisikan _endpoints_ untuk registrasi, login, manajemen token (refresh), 
 * dan lupa kata sandi.
 */
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

// POST /api/auth/check-email
router.post('/check-email', authController.checkEmail);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
