import { getToken } from './authService';

const BASE_URL = '/api/assessments';

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Submit an assessment
 * @param {string} type
 * @param {object} answers
 */
export async function createAssessment(type, answers) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ type, answers }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit assessment.');
  return data.data;
}

/**
 * Submit a cardiovascular prediction assessment
 * @param {object} answers
 */
export async function predictCardiovascularRisk(answers) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ answers }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to predict risk.');
  return data.data;
}

/**
 * Get all assessments (for history)
 * @param {number} limit 
 * @param {number} offset 
 */
export async function getAssessments(limit = 100, offset = 0) {
  const res = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch assessments.');
  return data.data;
}

/**
 * Get assessment summary (for dashboard)
 */
export async function getAssessmentSummary() {
  const res = await fetch(`${BASE_URL}/summary`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch assessment summary.');
  return data.data;
}

/**
 * Get recommendations
 */
export async function getRecommendations() {
  const res = await fetch(`${BASE_URL}/recommendations`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch recommendations.');
  return data.data;
}

/**
 * Get assessment by ID
 * @param {string} id 
 */
export async function getAssessmentById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch assessment details.');
  return data.data;
}
