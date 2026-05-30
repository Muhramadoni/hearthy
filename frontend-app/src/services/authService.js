const BASE_URL = '/api/auth';
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

  localStorage.setItem('hearthy_token', data.data.token);
  localStorage.setItem('hearthy_user', JSON.stringify(data.data.user));

  return data.data;
}

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

  return data.data;
}

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
    }
  }

  localStorage.removeItem('hearthy_token');
  localStorage.removeItem('hearthy_user');
}


export function getCurrentUser() {
  try {
    const user = localStorage.getItem('hearthy_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('hearthy_token');
}

export function getToken() {
  return localStorage.getItem('hearthy_token');
}
