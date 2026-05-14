/**
 * validators.js — Input validation helpers for Hearthy API.
 * Uses plain JS (no external library) for lightweight validation.
 */

const createError = (message) => ({ error: { message } });

// ── Auth Validators ───────────────────────────────────────────────────────────

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

// ── Profile Validator ─────────────────────────────────────────────────────────

const VALID_GENDERS        = ['male', 'female', 'non-binary', 'prefer_not_to_say'];
const VALID_BLOOD_TYPES    = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_ACTIVITY_LEVELS= ['sedentary', 'lightly_active', 'moderate', 'very_active', 'extra_active'];

const validateProfileUpdate = (data = {}) => {
  const { age, gender, height, weight, blood_type, activity_level } = data;

  if (age !== undefined) {
    const n = Number(age);
    if (isNaN(n) || n < 1 || n > 150) return createError('Age must be between 1 and 150.');
  }
  if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
    return createError(`Gender must be one of: ${VALID_GENDERS.join(', ')}`);
  }
  if (height !== undefined) {
    const n = Number(height);
    if (isNaN(n) || n < 50 || n > 300) return createError('Height must be between 50 and 300 cm.');
  }
  if (weight !== undefined) {
    const n = Number(weight);
    if (isNaN(n) || n < 1 || n > 700) return createError('Weight must be between 1 and 700 kg.');
  }
  if (blood_type !== undefined && !VALID_BLOOD_TYPES.includes(blood_type)) {
    return createError(`Blood type must be one of: ${VALID_BLOOD_TYPES.join(', ')}`);
  }
  if (activity_level !== undefined && !VALID_ACTIVITY_LEVELS.includes(activity_level)) {
    return createError(`Activity level must be one of: ${VALID_ACTIVITY_LEVELS.join(', ')}`);
  }
  return { error: null };
};

// ── Password Change Validator ─────────────────────────────────────────────────

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
