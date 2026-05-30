const createError = (message) => ({ error: { message } });

const validateRegister = ({ name, email, password } = {}) => {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return createError('Name must be at least 2 characters.');
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return createError('A valid email address is required.');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return createError('Password must be at least 6 characters.');
  }
  if (password.length > 100) {
    return createError('Password must not exceed 100 characters.');
  }
  return { error: null };
};

const validateLogin = ({ email, password } = {}) => {
  if (!email || typeof email !== 'string') {
    return createError('Email is required.');
  }
  if (!password || typeof password !== 'string') {
    return createError('Password is required.');
  }
  return { error: null };
};

const validateProfileUpdate = (data = {}) => {
  const { phone, address } = data;

  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string') return createError('Nomor telepon harus berupa teks.');
    if (!/^[\d\s\+\-\(\)]{7,20}$/.test(phone.trim())) {
      return createError('Nomor telepon tidak valid (7-20 karakter, boleh berisi angka, +, -, spasi, kurung).');
    }
  }

  if (address !== undefined && address !== null && address !== '') {
    if (typeof address !== 'string') return createError('Alamat harus berupa teks.');
    if (address.trim().length > 500) return createError('Alamat maksimal 500 karakter.');
  }

  return { error: null };
};

const validatePasswordChange = ({ currentPassword, newPassword } = {}) => {
  if (!currentPassword || typeof currentPassword !== 'string') {
    return createError('Current password is required.');
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return createError('New password must be at least 6 characters.');
  }
  if (newPassword === currentPassword) {
    return createError('New password must be different from the current password.');
  }
  return { error: null };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
};
