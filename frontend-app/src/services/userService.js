/**
 * @fileoverview Modul Layanan Pengguna (User Service).
 * Menyediakan fungsi-fungsi interaksi dengan API terkait manajemen profil pengguna.
 */

import { getToken } from './authService';

const BASE_URL = '/api/users';

/**
 * Mengambil informasi profil lengkap dari pengguna yang sedang login.
 * @returns {Promise<{user: Object, profile: Object|null}>} Objek gabungan kredensial akun dan data biodata profil.
 * @throws {Error} Jika gagal memuat data profil.
 */
export async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data profil.');
  return data.data; // { user, profile }
}

/**
 * Memperbarui data biodata profil pengguna, seperti nomor telepon dan alamat.
 * @param {Object} payload - Objek berisi data yang ingin diperbarui.
 * @param {string} [payload.phone] - Nomor telepon baru pengguna.
 * @param {string} [payload.address] - Alamat tempat tinggal baru pengguna.
 * @returns {Promise<Object>} Data profil terbaru setelah berhasil disimpan.
 * @throws {Error} Jika proses pembaruan gagal dilakukan.
 */
export async function updateProfile(payload) {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui profil.');
  return data.data.profile;
}
