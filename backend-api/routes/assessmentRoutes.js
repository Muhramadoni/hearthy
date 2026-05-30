const express              = require('express');
const router               = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticate }     = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/',                  assessmentController.getAssessments);
router.get('/summary',           assessmentController.getSummary);
router.get('/recommendations',   assessmentController.getRecommendations);
router.post('/chat',             assessmentController.assessmentChat);
router.post('/chat/:id',         assessmentController.continueAssessmentChat);
router.get('/:id',               assessmentController.getAssessmentById);
router.delete('/:id',            assessmentController.deleteAssessment);

module.exports = router;
