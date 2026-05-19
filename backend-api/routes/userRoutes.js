/**
 * @fileoverview Rute Pengguna (User Routes).
 * Mendefinisikan _endpoints_ khusus untuk manajemen profil akun masing-masing pengguna.
 * Semua rute ini memerlukan otentikasi.
 */
const express        = require('express');
const router         = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes below require JWT
router.use(authenticate);

// GET    /api/users/profile
router.get('/profile',    userController.getProfile);

// PUT    /api/users/profile
router.put('/profile',    userController.updateProfile);

// PUT    /api/users/password
router.put('/password',   userController.changePassword);

// GET    /api/users/stats
router.get('/stats',      userController.getStats);

// DELETE /api/users/account
router.delete('/account', userController.deleteAccount);

module.exports = router;
