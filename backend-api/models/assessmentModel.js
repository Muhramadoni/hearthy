const { pool } = require('../database/pool');

const assessmentModel = {
  create: async ({ userId, type, answers, score, maxScore, severity, recommendations, aiInsights }) => {
    const { rows } = await pool.query(
      `INSERT INTO assessments
         (user_id, type, answers, score, max_score, severity, recommendations, ai_insights)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        userId, type,
        JSON.stringify(answers),
        score, maxScore, severity,
        JSON.stringify(recommendations),
        aiInsights,
      ]
    );
    return rows[0];
  },

  findAllByUser: async (userId, limit = 20, offset = 0) => {
    const { rows } = await pool.query(
      `SELECT * FROM assessments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  },

  findById: async (id, userId) => {
    const { rows } = await pool.query(
      'SELECT * FROM assessments WHERE id = $1 AND user_id = $2 LIMIT 1',
      [id, userId]
    );
    return rows[0] || null;
  },

  findLatestByType: async (userId, type) => {
    const { rows } = await pool.query(
      `SELECT * FROM assessments
       WHERE user_id = $1 AND type = $2
       ORDER BY created_at DESC LIMIT 1`,
      [userId, type]
    );
    return rows[0] || null;
  },

  countByUser: async (userId) => {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS total FROM assessments WHERE user_id = $1',
      [userId]
    );
    return parseInt(rows[0].total);
  },

  delete: async (id, userId) => {
    const { rowCount } = await pool.query(
      'DELETE FROM assessments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  },
};

module.exports = assessmentModel;
