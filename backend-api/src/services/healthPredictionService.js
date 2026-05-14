const pool = require("../config/database");

class HealthPrediction {
  static async create(data) {
    const query = `
      INSERT INTO health_predictions (
        usia, bmi, tekanan_darah, kolesterol, detak_jantung,
        riwayat_keluarga, tingkat_diet, alkohol_per_minggu,
        langkah_harian, level_stress, jam_aktivitas_fisik,
        durasi_tidur, hasil_prediksi, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;
    const values = [
      data.usia,
      data.bmi,
      data.tekanan_darah,
      data.kolesterol,
      data.detak_jantung,
      data.riwayat_keluarga,
      data.tingkat_diet,
      data.alkohol_per_minggu,
      data.langkah_harian,
      data.level_stress,
      data.jam_aktivitas_fisik,
      data.durasi_tidur,
      data.hasil_prediksi,
      data.confidence_score,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = "SELECT * FROM health_predictions ORDER BY created_at DESC;";
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = "SELECT * FROM health_predictions WHERE id = $1;";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = HealthPrediction;
