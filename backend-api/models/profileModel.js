/**
 * @fileoverview Model Profil Pengguna (Profile Model).
 * Mengatur interaksi database untuk tabel `profiles` yang berisi data pribadi tambahan
 * seperti nomor telepon dan alamat tempat tinggal.
 */
const { pool } = require('../database/pool');

/**
 * Objek Model Database untuk Profil Pengguna.
 */
const profileModel = {
  /**
   * Membuat entri profil kosong (null) untuk pengguna baru saat registrasi awal.
   * @param {number|string} userId - ID pengguna.
   * @returns {Promise<Object>} Baris profil yang dikembalikan.
   */
  create: async (userId) => {
    const { rows } = await pool.query(
      `INSERT INTO profiles (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId]
    );
    return rows[0] || null;
  },

  findByUserId: async (userId) => {
    const { rows } = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    return rows[0] || null;
  },

  upsert: async (userId, { phone, address }) => {
    const { rows } = await pool.query(
      `INSERT INTO profiles (user_id, phone, address)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE
         SET phone      = EXCLUDED.phone,
             address    = EXCLUDED.address,
             updated_at = NOW()
       RETURNING *`,
      [userId, phone ?? null, address ?? null]
    );
    return rows[0];
  },
};

module.exports = profileModel;
