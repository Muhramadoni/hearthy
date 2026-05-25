/**
 * @fileoverview Layanan AI (AI Service).
 * Menjembatani backend Node.js dengan skrip Python untuk menjalankan prediksi
 * model *Machine Learning* (contoh: prediksi risiko kardiovaskular).
 */
const { spawn } = require('child_process');
const path = require('path');

/**
 * Calls the Python ML script to predict cardiovascular risk.
 * @param {Object} features - The user health features required by the model.
 * @returns {Promise<Object>} - The prediction result containing risk_category, score, and severity_mapped.
 */
const predictCardiovascularRisk = async (features) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        smoking_status: 0, // default: never smoked (not collected in assessment form)
        ...features
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`FastAPI responded with status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    // FastAPI mengembalikan { risk_category, risk_score, confidence, f1_scores, recommendations }
    // Node.js backend mengharapkan { risk_category, score, severity_mapped }
    // Jadi kita petakan (map) strukturnya agar sesuai
    return {
      risk_category: data.risk_category,
      score: data.risk_score,
      severity_mapped: data.risk_category === "High" ? "high" : data.risk_category === "Medium" ? "moderate" : "low",
    };

  } catch (err) {
    throw new Error(`Failed to connect to AI server: ${err.message}`);
  }
};

module.exports = {
  predictCardiovascularRisk
};
