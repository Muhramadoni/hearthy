# hearthy

# history page

tolong buatkan history page dengan kriteria dibawah ini, buat agar desain 100% sama dengan gambar yang diberikan:

Task: Implementasikan halaman "History" berdasarkan deskripsi desain berikut menggunakan React dan Tailwind CSS.

Spesifikasi Header:

Navbar putih bersih dengan shadow halus. Logo "Hearthy" di kiri, menu navigasi (Dashboard, Assessment, History) di tengah, dan profil pengguna (Ramadoni + Icon) di kanan.

Menu "History" harus memiliki indikator aktif (font-bold dan warna biru gelap).

Spesifikasi Konten Utama:

Judul: "Semua History" (Bold, Large) dengan deskripsi kecil di bawahnya.

Filter: Tambahkan baris berisi input tanggal (placeholder: DD/MM/YYYY) dan tombol "Filter" berwarna biru gelap (#1e293b) di sisi kanan.

Struktur Grid History:

Kelompokkan data berdasarkan bulan (April 2026, Maret 2026, Februari 2026).

Gunakan layout 3 kolom grid untuk kartu history.

Spesifikasi Kartu (Card):

Background putih, rounded corners (lg), dengan drop shadow lembut.

Padding dalam yang cukup.

Baris Atas: Icon dokumen/jam di kiri, diikuti teks tanggal (contoh: "24 April 2026") dengan font bold.

Baris Bawah: Jam (contoh: "12.00 WIB") di sisi kiri, dan link teks "Lihat Selengkapnya" berwarna biru di sisi kanan.

Warna & Font:

Gunakan font Sans-serif yang bersih yaitu poppins.

Warna teks utama: Hitam/Abu-abu gelap (#1f2937).

Warna aksen biru untuk link dan tombol filter.

icon yang digunakan:
icon-user.svg
icon-laporan.svg
icon-kalender.svg

# login

tolong buatkan login page dengan kriteria dibawah ini, buat agar desain 100% sama dengan gambar yang diberikan:

Task: Implementasikan halaman Login berdasarkan gambar yang saya berikan menggunakan React dan Tailwind CSS.

Layout & Background:

Gunakan background putih bersih untuk seluruh halaman.

Gunakan layout flexbox atau grid untuk membagi halaman menjadi dua bagian utama secara horizontal (gambar doctor-image di kiri, Form di kanan).

Letakkan logo "Hearthy" di pojok kiri atas dengan padding yang cukup.

Spesifikasi Ilustrasi (Kiri):

Tampilkan karakter 3D dokter di sisi kiri (gunakan placeholder image atau tag <img> dengan object-contain).

Pastikan karakter dokter terlihat "menunjuk" ke arah form login.

Spesifikasi Form Login (Kanan):

Container: Form berada di dalam kartu putih dengan rounded corners (xl) dan soft shadow. Berikan padding yang luas di dalam kartu.

Header: Teks "Login" di tengah atas dengan font bold dan ukuran besar.

Input Fields:

Label "Email" dan "Password" di atas masing-masing input.

Input box dengan border abu-abu muda, rounded, dan placeholder teks yang soft.

Tambahkan icon "eye" (show/hide password) di dalam input password sebelah kanan.

Opsi Tambahan: Sejajarkan checkbox "Ingat saya" di kiri dan link "Lupa password?" berwarna biru di kanan bawah input password.

Button: Tombol "Masuk" berwarna biru gelap (#1e3a5a), lebar penuh (width full), dengan teks putih.

Footer Form: Teks "Belum punya akun? Daftar sekarang" di bagian paling bawah kartu dengan link "Daftar sekarang" berwarna biru.

Spesifikasi Teknis:

Pastikan desain responsif: Di layar kecil (mobile), ilustrasi dokter menghilang atau berada di atas form, dan form menjadi lebar penuh.

Gunakan font Sans-serif yang modern yaitu popins.

# dashboard

Task: Bangun halaman "Dashboard" sesuai desain gambar menggunakan React dan Tailwind CSS. Untuk grafik, gunakan library Chart.js atau Recharts.

Layout Konten Utama:

Header Info: Tampilkan "Status Risiko" (dengan badge merah bertuliskan "Tinggi"), "Skor Risiko" (teks merah besar 90%), dan "Pengecekan Terakhir" dalam layout 3 kolom yang sejajar secara horizontal.

Grid Sistem (Middle Section):

Gunakan layout grid di mana sisi kiri berisi 4 kartu kecil (Tekanan Darah, Detak Jantung, BMI, Kolesterol) dalam format 2x2.

Sisi kanan berisi kartu besar untuk Grafik (Line Chart).

Spesifikasi Kartu Metrik (Kiri):

Kartu putih, rounded, shadow halus.

Judul metrik di kiri atas (misal: "Tekanan darah").

Angka besar di tengah (misal: "100 /90").

Badge satuan di kiri bawah (misal: "mmHg") dengan background biru gelap dan teks putih.

Spesifikasi Kartu Grafik (Kanan):

Judul grafik: "Tren Kesehatan Jantung - Hearthy".

Tambahkan dropdown filter di pojok kanan atas grafik (contoh: "Hari ini").

Implementasikan line chart dengan garis merah dan titik-titik data (pointer).

Grid Sistem (Bottom Section):

Kartu Rekomendasi (Kiri): Kartu lebar berisi judul "Rekomendasi" dan blok teks berwarna abu-abu muda di dalamnya untuk saran kesehatan.

Kartu Penyebab (Kanan): Kartu berisi list item. Setiap item memiliki bullet point besar berwarna biru gelap dengan teks seperti "Pola Makan Tidak Seimbang", "Kurangnya Aktivitas Fisik", dll.

Warna & Tipografi:

Teks utama: Hitam/Abu-abu gelap.

Aksen Merah: #dc2626 (untuk status bahaya/tinggi).

Aksen Biru Gelap: #1e3a5a (untuk badge dan tombol).

Font: Sans-serif (Inter atau Roboto).

Responsivitas: Pastikan kartu metrik bertumpuk secara vertikal dan grafik menyesuaikan lebar layar pada perangkat mobile.

# asesment

Task: Buat halaman form "Assessment" sesuai desain gambar menggunakan React dan Tailwind CSS.

Layout Utama:

Gunakan layout 2 kolom grid untuk membungkus dua kartu utama: "Profil & Kondisi fisik" di kiri dan "Pola Aktivitas" di kanan.

Berikan jarak (gap) yang cukup antar kolom.

Spesifikasi Kartu Form:

Setiap bagian dibungkus dalam kartu putih dengan rounded-xl dan shadow lembut.

Header Bagian: Gunakan icon di dalam kotak biru kecil di sebelah judul bagian (misal: Icon Orang untuk Profil, Icon Jantung untuk Aktivitas).

Komponen Input (Kolom Kiri - Profil):

Buat input field untuk: Usia, BMI, Tekanan darah, Kolestrol, dan Detak jantung.

Setiap input memiliki label di atasnya dengan font semi-bold.

Gunakan placeholder teks yang deskriptif dan berwarna abu-abu muda (contoh: "Contoh < 200").

Komponen Input (Kolom Kanan - Aktivitas):

Riwayat penyakit keluarga: Implementasikan sebagai button toggle (Ya / Tidak). Tombol yang tidak terpilih memiliki border abu-abu.

Tingkatan diet & Level stress: Gunakan komponen Select/Dropdown dengan icon panah bawah.

Lainnya: Gunakan input teks standar untuk Konsumsi alcohol, Langkah per-hari, Jam aktivitas fisik, dan Durasi tidur.

Footer & Action Buttons:

Letakkan tombol aksi di pojok kanan bawah halaman.

Tombol Utama: "Simpan dan lihat hasil" dengan background biru gelap (#1e3a5a) dan teks putih.

Tombol Sekunder: "Lihat ringkasan" dengan background abu-abu muda dan teks hitam.

Styling Detail:

Semua input field memiliki border tipis, rounded, dan padding yang nyaman.

Gunakan font Sans-serif yang konsisten dengan halaman sebelumnya (Hearthy).

Pastikan form bersifat responsif (menjadi 1 kolom di layar mobile).

# reset

Task: Implementasikan halaman "Reset Password" menggunakan React dan Tailwind CSS, dengan layout yang konsisten seperti halaman Login sebelumnya.

Layout & Branding:

Gunakan layout dua kolom: Sisi kiri berisi ilustrasi karakter dokter 3D (menunjuk ke arah form), dan sisi kanan berisi kartu form.

Tempatkan logo "Hearthy" di pojok kiri atas.

Spesifikasi Form Reset Password (Kanan):

Container: Kartu putih dengan rounded-xl, padding besar, dan soft shadow.

Header: Judul "Reset Password" di tengah dengan font bold.

Input Fields: > \* Buat dua field: "Password baru" dan "Konfirmasi password baru".

Setiap input harus memiliki icon "eye" (visibility toggle) di sisi kanan dalam input box.

Gunakan placeholder teks yang tipis (contoh: "Masukkan password baru" dan "Konfirmasi password baru anda").

Button: Tombol "Reset password" berwarna biru gelap (#1e3a5a) dengan lebar penuh (width full) dan teks putih.

Footer Link: Tambahkan link "Kembali ke halaman login" di bawah tombol dengan warna biru, diposisikan di tengah (center-aligned).

Spesifikasi Teknis:

Pastikan desain responsif: Di layar mobile, ilustrasi dokter disembunyikan dan kartu form mengambil lebar penuh.

Gunakan font Sans-serif yang modern dan bersih.

Implementasikan logika state sederhana untuk toggle visibility password (show/hide).
