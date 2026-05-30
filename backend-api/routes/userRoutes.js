const express        = require('express');
const router         = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/profile',    userController.getProfile);
router.put('/profile',    userController.updateProfile);
router.put('/password',   userController.changePassword);

router.get('/stats',      userController.getStats);

router.delete('/account', userController.deleteAccount);

module.exports = router;
