const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
  process.exit(-1);
});

const testConnection = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
  } finally {
    client.release();
  }
};

module.exports = { pool, testConnection };
