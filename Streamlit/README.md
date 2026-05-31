# Dashboard Risiko Penyakit Jantung

Dashboard ini dibuat menggunakan **Streamlit** untuk menganalisis risiko penyakit jantung berdasarkan faktor klinis dan gaya hidup pasien. Dashboard menampilkan ringkasan data, visualisasi risiko, hubungan antar fitur numerik, serta prioritas edukasi pencegahan berdasarkan hasil analisis.

## Link Dashboard

Dashboard dapat diakses secara online melalui link berikut:

```text
https://capstonedasboardheart.streamlit.app/
```

## Deskripsi Project

Project ini bertujuan untuk membantu memahami pola risiko penyakit jantung pada pasien berdasarkan beberapa indikator, seperti usia, BMI, tekanan darah, kolesterol, aktivitas fisik, durasi tidur, kualitas diet, konsumsi alkohol, dan skor risiko penyakit jantung.

Dashboard ini dirancang agar pengguna dapat melakukan eksplorasi data secara interaktif melalui filter dan visualisasi yang mudah dipahami.

## Fitur Dashboard

Dashboard memiliki beberapa fitur utama:

1. **Filter Data Interaktif**

   * Filter kategori risiko: Low, Medium, High
   * Filter riwayat keluarga penyakit jantung
   * Filter kelompok usia
   * Filter rentang BMI menggunakan slider

2. **KPI Ringkasan**

   * Jumlah pasien
   * Rata-rata kolesterol
   * Rata-rata langkah harian
   * Rata-rata heart disease risk score
   * Rata-rata aktivitas fisik per minggu

3. **Visualisasi Dashboard Utama**

   * Persentase pasien per kategori risiko
   * Distribusi heart risk score berdasarkan kelompok usia
   * Rata-rata tekanan darah, kolesterol, dan heart risk
   * Proporsi riwayat keluarga penyakit jantung
   * Fitur yang menonjol pada pasien High Risk
   * Pola gaya hidup berdasarkan kategori risiko

4. **Relationship Features**

   * Menampilkan hubungan antara fitur numerik dengan `heart_disease_risk_score`
   * Grafik menggunakan scatter plot dan garis tren

5. **Prioritas Edukasi Pencegahan**

   * Menampilkan rekomendasi edukasi berdasarkan pola risiko pasien

## Dataset

Dataset yang digunakan adalah file:

```text
cardiovascular_risk_dataset_clean.csv
```

Dataset berisi informasi pasien terkait faktor klinis, gaya hidup, dan kategori risiko penyakit jantung.

Beberapa kolom penting yang digunakan dalam dashboard:

```text
age
bmi
systolic_bp
diastolic_bp
cholesterol_mg_dl
daily_steps
physical_activity_hours_per_week
sleep_hours
diet_quality_score
alcohol_units_per_week
family_history_heart_disease
risk_category
heart_disease_risk_score
```

## Struktur Halaman Dashboard

Dashboard dibagi menjadi tiga menu utama:

### 1. Dashboard

Menu ini menampilkan ringkasan utama analisis risiko penyakit jantung. Di dalamnya terdapat KPI, grafik proporsi risiko, grafik klinis, fitur pembeda pasien High Risk, serta visualisasi pola gaya hidup.

### 2. Relationship Features

Menu ini digunakan untuk melihat hubungan antara fitur numerik dengan skor risiko penyakit jantung. Tujuannya adalah membantu memahami fitur mana yang memiliki kecenderungan hubungan terhadap peningkatan risiko.

### 3. Prioritas Edukasi

Menu ini berisi poin-poin edukasi pencegahan yang dapat menjadi rekomendasi untuk pasien, terutama kelompok dengan risiko tinggi.

## Visualisasi yang Digunakan

Beberapa jenis visualisasi yang digunakan dalam dashboard:

* Donut chart untuk proporsi kategori risiko
* Boxplot untuk distribusi skor risiko berdasarkan kelompok usia
* Grouped bar chart untuk indikator klinis
* Stacked horizontal bar chart untuk riwayat keluarga
* Diverging bar chart untuk fitur menonjol pasien High Risk
* Progress bar dan gauge chart untuk pola gaya hidup
* Scatter matrix untuk relationship features

## Tools dan Library

Project ini menggunakan beberapa library Python:

```python
streamlit
pandas
numpy
plotly
```

## Cara Menjalankan Dashboard Secara Lokal

### 1. Install library yang dibutuhkan

Jalankan perintah berikut di terminal:

```bash
pip install streamlit pandas numpy plotly
```

### 2. Siapkan dataset

Letakkan file dataset pada folder project. Pastikan path dataset pada kode sudah sesuai.

Contoh:

```python
DATA_PATH = r"C:\Users\HP\Downloads\NEW DASHBOARD CAPSTONE\cardiovascular_risk_dataset_clean.csv"
```

Jika file dataset berada di folder yang sama dengan `app.py`, path dapat diganti menjadi:

```python
DATA_PATH = "cardiovascular_risk_dataset_clean.csv"
```

### 3. Jalankan aplikasi Streamlit

Gunakan perintah berikut:

```bash
streamlit run app.py
```

Setelah itu, dashboard akan terbuka melalui browser pada alamat lokal Streamlit.

## Struktur File Project

Contoh struktur folder project:

```text
NEW DASHBOARD CAPSTONE/
│
├── app.py
├── cardiovascular_risk_dataset_clean.csv
├── requirements.txt
└── README.md
```

## Cara Menggunakan Dashboard

1. Buka dashboard melalui link online atau jalankan secara lokal.
2. Pilih menu pada bagian kiri dashboard.
3. Gunakan filter untuk menyesuaikan data yang ingin dianalisis.
4. Amati perubahan KPI dan grafik berdasarkan filter aktif.
5. Gunakan halaman Relationship Features untuk melihat hubungan antar variabel numerik.
6. Gunakan halaman Prioritas Edukasi untuk melihat rekomendasi pencegahan.

## Tujuan Analisis

Dashboard ini dibuat untuk menjawab beberapa kebutuhan analisis, antara lain:

* Mengetahui distribusi pasien berdasarkan kategori risiko penyakit jantung.
* Mengidentifikasi kelompok usia dengan skor risiko yang lebih tinggi.
* Membandingkan indikator klinis antar kategori risiko.
* Melihat pola gaya hidup pasien berdasarkan tingkat risiko.
* Mengidentifikasi fitur yang paling menonjol pada pasien High Risk.
* Memberikan rekomendasi edukasi pencegahan berbasis data.

## Catatan

Dashboard ini digunakan untuk keperluan analisis data dan visualisasi. Hasil yang ditampilkan bergantung pada dataset yang digunakan. Interpretasi medis lebih lanjut tetap membutuhkan validasi dari tenaga kesehatan atau pihak ahli terkait.
