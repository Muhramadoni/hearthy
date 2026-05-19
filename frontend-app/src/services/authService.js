/**
 * @fileoverview Modul Layanan Autentikasi (Auth Service).
 * Menyediakan fungsi-fungsi untuk berinteraksi dengan API autentikasi backend,
 * termasuk login, registrasi, manajemen token, dan reset password.
 */

const BASE_URL = '/api/auth';

/**
 * Memeriksa ketersediaan atau validitas email pengguna di sistem.
 * @param {string} email - Alamat email yang akan diperiksa.
 * @returns {Promise<Object>} Respons dari server yang berisi status pengecekan.
 * @throws {Error} Jika email tidak terdaftar atau terjadi kesalahan server.
 */
export async function checkEmail(email) {
  const res = await fetch(`${BASE_URL}/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Email tidak terdaftar.');
  }

  return data;
}

/**
 * Melakukan proses reset kata sandi menggunakan email yang telah diverifikasi.
 * @param {string} email - Alamat email pengguna.
 * @param {string} newPassword - Kata sandi baru yang akan disimpan.
 * @returns {Promise<Object>} Respons dari server mengenai status reset.
 * @throws {Error} Jika proses reset kata sandi gagal.
 */
export async function resetPassword(email, newPassword) {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Gagal mereset password. Silakan coba lagi.');
  }

  return data;
}

/**
 * Melakukan proses autentikasi (login) pengguna.
 * Menyimpan token dan data pengguna ke dalam `localStorage` jika berhasil.
 * @param {string} email - Alamat email pengguna.
 * @param {string} password - Kata sandi pengguna.
 * @returns {Promise<{token: string, user: Object}>} Data token otorisasi dan profil pengguna.
 * @throws {Error} Jika kredensial tidak valid atau proses login gagal.
 */
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login gagal. Silakan coba lagi.');
  }

  // Simpan token ke localStorage
  localStorage.setItem('hearthy_token', data.data.token);
  localStorage.setItem('hearthy_user', JSON.stringify(data.data.user));

  return data.data;
}

/**
 * Mendaftarkan pengguna baru ke dalam sistem.
 * Catatan: Fungsi ini tidak otomatis melakukan login setelah registrasi berhasil.
 * @param {string} name - Nama lengkap pengguna.
 * @param {string} email - Alamat email pengguna.
 * @param {string} password - Kata sandi yang diinginkan.
 * @returns {Promise<{token: string, user: Object}>} Data pengguna yang baru terdaftar.
 * @throws {Error} Jika email sudah digunakan atau proses registrasi gagal.
 */
export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Registrasi gagal. Silakan coba lagi.');
  }

  // Tidak auto-login — user harus login manual setelah registrasi
  return data.data;
}

/**
 * Mengakhiri sesi pengguna (logout).
 * Menghapus token dan data profil dari `localStorage` serta memberitahu server.
 * @returns {Promise<void>}
 */
export async function logout() {
  const token = localStorage.getItem('hearthy_token');

  if (token) {
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (_) {
      // abaikan error jaringan saat logout
    }
  }

  localStorage.removeItem('hearthy_token');
  localStorage.removeItem('hearthy_user');
}

/**
 * Mengambil data profil pengguna yang saat ini sedang login dari `localStorage`.
 * @returns {Object|null} Objek data pengguna, atau `null` jika belum login atau terjadi kesalahan *parsing*.
 */
export function getCurrentUser() {
  try {
    const user = localStorage.getItem('hearthy_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Memeriksa status autentikasi pengguna saat ini.
 * @returns {boolean} `true` jika pengguna memiliki token aktif, `false` jika tidak.
 */
export function isAuthenticated() {
  return !!localStorage.getItem('hearthy_token');
}

/**
 * Mengambil token akses (JWT) dari `localStorage`.
 * @returns {string|null} String token akses, atau `null` jika tidak ditemukan.
 */
export function getToken() {
  return localStorage.getItem('hearthy_token');
}
