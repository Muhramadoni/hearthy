/**
 * @fileoverview Modul Rekomendasi Medis untuk Risiko Kardiovaskular.
 * Menghasilkan rekomendasi berbasis standar kesehatan internasional
 * seperti AHA/ACC, WHO, dan National Sleep Foundation berdasarkan input pengguna.
 */

/**
 * Menghasilkan rekomendasi klinis berdasarkan parameter kesehatan.
 * Berdasarkan logika notebook Python "Salinan dari Salinan dari percobaan 1.ipynb".
 * 
 * @param {Object} userInput - Input parameter kesehatan pengguna.
 * @returns {Object} Kumpulan rekomendasi (urgent, warning, good).
 */
const generateCardioRecommendations = (userInput) => {
  const urgent = [];
  const warning = [];
  const good = [];

  // Tekanan darah sistolik
  const sysBp = userInput.systolic_bp || 0;
  if (sysBp >= 140) {
    urgent.push({
      parameter: 'Tekanan Darah Sistolik',
      kondisi: `${sysBp} mmHg — Hipertensi Stage 2`,
      rekomendasi: [
        'Kurangi konsumsi garam (sodium) di bawah 1.500 mg/hari.',
        'Terapkan diet DASH (perbanyak buah, sayur, biji-bijian, rendah lemak jenuh).',
        'Olahraga aerobik minimal 30 menit/hari, 5 hari/minggu.',
        'Hindari rokok dan batasi kafein.',
        'Segera konsultasi dokter untuk evaluasi obat antihipertensi.'
      ],
      sumber: 'AHA/ACC 2017 Hypertension Guidelines'
    });
  } else if (sysBp >= 130) {
    warning.push({
      parameter: 'Tekanan Darah Sistolik',
      kondisi: `${sysBp} mmHg — Hipertensi Stage 1`,
      rekomendasi: [
        'Mulai terapkan diet DASH secara bertahap.',
        'Kurangi konsumsi garam bertahap ke bawah 2.300 mg/hari.',
        'Tambah aktivitas fisik ringan-sedang secara rutin.'
      ],
      sumber: 'AHA/ACC 2017 Hypertension Guidelines'
    });
  } else if (sysBp >= 120) {
    warning.push({
      parameter: 'Tekanan Darah Sistolik',
      kondisi: `${sysBp} mmHg — Elevated`,
      rekomendasi: [
        'Jaga pola makan rendah garam.',
        'Pertahankan berat badan ideal.'
      ],
      sumber: 'AHA/ACC 2017 Hypertension Guidelines'
    });
  } else {
    good.push('Tekanan Darah Sistolik dalam batas normal.');
  }

  // Tekanan darah diastolik
  const diaBp = userInput.diastolic_bp || 0;
  if (diaBp >= 90) {
    urgent.push({
      parameter: 'Tekanan Darah Diastolik',
      kondisi: `${diaBp} mmHg — Hipertensi Stage 2`,
      rekomendasi: [
        'Segera konsultasi dokter — diastolik >=90 mmHg memerlukan evaluasi medis.',
        'Hindari stres berlebih dan istirahat cukup.',
        'Batasi konsumsi alkohol.'
      ],
      sumber: 'AHA/ACC 2017 Hypertension Guidelines'
    });
  } else if (diaBp >= 80) {
    warning.push({
      parameter: 'Tekanan Darah Diastolik',
      kondisi: `${diaBp} mmHg — Hipertensi Stage 1`,
      rekomendasi: [
        'Kelola stres dengan meditasi atau teknik relaksasi.',
        'Kurangi konsumsi alkohol.'
      ],
      sumber: 'AHA/ACC 2017 Hypertension Guidelines'
    });
  } else {
    good.push('Tekanan Darah Diastolik dalam batas normal.');
  }

  // Kolesterol
  const chol = userInput.cholesterol_mg_dl || 0;
  if (chol >= 240) {
    urgent.push({
      parameter: 'Kolesterol Total',
      kondisi: `${chol} mg/dL — Tinggi`,
      rekomendasi: [
        'Kurangi makanan tinggi lemak jenuh (daging merah, produk susu tinggi lemak).',
        'Perbanyak serat larut (oatmeal, kacang-kacangan, buah apel, pir).',
        'Konsumsi ikan berlemak (salmon, sarden) 2x seminggu untuk omega-3.',
        'Hindari makanan trans fat (gorengan, makanan olahan).',
        'Konsultasi dokter untuk pertimbangan terapi statin.'
      ],
      sumber: 'AHA/ACC 2018 Cholesterol Guidelines'
    });
  } else if (chol >= 200) {
    warning.push({
      parameter: 'Kolesterol Total',
      kondisi: `${chol} mg/dL — Borderline Tinggi`,
      rekomendasi: [
        'Mulai kurangi lemak jenuh dalam makanan sehari-hari.',
        'Tambah konsumsi serat dan sayuran hijau.',
        'Rutin periksa kolesterol setiap 6 bulan.'
      ],
      sumber: 'AHA/ACC 2018 Cholesterol Guidelines'
    });
  } else {
    good.push('Kolesterol Total dalam batas optimal.');
  }

  // BMI
  const bmi = userInput.bmi || 0;
  if (bmi >= 30) {
    urgent.push({
      parameter: 'BMI',
      kondisi: `${bmi.toFixed(1)} — Obesitas`,
      rekomendasi: [
        'Target penurunan berat badan 5-10% dari berat saat ini secara bertahap.',
        'Defisit kalori moderat (300-500 kkal/hari), hindari diet ekstrem.',
        'Kombinasikan latihan aerobik dan latihan kekuatan minimal 3x/minggu.',
        'Konsultasi ahli gizi untuk program diet yang aman.'
      ],
      sumber: 'AHA Lifestyle Guidelines & WHO BMI Classification'
    });
  } else if (bmi >= 25) {
    warning.push({
      parameter: 'BMI',
      kondisi: `${bmi.toFixed(1)} — Overweight`,
      rekomendasi: [
        'Perbanyak konsumsi sayur dan protein tanpa lemak.',
        'Kurangi makanan tinggi kalori kosong (minuman manis, snack olahan).',
        'Tambah aktivitas fisik harian minimal 30 menit/hari.'
      ],
      sumber: 'AHA Lifestyle Guidelines & WHO BMI Classification'
    });
  } else if (bmi > 0 && bmi < 18.5) {
    warning.push({
      parameter: 'BMI',
      kondisi: `${bmi.toFixed(1)} — Berat Badan Kurang`,
      rekomendasi: [
        'Tingkatkan asupan kalori dari sumber nutrisi padat gizi.',
        'Konsultasi dokter atau ahli gizi.'
      ],
      sumber: 'WHO BMI Classification'
    });
  } else {
    good.push(`BMI dalam batas normal (${bmi.toFixed(1)}).`);
  }

  // Aktivitas fisik
  const activity = userInput.physical_activity_hours_per_week || 0;
  const activityMin = activity * 60;
  if (activityMin < 75) {
    urgent.push({
      parameter: 'Aktivitas Fisik',
      kondisi: `${activity.toFixed(1)} jam/minggu — Sangat Kurang`,
      rekomendasi: [
        'Target minimal 150 menit/minggu aktivitas aerobik intensitas sedang.',
        'Mulai bertahap: jalan kaki 10 menit/hari, tingkatkan setiap minggu.',
        'Pilih aktivitas yang menyenangkan: bersepeda, renang, senam.',
        'Tambah latihan kekuatan (resistance training) 2x/minggu.'
      ],
      sumber: 'WHO Physical Activity Guidelines 2020'
    });
  } else if (activityMin < 150) {
    warning.push({
      parameter: 'Aktivitas Fisik',
      kondisi: `${activity.toFixed(1)} jam/minggu — Kurang dari rekomendasi`,
      rekomendasi: [
        'Tingkatkan durasi olahraga hingga 150 menit/minggu.',
        'Coba tambah 1 sesi olahraga per minggu secara bertahap.'
      ],
      sumber: 'WHO Physical Activity Guidelines 2020'
    });
  } else {
    good.push(`Aktivitas fisik sudah memenuhi rekomendasi WHO (${activity.toFixed(1)} jam/minggu).`);
  }

  // Langkah per hari
  const steps = userInput.daily_steps || 0;
  if (steps < 5000) {
    urgent.push({
      parameter: 'Langkah per Hari',
      kondisi: `${Math.floor(steps)} langkah — Kurang Aktif`,
      rekomendasi: [
        'Target minimal 7.500-10.000 langkah/hari.',
        'Gunakan tangga daripada lift, parkir lebih jauh.',
        'Jalan kaki saat istirahat makan siang 10-15 menit.'
      ],
      sumber: 'JAMA Internal Medicine 2021'
    });
  } else if (steps < 7500) {
    warning.push({
      parameter: 'Langkah per Hari',
      kondisi: `${Math.floor(steps)} langkah — Cukup Aktif`,
      rekomendasi: [
        'Tingkatkan ke 7.500-10.000 langkah/hari untuk manfaat optimal.'
      ],
      sumber: 'JAMA Internal Medicine 2021'
    });
  } else {
    good.push(`Jumlah langkah harian sudah baik (${Math.floor(steps)} langkah/hari).`);
  }

  // Tidur
  const sleep = userInput.sleep_hours || 0;
  if (sleep > 0 && sleep < 6) {
    urgent.push({
      parameter: 'Durasi Tidur',
      kondisi: `${sleep} jam/malam — Kurang`,
      rekomendasi: [
        'Target 7-9 jam tidur per malam untuk orang dewasa.',
        'Tetapkan jadwal tidur dan bangun yang konsisten setiap hari.',
        'Hindari layar gadget minimal 1 jam sebelum tidur.',
        'Ciptakan lingkungan tidur yang gelap, sejuk, dan tenang.'
      ],
      sumber: 'National Sleep Foundation 2015'
    });
  } else if (sleep > 9) {
    warning.push({
      parameter: 'Durasi Tidur',
      kondisi: `${sleep} jam/malam — Berlebihan`,
      rekomendasi: [
        'Tidur >9 jam dapat mengindikasikan masalah kesehatan tertentu.',
        'Konsultasi dokter jika sering merasa lelah meski tidur lama.'
      ],
      sumber: 'National Sleep Foundation 2015'
    });
  } else {
    good.push(`Durasi tidur normal (${sleep} jam/malam).`);
  }

  // Alkohol
  const alcohol = userInput.alcohol_units_per_week || 0;
  if (alcohol > 14) {
    urgent.push({
      parameter: 'Konsumsi Alkohol',
      kondisi: `${alcohol} unit/minggu — Tinggi (Berisiko)`,
      rekomendasi: [
        'Kurangi konsumsi alkohol secara bertahap.',
        'Target di bawah 14 unit/minggu, idealnya lebih rendah.',
        'Cari dukungan profesional jika sulit mengurangi sendiri.',
        'Alkohol berlebih meningkatkan risiko hipertensi dan kardiomiopati.'
      ],
      sumber: 'WHO Alcohol Guidelines'
    });
  } else if (alcohol > 7) {
    warning.push({
      parameter: 'Konsumsi Alkohol',
      kondisi: `${alcohol} unit/minggu — Sedang`,
      rekomendasi: [
        'Pertimbangkan untuk mengurangi ke bawah 7 unit/minggu.',
        'Selipkan hari-hari bebas alkohol dalam seminggu.'
      ],
      sumber: 'WHO Alcohol Guidelines'
    });
  } else {
    good.push('Konsumsi alkohol dalam batas aman.');
  }

  // Stres
  const stress = userInput.stress_level || 0;
  if (stress >= 7) {
    urgent.push({
      parameter: 'Tingkat Stres',
      kondisi: `${stress}/10 — Tinggi`,
      rekomendasi: [
        'Latihan pernapasan dalam (deep breathing) 5-10 menit/hari.',
        'Meditasi atau mindfulness minimal 10 menit/hari.',
        'Olahraga rutin terbukti signifikan menurunkan hormon stres.',
        'Batasi paparan berita negatif dan media sosial.',
        'Pertimbangkan konsultasi dengan psikolog atau konselor.'
      ],
      sumber: 'AHA Stress & Heart Disease'
    });
  } else if (stress >= 4) {
    warning.push({
      parameter: 'Tingkat Stres',
      kondisi: `${stress}/10 — Sedang`,
      rekomendasi: [
        'Luangkan waktu untuk hobi dan aktivitas relaksasi.',
        'Jaga keseimbangan kerja dan istirahat.'
      ],
      sumber: 'AHA Stress & Heart Disease'
    });
  } else {
    good.push(`Tingkat stres terkendali (${stress}/10).`);
  }

  // Diet quality
  const diet = userInput.diet_quality_score || 0;
  if (diet <= 3) {
    urgent.push({
      parameter: 'Kualitas Diet',
      kondisi: `${diet}/10 — Buruk`,
      rekomendasi: [
        'Perbanyak konsumsi buah dan sayuran minimal 5 porsi/hari.',
        'Kurangi makanan ultra-processed (mie instan, fast food, minuman manis).',
        'Ganti karbohidrat sederhana dengan karbohidrat kompleks (nasi merah, oat).',
        'Konsultasi ahli gizi untuk panduan diet yang terstruktur.'
      ],
      sumber: 'AHA Lifestyle Guidelines'
    });
  } else if (diet <= 6) {
    warning.push({
      parameter: 'Kualitas Diet',
      kondisi: `${diet}/10 — Cukup`,
      rekomendasi: [
        'Tingkatkan variasi sayuran dan buah dalam menu harian.',
        'Kurangi konsumsi gula tambahan dan garam berlebih.'
      ],
      sumber: 'AHA Lifestyle Guidelines'
    });
  } else {
    good.push(`Kualitas diet sudah baik (${diet}/10).`);
  }

  // Family history
  const familyHistory = userInput.family_history_heart_disease || 0;
  if (familyHistory === 1 || familyHistory === true || familyHistory === '1') {
    warning.push({
      parameter: 'Riwayat Keluarga',
      kondisi: 'Ada riwayat penyakit jantung dalam keluarga',
      rekomendasi: [
        'Lakukan skrining jantung rutin minimal 1x per tahun.',
        'Informasikan riwayat keluarga ke dokter untuk asesmen risiko genetik.',
        'Jaga semua parameter gaya hidup lebih ketat dari rata-rata orang.'
      ],
      sumber: 'AHA Family History & Heart Disease'
    });
  }

  return { urgent, warning, good };
};

/**
 * Format rekomendasi menjadi bentuk teks (String Array) untuk disimpan di database.
 * @param {Object} recs - Objek rekomendasi (urgent, warning, good).
 * @returns {Array<string>} Array string rekomendasi yang siap disimpan.
 */
const formatRecommendationsForDB = (recs) => {
  const result = [];
  
  const processItems = (items, prefix) => {
    items.forEach(item => {
      // Masukkan judul kondisi sebagai satu kartu rekomendasi
      result.push(`[${prefix}] ${item.parameter}: ${item.kondisi}`);
      
      // Masukkan setiap poin rekomendasi sebagai kartu tersendiri
      item.rekomendasi.forEach(r => {
        result.push(r);
      });
    });
  };

  processItems(recs.urgent, "URGENT");
  processItems(recs.warning, "PERHATIAN");

  // Jika tidak ada masalah
  if (result.length === 0 && recs.good.length > 0) {
    result.push("Semua parameter berada dalam batas aman. Pertahankan gaya hidup sehat Anda!");
  }

  return result;
};

module.exports = {
  generateCardioRecommendations,
  formatRecommendationsForDB
};
