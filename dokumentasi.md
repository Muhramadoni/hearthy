# Dokumentasi Setup Proyek Hearthy

Hearthy adalah platform *preventive healthcare* berbasis web yang menggunakan teknologi *Deep Learning* dan *Machine Learning* untuk mendeteksi dini risiko penyakit kardiovaskular secara instan.

Proyek ini terdiri dari dua bagian utama:
1. **Frontend**: React.js dengan Vite dan Tailwind CSS v4.
2. **Backend**: Node.js (Express), PostgreSQL, dan skrip Python untuk integrasi *Artificial Intelligence* (AI).

---

## 1. Persyaratan Sistem (Prerequisites)
Pastikan sistem Anda sudah terinstal perangkat lunak berikut sebelum memulai:
* **Node.js** (Minimal versi 18.x)
* **PostgreSQL** (Minimal versi 14.x)
* **Python** (Minimal versi 3.8+)
* **Git** (Opsional, untuk *version control*)

---

## 2. Setup Database (PostgreSQL)
1. Buka terminal PostgreSQL Anda (pgAdmin atau `psql`).
2. Buat database baru untuk proyek ini:
   ```sql
   CREATE DATABASE hearthy_db;
   ```
   *(Catat username dan password PostgreSQL Anda, secara default biasanya `postgres`)*

---

## 3. Setup Backend API
Backend berada di dalam folder `backend-api`.

### Langkah-langkah:
1. Buka terminal dan masuk ke folder backend:
   ```bash
   cd backend-api
   ```
2. Instal semua dependensi Node.js:
   ```bash
   npm install
   ```
3. Konfigurasi Environment Variables:
   * Buat file bernama `.env` di dalam folder `backend-api`.
   * Salin konfigurasi berikut dan sesuaikan `DB_USER` dan `DB_PASSWORD` dengan kredensial PostgreSQL Anda:
     ```env
     PORT=5000
     DB_USER=postgres
     DB_PASSWORD=password_anda
     DB_HOST=localhost
     DB_NAME=hearthy_db
     DB_PORT=5432
     JWT_SECRET=hearthy_secret_key_2024_change_this_in_production
     JWT_EXPIRES_IN=7d
     NODE_ENV=development
     FRONTEND_URL=http://localhost:5173
     ```
4. Jalankan Migrasi Database (Untuk membuat tabel secara otomatis):
   ```bash
   npm run migrate:up
   ```
5. Setup *Environment* Python untuk AI (Machine Learning):
   * Pastikan `pip` sudah terinstal. Instal library Python yang dibutuhkan oleh model AI:
     ```bash
     pip install scikit-learn pandas numpy joblib
     ```
6. Jalankan Server Backend:
   ```bash
   npm run dev
   ```
   *Backend akan berjalan di `http://localhost:5000`.*

---

## 4. Setup Frontend App
Frontend berada di dalam folder `frontend-app`.

### Langkah-langkah:
1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend-app
   ```
2. Instal semua dependensi React & Vite:
   ```bash
   npm install
   ```
3. Konfigurasi Environment Variables (Opsional):
   * Jika Anda perlu mengubah URL API, buat file `.env` di folder `frontend-app` dan tambahkan:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```
4. Jalankan Server Frontend:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di `http://localhost:5173`.*

---

## 5. Menjalankan Aplikasi Secara Bersamaan
Untuk mempermudah pengembangan, Anda disarankan menggunakan dua terminal yang berjalan secara bersamaan:

* **Terminal 1**: Berada di folder `backend-api` menjalankan `npm run dev`
* **Terminal 2**: Berada di folder `frontend-app` menjalankan `npm run dev`

Buka browser Anda dan kunjungi `http://localhost:5173` untuk mengakses web Hearthy!

---

## Struktur Folder Utama
```text
hearthy/
├── backend-api/           # Server Node.js
│   ├── ai/                # Model Machine Learning & Skrip Python
│   ├── controllers/       # Logika bisnis API
│   ├── database/          # Migrasi & koneksi PostgreSQL
│   ├── models/            # Model akses data (Query SQL)
│   ├── routes/            # Definisi endpoint API (Express Router)
│   └── package.json
│
├── frontend-app/          # Klien React.js
│   ├── src/
│   │   ├── components/    # Komponen React (Navbar, Chatbot, dll)
│   │   ├── page/          # Halaman Utama (Dashboard, Assessment, dll)
│   │   ├── services/      # Fungsi pemanggil API (Axios/Fetch)
│   │   └── App.jsx        # Pengatur Routing Utama
│   └── package.json
└── dokumentasi.md         # File ini
```
