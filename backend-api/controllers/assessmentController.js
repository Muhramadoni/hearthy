const assessmentModel = require('../models/assessmentModel');
const { calculateScore } = require('../utils/mockAI');
const { getRecommendationsByScore } = require('../utils/mockAI');

const assessmentController = {
  // POST /api/assessments
  createAssessment: async (req, res, next) => {
    try {
      const { type, answers } = req.body;

      const VALID_TYPES = ['mental_health', 'physical', 'sleep', 'nutrition', 'stress'];
      if (!type || !VALID_TYPES.includes(type)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid assessment type. Must be one of: ${VALID_TYPES.join(', ')}`,
        });
      }
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ status: 'error', message: 'Answers are required.' });
      }

      const { score, maxScore, severity } = calculateScore(type, answers);
      const { recommendations, aiInsights } = getRecommendationsByScore(type, score, maxScore, severity);

      const assessment = await assessmentModel.create({
        userId: req.user.id,
        type, answers, score, maxScore, severity,
        recommendations, aiInsights,
      });

      res.status(201).json({
        status: 'success',
        message: 'Assessment submitted successfully! 🌿',
        data: { assessment },
      });
    } catch (err) { next(err); }
  },

  // GET /api/assessments
  getAssessments: async (req, res, next) => {
    try {
      const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
      const offset = parseInt(req.query.offset) || 0;
      const list   = await assessmentModel.findAllByUser(req.user.id, limit, offset);
      const total  = await assessmentModel.countByUser(req.user.id);

      res.json({
        status: 'success',
        data: { assessments: list, total, limit, offset },
      });
    } catch (err) { next(err); }
  },

  // GET /api/assessments/summary
  getSummary: async (req, res, next) => {
    try {
      const TYPES = ['mental_health', 'physical', 'sleep', 'nutrition', 'stress'];
      const summary = {};
      for (const t of TYPES) {
        summary[t] = await assessmentModel.findLatestByType(req.user.id, t);
      }
      const total = await assessmentModel.countByUser(req.user.id);
      res.json({ status: 'success', data: { summary, totalAssessments: total } });
    } catch (err) { next(err); }
  },

  // GET /api/assessments/recommendations
  getRecommendations: async (req, res, next) => {
    try {
      const TYPES = ['mental_health', 'physical', 'sleep', 'nutrition', 'stress'];
      const allRecs = [];
      for (const t of TYPES) {
        const latest = await assessmentModel.findLatestByType(req.user.id, t);
        if (latest?.recommendations) {
          allRecs.push(...(Array.isArray(latest.recommendations) ? latest.recommendations : []));
        }
      }
      res.json({ status: 'success', data: { recommendations: allRecs } });
    } catch (err) { next(err); }
  },

  // GET /api/assessments/:id
  getAssessmentById: async (req, res, next) => {
    try {
      const assessment = await assessmentModel.findById(req.params.id, req.user.id);
      if (!assessment) {
        return res.status(404).json({ status: 'error', message: 'Assessment not found.' });
      }
      res.json({ status: 'success', data: { assessment } });
    } catch (err) { next(err); }
  },

  // DELETE /api/assessments/:id
  deleteAssessment: async (req, res, next) => {
    try {
      const deleted = await assessmentModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Assessment not found.' });
      }
      res.json({ status: 'success', message: 'Assessment deleted.' });
    } catch (err) { next(err); }
  },
};

module.exports = assessmentController;
