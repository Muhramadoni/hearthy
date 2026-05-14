const { pool } = require('../database/pool');

const userModel = {
  findByEmail: async (email) => {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1', [email]
    );
    return rows[0] || null;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, last_login, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ name, email, password }) => {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, password]
    );
    return rows[0];
  },

  updateLastLogin: async (id) => {
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1', [id]
    );
  },

  updatePassword: async (id, hashedPassword) => {
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]
    );
  },

  deactivate: async (id) => {
    await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1', [id]
    );
  },

  delete: async (id) => {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  },
};

module.exports = userModel;
