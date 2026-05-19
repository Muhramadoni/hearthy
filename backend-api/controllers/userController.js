/**
 * @fileoverview Pengontrol Pengguna (User Controller).
 * Mengelola fungsionalitas manajemen akun pengguna setelah login,
 * termasuk pengambilan/pembaruan profil, penggantian kata sandi, dan statistik.
 */
const bcrypt          = require('bcryptjs');
const userModel       = require('../models/userModel');
const profileModel    = require('../models/profileModel');
const assessmentModel = require('../models/assessmentModel');
const { validateProfileUpdate, validatePasswordChange } = require('../utils/validators');

/**
 * Objek Pengontrol (Controller) Manajemen Pengguna.
 * Memuat berbagai *handler* untuk _endpoint_ `/api/users`.
 */
const userController = {
  // GET /api/users/profile
  /**
   * Mengambil data akun dan profil terperinci milik pengguna yang sedang login.
   * @param {Object} req - Objek permintaan HTTP.
   * @param {Object} res - Objek respons HTTP.
   * @param {Function} next - Fungsi *middleware* *error*.
   */
  getProfile: async (req, res, next) => {
    try {
      const user    = await userModel.findById(req.user.id);
      const profile = await profileModel.findByUserId(req.user.id);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });
      res.json({ status: 'success', data: { user, profile: profile || null } });
    } catch (err) { next(err); }
  },

  // PUT /api/users/profile
  updateProfile: async (req, res, next) => {
    try {
      const { error } = validateProfileUpdate(req.body);
      if (error) return res.status(400).json({ status: 'error', message: error.message });

      const profile = await profileModel.upsert(req.user.id, req.body);
      res.json({ status: 'success', message: 'Profile updated successfully.', data: { profile } });
    } catch (err) { next(err); }
  },

  // PUT /api/users/password
  changePassword: async (req, res, next) => {
    try {
      const { error } = validatePasswordChange(req.body);
      if (error) return res.status(400).json({ status: 'error', message: error.message });

      const { currentPassword, newPassword } = req.body;
      const user = await userModel.findByEmail(req.user.email);

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(401).json({ status: 'error', message: 'Current password is incorrect.' });

      const hashed = await bcrypt.hash(newPassword, 12);
      await userModel.updatePassword(user.id, hashed);

      res.json({ status: 'success', message: 'Password changed successfully.' });
    } catch (err) { next(err); }
  },

  // GET /api/users/stats
  getStats: async (req, res, next) => {
    try {
      const total   = await assessmentModel.countByUser(req.user.id);
      const recent  = await assessmentModel.findAllByUser(req.user.id, 5, 0);
      const profile = await profileModel.findByUserId(req.user.id);

      res.json({
        status: 'success',
        data: {
          totalAssessments: total,
          recentAssessments: recent,
          profile,
        },
      });
    } catch (err) { next(err); }
  },

  // DELETE /api/users/account
  deleteAccount: async (req, res, next) => {
    try {
      await userModel.delete(req.user.id);
      res.json({ status: 'success', message: 'Account deleted. Take care! 🌿' });
    } catch (err) { next(err); }
  },
};

module.exports = userController;
