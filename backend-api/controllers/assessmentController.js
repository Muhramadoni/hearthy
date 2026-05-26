/**
 * @fileoverview Pengontrol Asesmen (Assessment Controller).
 * Menangani logika bisnis untuk permintaan HTTP yang berkaitan dengan pembuatan,
 * prediksi AI, pengambilan riwayat, dan penghapusan data asesmen risiko kesehatan.
 */
const assessmentModel = require('../models/assessmentModel');
const { predictCardiovascularRisk } = require('../utils/aiService');
const { generateCardioRecommendations, formatRecommendationsForDB } = require('../utils/cardioRecommendations');

/**
 * Objek Pengontrol (Controller) Asesmen Kesehatan.
 * Memuat berbagai *handler* untuk _endpoint_ `/api/assessments`.
 */
const assessmentController = {
  // POST /api/assessments/chat
  assessmentChat: async (req, res, next) => {
    try {
      const { message, chat_history, collected_data } = req.body;
      
      const response = await fetch('http://127.0.0.1:8000/api/v1/assessment/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chat_history, collected_data })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FastAPI AI Server error: ${errorText}`);
      }
      
      const data = await response.json();
      
      // If prediction is complete, we also save it to DB just like predictCardiovascularRisk
      if (data.is_complete && data.prediction_result) {
        const pResult = data.prediction_result;
        
        const rawRecs = generateCardioRecommendations(data.collected_data);
        const generatedRecommendations = formatRecommendationsForDB(rawRecs);
        
        const severity_mapped = pResult.risk_category === "High" ? "high" : pResult.risk_category === "Medium" ? "moderate" : "low";
        const generatedInsights = `Berdasarkan hasil prediksi AI, tingkat risiko penyakit kardiovaskular Anda berada pada kategori ${severity_mapped === 'high' ? 'Tinggi' : severity_mapped === 'moderate' ? 'Sedang' : 'Rendah'}. ${severity_mapped === 'low' ? 'Terus jaga kebiasaan sehat Anda!' : 'Ada beberapa parameter yang perlu mendapat perhatian khusus untuk mencegah risiko memburuk.'}`;
        
        let updatedChatHistory = chat_history || [];
        updatedChatHistory.push({ text: message, sender: 'user' });
        updatedChatHistory.push({ text: data.reply, sender: 'bot' });
        
        updatedChatHistory.push({
          type: "result",
          data: { 
            score: Math.round(pResult.risk_score), 
            severityStr: severity_mapped === 'high' ? 'Tinggi' : severity_mapped === 'moderate' ? 'Sedang' : 'Rendah', 
            insights: generatedInsights, 
            finalAnswers: data.collected_data 
          },
          sender: "bot"
        });
        updatedChatHistory.push({
          text: "Ketik 'Mulai Asesmen Baru' atau gunakan icon di pojok kanan atas jika Anda ingin melakukan evaluasi baru.",
          sender: "bot"
        });
        
        const assessment = await assessmentModel.create({
          userId: req.user.id,
          type: 'cardiovascular',
          answers: data.collected_data,
          chatHistory: updatedChatHistory,
          score: Math.round(pResult.risk_score),
          maxScore: 100,
          severity: severity_mapped,
          recommendations: generatedRecommendations,
          aiInsights: generatedInsights,
        });
        
        data.assessment_id = assessment.id;
        data.final_chat_history = updatedChatHistory;
      }
      
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  },

  // POST /api/assessments/chat/:id
  continueAssessmentChat: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      
      const assessment = await assessmentModel.findById(id, req.user.id);
      if (!assessment) return res.status(404).json({ status: 'error', message: "Assessment not found" });
      
      // format history for FastAPI
      const historyForFastAPI = [];
      for (const msg of assessment.chat_history || []) {
         if (msg.sender === 'user' && msg.text) historyForFastAPI.push({ role: 'user', content: msg.text });
         else if (msg.sender === 'bot' && msg.text && msg.type !== 'result') historyForFastAPI.push({ role: 'model', content: msg.text });
      }

      // call POST http://127.0.0.1:8000/api/v1/chat
      const response = await fetch('http://127.0.0.1:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: historyForFastAPI })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`FastAPI AI Server error: ${errText}`);
      }

      const data = await response.json();

      // update chat_history in DB
      let updatedHistory = assessment.chat_history || [];
      updatedHistory.push({ text: message, sender: 'user' });
      updatedHistory.push({ text: data.reply, sender: 'bot' });

      // Update Database
      await assessmentModel.update(id, {
        userId: req.user.id,
        type: assessment.type,
        answers: assessment.answers,
        chatHistory: updatedHistory,
        score: assessment.score,
        maxScore: assessment.max_score,
        severity: assessment.severity,
        recommendations: assessment.recommendations,
        aiInsights: assessment.ai_insights
      });

      res.json({ status: 'success', data: { reply: data.reply, final_chat_history: updatedHistory }});
    } catch (err) { next(err); }
  },

  // POST /api/assessments/predict
  predictCardiovascularRisk: async (req, res, next) => {
    try {
      const { answers, chatHistory } = req.body;
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ status: 'error', message: 'Answers are required for prediction.' });
      }

      // Check for required features and parse to float
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
        // Pastikan nilai menjadi angka desimal (Float) agar Python tidak bingung
        answers[feature] = parseFloat(answers[feature]);
      }

      // Call the AI Service
      const predictionResult = await predictCardiovascularRisk(answers);
      
      const { risk_category, score, severity_mapped } = predictionResult;

      // Generate localized recommendations and insights based on answers
      const rawRecs = generateCardioRecommendations(answers);
      const generatedRecommendations = formatRecommendationsForDB(rawRecs);

      const generatedInsights = `Berdasarkan hasil prediksi AI, tingkat risiko penyakit kardiovaskular Anda berada pada kategori ${severity_mapped === 'high' ? 'Tinggi' : severity_mapped === 'moderate' ? 'Sedang' : 'Rendah'}. ${severity_mapped === 'low' ? 'Terus jaga kebiasaan sehat Anda!' : 'Ada beberapa parameter yang perlu mendapat perhatian khusus untuk mencegah risiko memburuk.'}`;

      let updatedChatHistory = chatHistory || [];
      if (updatedChatHistory.length > 0) {
        updatedChatHistory.push({
          type: "result",
          data: { score: Math.round(score), severityStr: severity_mapped === 'high' ? 'Tinggi' : severity_mapped === 'moderate' ? 'Sedang' : 'Rendah', insights: generatedInsights, finalAnswers: answers },
          sender: "bot"
        });
        updatedChatHistory.push({
          text: "Ketik 'Mulai Asesmen Baru' atau gunakan icon di pojok kanan atas jika Anda ingin melakukan evaluasi baru.",
          sender: "bot"
        });
      }

      // Save to database
      const assessment = await assessmentModel.create({
        userId: req.user.id,
        type: 'cardiovascular',
        answers,
        chatHistory: updatedChatHistory,
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

  updateCardiovascularRisk: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { answers, chatHistory } = req.body;
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ status: 'error', message: 'Answers are required for prediction.' });
      }

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
        answers[feature] = parseFloat(answers[feature]);
      }

      const predictionResult = await predictCardiovascularRisk(answers);
      const { risk_category, score, severity_mapped } = predictionResult;

      const rawRecs = generateCardioRecommendations(answers);
      const generatedRecommendations = formatRecommendationsForDB(rawRecs);

      const generatedInsights = `Berdasarkan hasil prediksi AI, tingkat risiko penyakit kardiovaskular Anda berada pada kategori ${severity_mapped === 'high' ? 'Tinggi' : severity_mapped === 'moderate' ? 'Sedang' : 'Rendah'}. ${severity_mapped === 'low' ? 'Terus jaga kebiasaan sehat Anda!' : 'Ada beberapa parameter yang perlu mendapat perhatian khusus untuk mencegah risiko memburuk.'}`;

      let updatedChatHistory = chatHistory || [];
      if (updatedChatHistory.length > 0) {
        updatedChatHistory.push({
          type: "result",
          data: { score: Math.round(score), severityStr: severity_mapped === 'high' ? 'Tinggi' : severity_mapped === 'moderate' ? 'Sedang' : 'Rendah', insights: generatedInsights, finalAnswers: answers },
          sender: "bot"
        });
        updatedChatHistory.push({
          text: "Ketik 'Mulai Asesmen Baru' atau gunakan icon di pojok kanan atas jika Anda ingin melakukan evaluasi baru.",
          sender: "bot"
        });
      }

      const assessment = await assessmentModel.update(id, {
        userId: req.user.id,
        type: 'cardiovascular',
        answers,
        chatHistory: updatedChatHistory,
        score: Math.round(score),
        maxScore: 100,
        severity: severity_mapped,
        recommendations: generatedRecommendations,
        aiInsights: generatedInsights,
      });

      if (!assessment) {
         return res.status(404).json({ status: 'error', message: 'Assessment not found.' });
      }

      res.status(200).json({
        status: 'success',
        message: 'Cardiovascular risk prediction updated successfully! ❤️',
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
