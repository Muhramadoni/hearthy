const BASE_URL = '/api/auth';

/**
 * Cek apakah email terdaftar
 * @param {string} email
 * @returns {Promise<void>} — throws jika email tidak terdaftar
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
 * Reset password menggunakan email yang sudah diverifikasi
 * @param {string} email
 * @param {string} newPassword
 * @returns {Promise<void>}
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
 * Login user with email & password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
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
 * Register new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
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
 * Logout user - hapus token dari localStorage
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
 * Ambil user yang sedang login dari localStorage
 * @returns {object|null}
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
 * Cek apakah user sudah login
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem('hearthy_token');
}

/**
 * Ambil token aktif
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem('hearthy_token');
}
