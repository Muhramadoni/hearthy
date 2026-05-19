/**
 * @fileoverview Middleware Autentikasi dan Otorisasi (Auth Middleware).
 * Bertugas mencegat permintaan HTTP untuk memverifikasi token JWT
 * dan memastikan pengguna memiliki hak akses (role) yang sesuai.
 */
const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi keabsahan token JWT pada header `Authorization`.
 * Jika valid, data pengguna akan disisipkan ke dalam `req.user`.
 * @param {Object} req - Objek permintaan HTTP.
 * @param {Object} res - Objek respons HTTP.
 * @param {Function} next - Fungsi untuk melanjutkan ke middleware/controller berikutnya.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token has expired. Please login again.'
      : 'Invalid token. Please login again.';
    return res.status(401).json({ status: 'error', message });
  }
};

/**
 * Middleware untuk memeriksa peran (role) pengguna.
 * Harus dijalankan setelah middleware `authenticate`.
 * @param {...string} roles - Daftar peran yang diizinkan (misal: 'admin', 'user').
 * @returns {Function} Fungsi middleware otorisasi.
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden. You do not have permission to perform this action.',
    });
  }
  next();
};

module.exports = { authenticate, authorize };
