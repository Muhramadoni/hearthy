const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

router.post('/refresh', authController.refreshToken);

router.post('/check-email', authController.checkEmail);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
