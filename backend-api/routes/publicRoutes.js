const express          = require('express');
const router           = express.Router();
const publicController = require('../controllers/publicController');

router.get('/articles',          publicController.getArticles);
router.get('/articles/:id',      publicController.getArticleById);
router.get('/tips',              publicController.getTips);
router.get('/categories',        publicController.getCategories);
router.get('/assessment-types',  publicController.getAssessmentTypes);

module.exports = router;
