const HealthPrediction = require("../services/healthPredictionService");

const predictHeartHealth = async (req, res) => {
  try {
    const {
      usia,
      bmi,
      tekanan_darah,
      kolesterol,
      detak_jantung,
      riwayat_keluarga,
      tingkat_diet,
      alkohol_per_minggu,
      langkah_harian,
      level_stress,
      jam_aktivitas_fisik,
      durasi_tidur,
    } = req.body;

    // Dummy AI Logic
    let hasil_prediksi = "Low Risk";
    let confidence_score = 0.8;

    if (kolesterol > 200 || tekanan_darah > 140) {
      hasil_prediksi = "High Risk";
      confidence_score = 0.9;
    }

    // Save to database
    const predictionData = {
      usia,
      bmi,
      tekanan_darah,
      kolesterol,
      detak_jantung,
      riwayat_keluarga,
      tingkat_diet,
      alkohol_per_minggu,
      langkah_harian,
      level_stress,
      jam_aktivitas_fisik,
      durasi_tidur,
      hasil_prediksi,
      confidence_score,
    };

    const savedPrediction = await HealthPrediction.create(predictionData);

    res.status(201).json({
      message: "Prediction saved successfully",
      data: savedPrediction,
    });
  } catch (error) {
    console.error("Error in predictHeartHealth:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  predictHeartHealth,
};
