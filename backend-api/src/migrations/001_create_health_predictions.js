// Migration: Create health_predictions table

const up = async (pool) => {
  const query = `
    CREATE TABLE IF NOT EXISTS health_predictions (
      id SERIAL PRIMARY KEY,
      usia INTEGER NOT NULL,
      bmi FLOAT NOT NULL,
      tekanan_darah INTEGER NOT NULL,
      kolesterol INTEGER NOT NULL,
      detak_jantung INTEGER NOT NULL,
      riwayat_keluarga BOOLEAN NOT NULL,
      tingkat_diet VARCHAR(50) NOT NULL,
      alkohol_per_minggu INTEGER NOT NULL,
      langkah_harian INTEGER NOT NULL,
      level_stress VARCHAR(50) NOT NULL,
      jam_aktivitas_fisik FLOAT NOT NULL,
      durasi_tidur FLOAT NOT NULL,
      hasil_prediksi VARCHAR(50) NOT NULL,
      confidence_score FLOAT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};

const down = async (pool) => {
  const query = `DROP TABLE IF EXISTS health_predictions;`;
  await pool.query(query);
};

module.exports = { up, down };