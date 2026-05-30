import { getToken } from './authService';

const BASE_URL = '/api/assessments';

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}


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



export async function getAssessments(limit = 100, offset = 0) {
  const res = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch assessments.');
  return data.data;
}

export async function getAssessmentSummary() {
  const res = await fetch(`${BASE_URL}/summary`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch assessment summary.');
  return data.data;
}


export async function getRecommendations() {
  const res = await fetch(`${BASE_URL}/recommendations`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch recommendations.');
  return data.data;
}


export async function getAssessmentById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch assessment details.');
  return data.data;
}


export async function deleteAssessment(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete assessment.');
  return data;
}
