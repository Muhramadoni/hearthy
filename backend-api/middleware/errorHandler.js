/**
 * @fileoverview Middleware Penanganan Kesalahan (Error Handler).
 * Menangkap semua kesalahan (Error/Exception) yang terjadi selama pemrosesan request
 * dan mengembalikan respons JSON yang diformat dengan baik.
 */

/**
 * Fungsi middleware untuk menangani *error* secara terpusat.
 * Menerjemahkan kode kesalahan database (PostgreSQL) menjadi pesan yang ramah pengguna.
 * @param {Error} err - Objek kesalahan yang ditangkap.
 * @param {Object} req - Objek permintaan HTTP.
 * @param {Object} res - Objek respons HTTP.
 * @param {Function} next - Fungsi next (tidak digunakan di sini tapi diperlukan oleh Express untuk mendeteksi *error handler*).
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ status: 'error', message: 'A record with this value already exists.' });
  }
  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ status: 'error', message: 'Referenced record does not exist.' });
  }
  // PostgreSQL invalid UUID
  if (err.code === '22P02') {
    return res.status(400).json({ status: 'error', message: 'Invalid ID format.' });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500
      ? 'Internal server error. Please try again later.'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
