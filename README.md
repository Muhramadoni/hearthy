# Dokumentasi Setup Proyek Hearthy

## 1. Penjelasan Tentang Website dan Tujuannya
Hearthy adalah platform *preventive healthcare* berbasis web yang dirancang untuk membantu pengguna memantau dan mendeteksi risiko penyakit, khususnya penyakit kardiovaskular. Dengan memanfaatkan teknologi *Machine Learning* dan *Artificial Intelligence* (AI), Hearthy menyediakan hasil analisis instan, wawasan (*insights*) kesehatan yang personal, serta chatbot interaktif yang siap memberikan edukasi pencegahan. Tujuannya adalah untuk meningkatkan kesadaran masyarakat akan pentingnya gaya hidup sehat serta memberikan sarana deteksi dini yang mudah diakses.

## 2. Persyaratan Sistem
Sebelum memulai setup proyek, pastikan perangkat Anda telah memenuhi persyaratan berikut:
* **Node.js** (Minimal versi 18.x) - Untuk menjalankan Frontend dan Backend API.
* **PostgreSQL** (Minimal versi 14.x) - Sebagai database utama penyimpan data.
* **Python** (Minimal versi 3.8+) - Untuk menjalankan model AI (FastAPI) dan Dashboard (Streamlit).
* **Git** (Opsional) - Untuk kebutuhan version control.

## 3. Setup Database
Proses ini mencakup pembuatan user, memberikan izin akses, serta membuat database dan tabel yang dibutuhkan.

1. Buka terminal PostgreSQL (`psql`) atau pgAdmin:
   ```bash
   psql -U postgres
   ```
2. Buat *user* baru dan berikan akses (*password* dapat disesuaikan):
   ```sql
   CREATE USER hearthy WITH PASSWORD 'password_pilihan_anda';
   ```
3. Buat database baru bernama `hearthy_db`:
   ```sql
   CREATE DATABASE hearthy_db;
   ```
4. Berikan izin akses penuh ke *user* yang baru dibuat:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE hearthy_db TO hearthy;
   ```
5. Untuk pembuatan tabel, kita akan menggunakan fitur migrasi di backend (dijelaskan pada langkah Setup Backend selanjutnya).

## 4. Setup Backend
Backend aplikasi Hearthy dibangun menggunakan Node.js dan Express.

1. Buka terminal dan masuk ke folder `backend-api`:
   ```bash
   cd backend-api
   ```
2. Instal semua dependensi Node.js:
   ```bash
   npm install
   ```
3. Buat file `.env` di dalam folder `backend-api` dan isi sesuai kredensial database yang sudah dibuat pada langkah 3:
   ```env
   PORT=5000
   DB_USER=
   DB_PASSWORD=
   DB_HOST=localhost
   DB_NAME=
   DB_PORT=
   JWT_SECRET=
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```
4. Jalankan migrasi untuk membuat tabel secara otomatis di database:
   ```bash
   npm run migrate:up
   ```

## 5. Setup Frontend
Frontend Hearthy dibangun menggunakan React.js dan Vite.

1. Buka terminal baru dan masuk ke folder `frontend-app`:
   ```bash
   cd frontend-app
   ```
2. Instal semua dependensi frontend:
   ```bash
   npm install
   ```
3. (Opsional) Jika perlu mengubah URL API, buat file `.env` di dalam `frontend-app` (URL secara default sudah diset untuk lokal):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## 6. Setup Streamlit
Streamlit digunakan untuk menampilkan dashboard analitik data Cardiovascular Risk Analysis.

1. Buka terminal baru dan masuk ke folder proyek utama.
2. Pastikan Python sudah terinstal. Instal dependensi yang diperlukan melalui `requirements.txt` (jika ada) atau instal manual:
   ```bash
   pip install streamlit pandas plotly scikit-learn numpy joblib
   ```

## 7. Setup AI (FastAPI)
AI dijalankan menggunakan FastAPI sebagai service independen.

1. Buka terminal baru di root folder proyek (`hearthy`).
2. Instal dependensi Python tambahan yang dibutuhkan untuk backend AI:
   ```bash
   pip install -r requirements.txt

   ```bash
   cp .env.example .env

   ```bash
   pip install fastapi uvicorn pydantic python-dotenv google-generativeai
   ```
3. Konfigurasi file `.env` di *root folder* (atau sesuai arahan) dan pastikan *API Key* Google Gemini / provider lain sudah diisi.

## 8. Running Projek
Agar aplikasi Hearthy berjalan secara utuh (Frontend, Backend, AI API, dan Streamlit), jalankan semua servis ini secara bersamaan di terminal yang berbeda-beda:

* **Terminal 1 (Backend Node.js)**:
  ```bash
  cd backend-api
  npm run dev
  ```
  *(Berjalan di http://localhost:5000)*

* **Terminal 2 (Frontend React/Vite)**:
  ```bash
  cd frontend-app
  npm run dev
  ```
  *(Berjalan di http://localhost:5173)*

* **Terminal 3 (AI Chatbot FastAPI)**:
  ```bash
  uvicorn app.main:app --reload
  ```
  *(Berjalan di http://localhost:8000)*

* **Terminal 4 (Streamlit Dashboard)**:
  ```bash
  cd Streamlit
  streamlit run app.py
  ```
  *(Biasanya berjalan di http://localhost:8501)*

## 9. Struktur Folder dan File Beserta Fungsinya
Berikut adalah ringkasan struktur folder utama dalam proyek Hearthy dan fungsinya:

```text
hearthy/
├── app/                   # Root folder untuk API AI/Machine Learning (FastAPI)
│   └── main.py            # Entry point FastAPI untuk servis Chatbot AI
├── backend-api/           # Root folder untuk Backend API Node.js (Auth, Data, dll)
│   ├── controllers/       # Logika bisnis (menangani fungsi request & response)
│   ├── database/          # Skrip migrasi dan konfigurasi pool koneksi PostgreSQL
│   ├── models/            # Skrip akses data / query langsung ke database
│   ├── routes/            # Definisi endpoint (URL path dan middleware)
│   └── package.json       # Daftar dependensi dan scripts Node.js backend
├── frontend-app/          # Root folder untuk Klien Antarmuka (Frontend React.js)
│   ├── src/
│   │   ├── components/    # Reusable komponen UI (Navbar, Chatbot widget, dll)
│   │   ├── page/          # Halaman-halaman utama aplikasi (Dashboard, Assessment, Login, dll)
│   │   ├── services/      # Fungsi pemanggil API ke Backend Node.js
│   │   └── App.jsx        # Routing dan konfigurasi navigasi halaman utama
│   └── package.json       # Daftar dependensi dan scripts Node.js frontend
├── Streamlit/             # Root folder untuk aplikasi analitik / dashboard data
│   └── app.py             # Entry point dashboard visualisasi data menggunakan Streamlit
└── README.md         # File panduan dan dokumentasi setup proyek ini
```
