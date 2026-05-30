const express = require('express');
const router  = express.Router();

const authRoutes       = require('./authRoutes');
const userRoutes       = require('./userRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const publicRoutes     = require('./publicRoutes');

router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🌿 Hearthy API v1.0',
    endpoints: {
      auth:        '/api/auth',
      users:       '/api/users',
      assessments: '/api/assessments',
      public:      '/api/public',
    },
  });
});

router.use('/auth',        authRoutes);
router.use('/users',       userRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/public',      publicRoutes);

module.exports = router;
