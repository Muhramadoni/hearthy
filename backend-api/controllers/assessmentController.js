const assessmentModel = require('../models/assessmentModel');

const assessmentController = {

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
      
      if (data.is_complete && data.prediction_result) {
        const pResult = data.prediction_result;
        
        const generatedRecommendations = "[]";
        
        const severity_mapped = pResult.risk_category === "High" ? "high" : pResult.risk_category === "Medium" ? "moderate" : "low";
        
        const generatedInsights = pResult.recommendations || `Berdasarkan hasil prediksi AI...`;
        
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

  continueAssessmentChat: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      
      const assessment = await assessmentModel.findById(id, req.user.id);
      if (!assessment) return res.status(404).json({ status: 'error', message: "Assessment not found" });
      
      const historyForFastAPI = [];
      for (const msg of assessment.chat_history || []) {
         if (msg.sender === 'user' && msg.text) historyForFastAPI.push({ role: 'user', content: msg.text });
         else if (msg.sender === 'bot' && msg.text && msg.type !== 'result') historyForFastAPI.push({ role: 'model', content: msg.text });
      }

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

      let updatedHistory = assessment.chat_history || [];
      updatedHistory.push({ text: message, sender: 'user' });
      updatedHistory.push({ text: data.reply, sender: 'bot' });

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

  getAssessments: async (req, res, next) => {
    try {
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

  getAssessmentById: async (req, res, next) => {
    try {
      const assessment = await assessmentModel.findById(req.params.id, req.user.id);
      if (!assessment) {
        return res.status(404).json({ status: 'error', message: 'Assessment not found.' });
      }
      res.json({ status: 'success', data: { assessment } });
    } catch (err) { next(err); }
  },

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
