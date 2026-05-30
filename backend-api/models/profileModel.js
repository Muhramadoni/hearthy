const { pool } = require('../database/pool');

const profileModel = {
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
