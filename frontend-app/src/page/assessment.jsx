import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Chatbot from "../components/Chatbot.jsx";
import iconProfilAsasment from "../icon/icon-profil-asasment.svg";
import iconDetakJantung from "../icon/icon-detak jantung.svg";
import Swal from "sweetalert2";

const getDietCategory = (level) => {
  const categories = {
    1: "Sangat Buruk",
    2: "Buruk",
    3: "Kurang",
    4: "Cukup / Normal",
    5: "Sedang",
    6: "Baik",
    7: "Sangat Baik",
  };
  return categories[level] || "";
};

export default function AssessmentPage({ currentPage, onNavigate }) {
  const [familyHistory, setFamilyHistory] = useState("Ya");
  const [stressLevel, setStressLevel] = useState("");
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [stressAnswers, setStressAnswers] = useState({});
  const [physicalActivity, setPhysicalActivity] = useState(12);
  const [sleepDuration, setSleepDuration] = useState(8);
  const [dietLevel, setDietLevel] = useState("");

  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState("");
  const [systolicBp, setSystolicBp] = useState("");
  const [diastolicBp, setDiastolicBp] = useState("");
  const [cholesterol, setCholesterol] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [alcoholUnits, setAlcoholUnits] = useState("");
  const [dailySteps, setDailySteps] = useState("");

  const stressQuestions = [
    {
      id: 1,
      question:
        "Apakah Anda sering merasa cemas atau khawatir tanpa alasan yang jelas?",
      options: ["Tidak pernah", "Kadang-kadang", "Sering", "Selalu"],
    },
    {
      id: 2,
      question:
        "Apakah Anda mengalami kesulitan tidur karena pikiran yang terus berputar?",
      options: ["Tidak pernah", "Kadang-kadang", "Sering", "Selalu"],
    },
    {
      id: 3,
      question:
        "Apakah Anda merasa lelah atau kelelahan meskipun sudah beristirahat cukup?",
      options: ["Tidak pernah", "Kadang-kadang", "Sering", "Selalu"],
    },
    {
      id: 4,
      question: "Apakah Anda sering merasa mudah marah atau frustrasi?",
      options: ["Tidak pernah", "Kadang-kadang", "Sering", "Selalu"],
    },
    {
      id: 5,
      question:
        "Apakah Anda mengalami penurunan nafsu makan atau perubahan berat badan?",
      options: ["Tidak pernah", "Kadang-kadang", "Sering", "Selalu"],
    },
  ];

  const handleStressAnswer = (questionId, answer) => {
    setStressAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const calculateStressLevel = () => {
    const scores = {
      "Tidak pernah": 0,
      "Kadang-kadang": 1,
      Sering: 2,
      Selalu: 3,
    };
    const totalScore = Object.values(stressAnswers).reduce(
      (sum, answer) => sum + scores[answer],
      0,
    );
    if (totalScore <= 5) return "Normal (0-5)";
    if (totalScore <= 10) return "Sedang (6-10)";
    return "Tinggi (11+)";
  };

  const handleProcessStressTest = () => {
    const level = calculateStressLevel();
    setStressLevel(level);
    setIsStressTestOpen(false);
    setStressAnswers({});
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!age || !bmi || !systolicBp || !diastolicBp || !cholesterol || !heartRate || !dietLevel || !alcoholUnits || !dailySteps || !stressLevel) {
      Swal.fire({
        icon: "warning",
        title: "Data Tidak Lengkap",
        text: "Harap isi semua field dan lakukan Test Level Stress sebelum menyimpan.",
        confirmButtonColor: "#1e3a5a",
      });
      return;
    }

    const familyVal = familyHistory === "Ya" ? 1 : 0;
    
    let stressVal = 0;
    if (stressLevel.includes("Normal")) stressVal = 3;
    else if (stressLevel.includes("Sedang")) stressVal = 6;
    else if (stressLevel.includes("Tinggi")) stressVal = 9;

    const payload = {
      answers: {
        age: parseInt(age),
        bmi: parseFloat(bmi),
        systolic_bp: parseInt(systolicBp),
        diastolic_bp: parseInt(diastolicBp),
        cholesterol_mg_dl: parseInt(cholesterol),
        resting_heart_rate: parseInt(heartRate),
        daily_steps: parseInt(dailySteps),
        stress_level: stressVal,
        physical_activity_hours_per_week: parseInt(physicalActivity),
        sleep_hours: parseFloat(sleepDuration),
        family_history_heart_disease: familyVal,
        diet_quality_score: parseInt(dietLevel),
        alcohol_units_per_week: parseFloat(alcoholUnits),
      }
    };

    try {
      Swal.fire({
        title: "Sedang Menganalisis...",
        text: "AI sedang mengkalkulasi risiko kardiovaskular Anda.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const token = localStorage.getItem("hearthy_token");
      const res = await fetch("http://localhost:5000/api/assessments/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan prediksi");
      }

      const pred = data.data.prediction;
      const severity = pred.severity_mapped;
      const score = pred.score;
      
      let icon = "success";
      let color = "#10b981"; 
      
      if (severity === "moderate") {
        icon = "warning";
        color = "#f59e0b"; 
      } else if (severity === "high" || severity === "very_high") {
        icon = "error";
        color = "#ef4444"; 
      }

      Swal.fire({
        icon: icon,
        title: "Hasil Analisis AI",
        html: `
          <div class="mt-4 text-left">
            <p class="mb-2 text-slate-700">Tingkat Risiko: <strong style="color: ${color}">${severity.toUpperCase()}</strong></p>
            <p class="mb-2 text-slate-700">Probabilitas: <strong>${score}%</strong></p>
            <hr class="my-3"/>
            <p class="text-sm text-slate-600">Data penilaian Anda telah disimpan ke riwayat kesehatan.</p>
          </div>
        `,
        confirmButtonColor: "#1e3a5a",
      }).then(() => {
        if(onNavigate) onNavigate("dashboard");
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error.message,
        confirmButtonColor: "#1e3a5a",
      });
    }
  };

  useEffect(() => {
    document.title = "Assessment - Web Hearty";
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      <Navbar
        currentPage={currentPage ?? "assessment"}
        onNavigate={onNavigate ?? (() => {})}
      />
      <main className="mx-auto max-w-screen-2xl px-6 py-10">
        <section className="mb-8">
          <p className="text-sm font-semibold text-slate-600">
            Assessment Pengguna
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Isi Parameter Klinik untuk Prediksi Risiko
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Lengkapi data berikut untuk menghasilkan skrining awal risiko
            kardiovaskular.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#1e3a5a]">
                <img
                  src={iconProfilAsasment}
                  alt="Profil icon"
                  className="h-6 w-6 text-white"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Profil & Kondisi fisik
                </h2>
                <p className="text-sm text-slate-500">
                  Masukkan data klinis dasar Anda.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Usia
                </span>
                <input
                  type="number"
                  placeholder="Masukkan usia"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  BMI
                </span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Masukkan BMI"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
              <div className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Tekanan darah
                </span>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Sistolik (cth: 120)"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                  />
                  <span className="text-xl font-medium text-slate-400">/</span>
                  <input
                    type="number"
                    placeholder="Diastolik (cth: 80)"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                  />
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Kolestrol
                </span>
                <input
                  type="number"
                  placeholder="Contoh 200"
                  value={cholesterol}
                  onChange={(e) => setCholesterol(e.target.value)}
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Detak jantung
                </span>
                <input
                  type="number"
                  placeholder="Contoh 60"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#1e3a5a]">
                <img
                  src={iconDetakJantung}
                  alt="Aktivitas icon"
                  className="h-6 w-6 text-white"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Pola Aktivitas
                </h2>
                <p className="text-sm text-slate-500">
                  Lengkapi kebiasaan harian dan riwayat keluarga.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">
                  Riwayat penyakit keluarga
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {["Ya", "Tidak"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFamilyHistory(option)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        familyHistory === option
                          ? "border-[#1e3a5a] bg-[#1e3a5a] text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Tingkatan diet
                </span>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={dietLevel}
                  onChange={(e) => setDietLevel(e.target.value)}
                  placeholder="contoh: 1-7"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
                {dietLevel && getDietCategory(dietLevel) && (
                  <p className="mt-2 text-sm text-slate-500">
                    Kategori: <span className="font-semibold text-slate-700">{getDietCategory(dietLevel)}</span>
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Konsumsi alcohol per-minggu
                </span>
                <input
                  type="number"
                  placeholder="Berapa kali anda konsumsi alkohol"
                  value={alcoholUnits}
                  onChange={(e) => setAlcoholUnits(e.target.value)}
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Rata-rata jumlah langkah per-hari
                </span>
                <input
                  type="number"
                  placeholder="Rata-rata langkah harian contoh 5000"
                  value={dailySteps}
                  onChange={(e) => setDailySteps(e.target.value)}
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Level stress
                </span>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsStressTestOpen(true)}
                    className="rounded-2xl bg-[#1e3a5a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173652]"
                  >
                    Test level stress
                  </button>
                  <input
                    type="text"
                    value={stressLevel}
                    readOnly
                    placeholder="Hasil test akan muncul di sini"
                    className="flex-1 rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                  />
                </div>
              </label>

              <div className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Aktivitas Fisik (jam/minggu)
                </span>
                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="168"
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(e.target.value)}
                    className="flex-1 h-2 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#1e3a5a]"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="168"
                      value={physicalActivity}
                      onChange={(e) => setPhysicalActivity(e.target.value)}
                      className="w-20 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-900 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                    />
                    <span className="text-sm font-medium text-slate-900">
                      jam/minggu
                    </span>
                  </div>
                </div>
              </div>

              <div className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Durasi Tidur (jam/malam)
                </span>
                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={sleepDuration}
                    onChange={(e) => setSleepDuration(e.target.value)}
                    className="flex-1 h-2 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#1e3a5a]"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={sleepDuration}
                      onChange={(e) => setSleepDuration(e.target.value)}
                      className="w-20 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-900 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                    />
                    <span className="text-sm font-medium text-slate-900">
                      jam/malam
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 justify-end text-right sm:flex-row sm:items-center sm:justify-end">
          <button className="inline-flex items-center justify-center rounded-full bg-[#dddddd] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300">
            Lihat ringkasan
          </button>
          <button onClick={handleSubmit} className="inline-flex items-center justify-center rounded-full bg-[#1e3a5a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173652]">
            Simpan dan lihat hasil
          </button>
        </div>
      </main>

      {isStressTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 z-40"></div>
          <div className="relative z-50 w-full max-w-2xl rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12),_inset_0_1px_0_0_rgba(255,255,255,0.5)] ring-1 ring-slate-200 my-8 overflow-hidden">
            <h2 className="mb-6 text-xl font-semibold text-slate-950">
              Test Level Stress
            </h2>
            <div className="max-h-96 overflow-y-auto space-y-6">
              {stressQuestions.map((q) => (
                <div key={q.id}>
                  <p className="mb-3 text-sm font-semibold text-slate-900">
                    {q.question}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleStressAnswer(q.id, option)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          stressAnswers[q.id] === option
                            ? "border-[#1e3a5a] bg-[#1e3a5a] text-white"
                            : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsStressTestOpen(false)}
                className="rounded-2xl bg-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-400"
              >
                Batal
              </button>
              <button
                onClick={handleProcessStressTest}
                className="rounded-2xl bg-[#1e3a5a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#173652]"
              >
                Proses
              </button>
            </div>
          </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
}
