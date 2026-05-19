/**
 * @fileoverview Modul Layanan Asesmen (Assessment Service).
 * Menyediakan fungsi-fungsi komunikasi dengan API untuk manajemen asesmen kesehatan,
 * termasuk pengiriman data skrining, prediksi risiko, dan pengambilan riwayat.
 */

import { getToken } from './authService';

const BASE_URL = '/api/assessments';

/**
 * Membuat header HTTP standar yang menyertakan token otorisasi (JWT).
 * @returns {Object} Objek *header* HTTP yang siap digunakan untuk *fetch*.
 */
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Menyimpan data asesmen kesehatan pengguna ke server.
 * @param {string} type - Jenis asesmen (misalnya: "cardiovascular").
 * @param {Object} answers - Kumpulan jawaban/data klinis dari pengguna.
 * @returns {Promise<Object>} Data asesmen yang berhasil disimpan.
 * @throws {Error} Jika proses pengiriman data gagal.
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
 * Meminta prediksi risiko kardiovaskular berdasarkan data klinis pengguna melalui model AI.
 * @param {Object} answers - Kumpulan data klinis dan gaya hidup pengguna.
 * @returns {Promise<Object>} Hasil prediksi risiko, skor, dan rekomendasi awal.
 * @throws {Error} Jika proses prediksi gagal.
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
 * Mengambil daftar riwayat asesmen yang pernah dilakukan oleh pengguna.
 * Tersedia fitur paginasi menggunakan `limit` dan `offset`.
 * @param {number} [limit=100] - Batas maksimal jumlah data yang diambil.
 * @param {number} [offset=0] - Titik awal (indeks) data untuk paginasi.
 * @returns {Promise<Array>} Daftar riwayat asesmen.
 * @throws {Error} Jika gagal mengambil data riwayat.
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
 * Mengambil ringkasan asesmen kesehatan pengguna untuk ditampilkan di Dashboard.
 * Biasanya berisi data terakhir, rata-rata skor, atau kondisi secara keseluruhan.
 * @returns {Promise<Object>} Data ringkasan asesmen.
 * @throws {Error} Jika gagal mengambil data ringkasan.
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
 * Mengambil rekomendasi medis/preventif secara umum atau berdasarkan profil pengguna.
 * @returns {Promise<Array>} Daftar rekomendasi.
 * @throws {Error} Jika gagal mengambil data rekomendasi.
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
 * Mengambil detail lengkap dari satu asesmen spesifik berdasarkan ID.
 * @param {string} id - UUID atau pengenal unik asesmen.
 * @returns {Promise<Object>} Detail asesmen, termasuk skor, jawaban, dan AI Insights.
 * @throws {Error} Jika data tidak ditemukan atau terjadi kesalahan server.
 */
export async function getAssessmentById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch assessment details.');
  return data.data;
}
