import { getToken } from './authService';

const BASE_URL = '/api/users';
export async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data profil.');
  return data.data;
}

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
