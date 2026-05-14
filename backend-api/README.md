# Hearthy Backend API

Backend API untuk proyek Hearthy menggunakan Node.js, Express, dan PostgreSQL.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Setup PostgreSQL database:
   - Buat database baru bernama `hearthy_db`:
     ```sql
     CREATE DATABASE hearthy_db;
     ```
   - Jalankan migration:
     ```bash
     npm run migrate
     ```
     Untuk rollback:
     ```bash
     npm run migrate:down
     ```

3. Konfigurasi environment:
   - Copy `.env` dan isi dengan kredensial database Anda

4. Jalankan server:
   ```bash
   npm start
   ```

## API Endpoints

### POST /api/predict

Menerima data klinis dan mengembalikan prediksi kesehatan jantung.

**Request Body:**

```json
{
  "usia": 45,
  "bmi": 25.5,
  "tekanan_darah": 120,
  "kolesterol": 180,
  "detak_jantung": 75,
  "riwayat_keluarga": true,
  "tingkat_diet": "sehat",
  "alkohol_per_minggu": 5,
  "langkah_harian": 8000,
  "level_stress": "sedang",
  "jam_aktivitas_fisik": 2.5,
  "durasi_tidur": 7.0
}
```

**Response:**

```json
{
  "message": "Prediction saved successfully",
  "data": {
    "id": 1,
    "usia": 45,
    "bmi": 25.5,
    "tekanan_darah": 120,
    "kolesterol": 180,
    "detak_jantung": 75,
    "riwayat_keluarga": true,
    "tingkat_diet": "sehat",
    "alkohol_per_minggu": 5,
    "langkah_harian": 8000,
    "level_stress": "sedang",
    "jam_aktivitas_fisik": 2.5,
    "durasi_tidur": 7.0,
    "hasil_prediksi": "Low Risk",
    "confidence_score": 0.8,
    "created_at": "2023-10-01T10:00:00.000Z"
  }
}
```

## Struktur Folder

- `src/config/` - Konfigurasi database
- `src/controllers/` - Controller untuk logika bisnis
- `src/routes/` - Definisi routes API
- `src/services/` - Service layer untuk interaksi database
- `src/migrations/` - Script migrasi database (format up/down)

## Migration System

Migrations menggunakan format JavaScript dengan fungsi `up` dan `down`:

```javascript
// src/migrations/001_create_health_predictions.js
const up = async (pool) => {
  // SQL untuk create table
};

const down = async (pool) => {
  // SQL untuk drop table
};

module.exports = { up, down };
```

Commands:

- `npm run migrate` - Jalankan semua migrations yang belum dieksekusi
- `npm run migrate:down` - Rollback semua migrations

## Dummy AI Logic

Saat ini menggunakan logika dummy:

- Jika kolesterol > 200 atau tekanan_darah > 140: "High Risk"
- Jika tidak: "Low Risk"

Logika ini dapat diganti dengan model AI yang sebenarnya.
