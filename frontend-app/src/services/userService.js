import { getToken } from './authService';

const BASE_URL = '/api/users';

/**
 * Ambil profil user yang sedang login
 * @returns {Promise<{user: object, profile: object|null}>}
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
 * Update profil user (phone & address)
 * @param {{ phone?: string, address?: string }} payload
 * @returns {Promise<object>} profile yang diperbarui
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
