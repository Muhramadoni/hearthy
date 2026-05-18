require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { testConnection } = require('./database/pool');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🌿 Hearthy API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log('\n🌿 ===== Hearthy Backend API =====');
      console.log(`✅  Server   : http://localhost:${PORT}`);
      console.log(`📋  Env      : ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️   Database : ${process.env.DB_NAME}@${process.env.DB_HOST}`);
      console.log('=================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
module.exports = app;
