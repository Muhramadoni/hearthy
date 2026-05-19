/**
 * @fileoverview Pengontrol Asesmen (Assessment Controller).
 * Menangani logika bisnis untuk permintaan HTTP yang berkaitan dengan pembuatan,
 * prediksi AI, pengambilan riwayat, dan penghapusan data asesmen risiko kesehatan.
 */
const assessmentModel = require('../models/assessmentModel');
const { calculateScore } = require('../utils/mockAI');
const { getRecommendationsByScore } = require('../utils/mockAI');
const { predictCardiovascularRisk } = require('../utils/aiService');

/**
 * Objek Pengontrol (Controller) Asesmen Kesehatan.
 * Memuat berbagai *handler* untuk _endpoint_ `/api/assessments`.
 */
const assessmentController = {
  // POST /api/assessments
  /**
   * Menyimpan data asesmen kesehatan secara umum ke dalam database.
   * @param {Object} req - Objek permintaan HTTP (Request).
   * @param {Object} res - Objek respons HTTP (Response).
   * @param {Function} next - Fungsi *middleware* untuk meneruskan *error*.
   */
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

  // POST /api/assessments/predict
  predictCardiovascularRisk: async (req, res, next) => {
    try {
      const { answers } = req.body;
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ status: 'error', message: 'Answers are required for prediction.' });
      }

      // Check for required features
      const requiredFeatures = [
        'age', 'bmi', 'systolic_bp', 'diastolic_bp', 'cholesterol_mg_dl', 
        'resting_heart_rate', 'daily_steps', 'stress_level', 
        'physical_activity_hours_per_week', 'sleep_hours', 
        'family_history_heart_disease', 'diet_quality_score', 'alcohol_units_per_week'
      ];

      for (const feature of requiredFeatures) {
        if (answers[feature] === undefined) {
          return res.status(400).json({
            status: 'error',
            message: `Missing required feature for prediction: ${feature}`,
          });
        }
      }

      // Call the AI Service
      const predictionResult = await predictCardiovascularRisk(answers);
      
      const { risk_category, score, severity_mapped } = predictionResult;

      // Generate localized recommendations and insights based on answers
      const generatedRecommendations = [];
      if (severity_mapped === 'high') {
        generatedRecommendations.push("Segera jadwalkan konsultasi dengan dokter atau spesialis jantung.");
      }
      if (answers.systolic_bp >= 130 || answers.diastolic_bp >= 80) {
        generatedRecommendations.push("Kurangi asupan garam harian dan pantau tekanan darah secara berkala.");
      }
      if (answers.cholesterol_mg_dl >= 200) {
        generatedRecommendations.push("Batasi makanan berlemak tinggi dan tingkatkan konsumsi serat, buah, serta sayur.");
      }
      if (answers.daily_steps < 5000 || answers.physical_activity_hours_per_week < 2.5) {
        generatedRecommendations.push("Tingkatkan aktivitas fisik harian Anda, setidaknya 30 menit olahraga ringan.");
      }
      if (answers.bmi >= 25) {
        generatedRecommendations.push("Perhatikan porsi dan pola makan untuk menjaga berat badan tetap ideal.");
      }
      if (answers.sleep_hours < 6) {
        generatedRecommendations.push("Usahakan tidur cukup selama 7-8 jam per malam untuk pemulihan optimal.");
      }
      if (answers.stress_level >= 7) {
        generatedRecommendations.push("Luangkan waktu untuk relaksasi dan mengelola stres dengan baik.");
      }
      if (answers.alcohol_units_per_week >= 7) {
        generatedRecommendations.push("Kurangi konsumsi alkohol demi menjaga tekanan darah dan kesehatan jantung.");
      }
      if (generatedRecommendations.length === 0) {
        generatedRecommendations.push("Pertahankan pola makan seimbang, istirahat cukup, dan aktivitas fisik teratur.");
      }

      const generatedInsights = `Berdasarkan hasil prediksi AI, tingkat risiko penyakit kardiovaskular Anda berada pada kategori ${severity_mapped === 'high' ? 'Tinggi' : severity_mapped === 'moderate' ? 'Sedang' : 'Rendah'}. ${severity_mapped === 'low' ? 'Terus jaga kebiasaan sehat Anda!' : 'Ada beberapa parameter yang perlu mendapat perhatian khusus untuk mencegah risiko memburuk.'}`;

      // Save to database
      const assessment = await assessmentModel.create({
        userId: req.user.id,
        type: 'cardiovascular',
        answers,
        score: Math.round(score), // This is the probability percentage, must be integer
        maxScore: 100, // Probability max is 100
        severity: severity_mapped,
        recommendations: generatedRecommendations,
        aiInsights: generatedInsights,
      });

      res.status(201).json({
        status: 'success',
        message: 'Cardiovascular risk prediction completed successfully! ❤️',
        data: { 
          prediction: predictionResult,
          assessment
        },
      });
    } catch (err) { next(err); }
  },

  // GET /api/assessments
  getAssessments: async (req, res, next) => {
    try {
      // Lazy cleanup: delete records older than 1 year whenever history is fetched
      try {
        await assessmentModel.deleteOldRecords();
      } catch (cleanupErr) {
        console.error('Error during automatic history cleanup:', cleanupErr);
      }

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
      const TYPES = ['mental_health', 'physical', 'sleep', 'nutrition', 'stress', 'cardiovascular'];
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
      const TYPES = ['mental_health', 'physical', 'sleep', 'nutrition', 'stress', 'cardiovascular'];
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
