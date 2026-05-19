/**
 * @fileoverview Rute Asesmen (Assessment Routes).
 * Mendefinisikan _endpoints_ terkait pengiriman dan pengambilan riwayat asesmen.
 * Semua rute dalam file ini dilindungi oleh middleware `authenticate`.
 */
const express              = require('express');
const router               = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticate }     = require('../middleware/authMiddleware');

// All routes below require JWT
router.use(authenticate);

// GET  /api/assessments
router.get('/',                  assessmentController.getAssessments);

// GET  /api/assessments/summary
router.get('/summary',           assessmentController.getSummary);

// GET  /api/assessments/recommendations
router.get('/recommendations',   assessmentController.getRecommendations);

// POST /api/assessments
router.post('/',                 assessmentController.createAssessment);

// POST /api/assessments/predict
router.post('/predict',          assessmentController.predictCardiovascularRisk);

// GET  /api/assessments/:id
router.get('/:id',               assessmentController.getAssessmentById);

// DELETE /api/assessments/:id
router.delete('/:id',            assessmentController.deleteAssessment);

module.exports = router;
