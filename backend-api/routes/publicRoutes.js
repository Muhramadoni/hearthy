const express          = require('express');
const router           = express.Router();
const publicController = require('../controllers/publicController');

// GET /api/public/articles
router.get('/articles',          publicController.getArticles);

// GET /api/public/articles/:id
router.get('/articles/:id',      publicController.getArticleById);

// GET /api/public/tips
router.get('/tips',              publicController.getTips);

// GET /api/public/categories
router.get('/categories',        publicController.getCategories);

// GET /api/public/assessment-types
router.get('/assessment-types',  publicController.getAssessmentTypes);

module.exports = router;
