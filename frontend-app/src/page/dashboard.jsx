/**
 * @fileoverview Halaman Dasbor (Dashboard Page).
 * Menampilkan ringkasan status risiko kesehatan jantung pengguna,
 * skor terbaru, metrik fisik (tekanan darah, BMI, dll.), dan grafik tren riwayat asesmen.
 */
import Navbar from "../components/Navbar.jsx";
import iconGrafik from "../icon/icon-grafik.svg";
import { useEffect, useState } from "react";
import { getAssessmentSummary, getAssessments } from "../services/assessmentService.js";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';



/**
 * Komponen pembantu untuk menganimasikan transisi angka dari 0 menuju nilai target.
 *
 * @param {Object} props - Properti komponen.
 * @param {number|string} props.value - Nilai target akhir (bisa berupa desimal).
 * @param {number} [props.duration=1500] - Durasi animasi dalam milidetik.
 * @returns {JSX.Element} Angka yang dianimasikan (dibungkus dalam React Fragment).
 */
function AnimatedNumber({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTimestamp = null;
    let rafId = null;
    const target = parseFloat(value) || 0;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress * (2 - progress); // ease out quad
      setCount(easeProgress * target);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    
    if (target === 0) {
      rafId = window.requestAnimationFrame(() => setCount(0));
    } else {
      rafId = window.requestAnimationFrame(step);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [value, duration]);
  
  const isFloat = value.toString().includes(".");
  return <>{isFloat ? count.toFixed(1) : Math.floor(count)}</>;
}

/**
 * Komponen Utama: DashboardPage
 * Mengambil ringkasan kesehatan dari API dan menyajikannya dalam format yang mudah dipahami (grafik, skor risiko).
 *
 * @param {Object} props - Properti komponen.
 * @param {string} props.currentPage - Penanda halaman aktif untuk navigasi Navbar.
 * @param {function} props.onNavigate - Fungsi navigasi ke halaman lain.
 * @returns {JSX.Element} Antarmuka pengguna Halaman Dasbor.
 */
export default function DashboardPage({ currentPage, onNavigate }) {
  const [screeningData, setScreeningData] = useState([]);
  const [riskStatus, setRiskStatus] = useState("Belum ada data");
  const [riskScore, setRiskScore] = useState(0);
  const [lastCheck, setLastCheck] = useState("-");
  const [aiInsights, setAiInsights] = useState("Lakukan asesmen untuk mendapatkan analisis dan rekomendasi AI.");
  
  const [chartData, setChartData] = useState({ points: [], labels: [], path: "" });

  useEffect(() => {
    document.title = "Dashboard - Web Hearty";
    
    async function fetchData() {
      try {
        const [summaryRes, allAssessmentsRes] = await Promise.all([
          getAssessmentSummary(),
          getAssessments(100, 0)
        ]);

        const cardioSummary = summaryRes.summary?.cardiovascular;
        
        if (cardioSummary) {
          // Status & Score
          setRiskStatus(cardioSummary.severity || "Normal");
          setRiskScore(cardioSummary.score || 0);
          
          // Last Check Date
          const dateObj = new Date(cardioSummary.created_at || Date.now());
          setLastCheck(dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
          
          // Metrics (Screening Data)
          const ans = cardioSummary.answers || {};
          setScreeningData([
            `Usia: ${ans.age || "-"} Tahun`,
            `BMI: ${ans.bmi || "-"}`,
            `Tekanan Darah: ${ans.systolic_bp || "-"}/${ans.diastolic_bp || "-"} mmHg`,
            `Kolesterol: ${ans.cholesterol_mg_dl || "-"} mg/dL`,
            `Denyut Jantung: ${ans.resting_heart_rate || "-"} BPM`,
            `Langkah: ${ans.daily_steps || "-"} langkah`,
            `Tidur: ${ans.sleep_hours || "-"} jam`,
            `Riwayat Keluarga: ${ans.family_history_heart_disease ? "Ya" : "Tidak"}`,
            `Kualitas Diet (0-7): ${ans.diet_quality_score || "-"}`,
            `Aktivitas Fisik: ${ans.physical_activity_hours_per_week || "-"} jam/minggu`,
            `Tingkat Stres (0-10): ${ans.stress_level || "-"}`,
            `Alkohol: ${ans.alcohol_units_per_week || "-"} unit/minggu`,
          ]);

          // AI Insights
          if (cardioSummary.ai_insights) {
            // Hapus sapaan awal jika ada
            let cleanInsights = cardioSummary.ai_insights
              .replace(/Halo!? (Saya|Bapak\/Ibu,? salam sehat dari) HearthyBot!?(, siap membantu Anda menjaga kesehatan jantung\.)?/gi, '')
              .replace(/Terima kasih sudah menggunakan aplikasi Hearthy\.?/gi, '');
            setAiInsights(cleanInsights.trim());
          }
        }

        // Setup Chart
        const cardioHistory = (allAssessmentsRes.assessments || [])
          .filter(a => a.type === 'cardiovascular')
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .slice(-7); // get last 7

        if (cardioHistory.length > 0) {
          const values = cardioHistory.map(h => h.score || 0);
          const labels = cardioHistory.map(h => {
            const d = new Date(h.created_at);
            return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
          });

          const minValue = Math.min(...values) - 2;
          const maxValue = Math.max(...values, 10) + 2; // ensure at least 10 gap
          
          const points = values.map((value, index) => {
            const x = 50 + index * 90;
            const y = 240 - ((value - minValue) / (maxValue - minValue)) * 180;
            return { x, y, value };
          });
          
          const path = points.map((point, index) => 
            index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
          ).join(" ");
          
          setChartData({ points, labels, path });
        }

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes("tinggi") || s.includes("high")) return "bg-red-500";
    if (s.includes("sedang") || s.includes("moderate")) return "bg-yellow-500";
    if (s.includes("rendah") || s.includes("low")) return "bg-green-500";
    return "bg-slate-500";
  };
  const getStatusTextColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes("tinggi") || s.includes("high")) return "text-red-500";
    if (s.includes("sedang") || s.includes("moderate")) return "text-yellow-500";
    if (s.includes("rendah") || s.includes("low")) return "text-green-500";
    return "text-slate-500";
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      <Navbar
        currentPage={currentPage ?? "dashboard"}
        onNavigate={onNavigate ?? (() => {})}
      />
      <main className="mx-auto max-w-screen-2xl px-6 py-10">
        <section className="mb-8">
          <p className="text-sm font-semibold text-slate-600">
            Ringkasan kesehatan anda
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950">Dashboard</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Lihat performa kesehatan jantung anda, perbandingan risiko, dan
            rekomendasi preventif dalam satu tampilan.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <p className="text-sm font-semibold capitalized text-slate-500">
              Status risiko
            </p>
            <span className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white ${getStatusColor(riskStatus)}`}>
              {riskStatus}
            </span>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-600">
              {riskStatus.toLowerCase().includes("tinggi") ? "Risiko telah melewati batas normal" : "Tetap jaga kesehatan Anda"}
            </p>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <p className="text-sm font-semibold capitalized text-slate-500">
              Skor risiko
            </p>
            <p className={`mt-4 text-5xl font-bold ${getStatusTextColor(riskStatus)}`}>
              <AnimatedNumber value={riskScore} />%
            </p>
            <p className="mt-3 text-sm text-slate-600">Skor risiko terbaru</p>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <p className="text-sm font-semibold capitalized text-slate-500">
              Pengecekan terakhir
            </p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {lastCheck}
            </p>
            <p className="mt-3 text-sm text-slate-600">Pemeriksaan terakhir</p>
          </article>
        </section>

        {/* Gauge Chart Section */}
        <section className="mt-10">
          <article className="rounded-[32px] bg-white p-8 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <h2 className="text-xl font-semibold text-slate-950">Grafik Risiko Kardiovaskular</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Visualisasi tingkat risiko berdasarkan parameter klinis Anda.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <div className="relative h-[240px] w-[240px] sm:h-[300px] sm:w-[300px] rounded-full bg-[#E8EBEE] shadow-inner shadow-slate-200/80">
                <div className={`absolute inset-0 rounded-full border-8 border-transparent ${
                  (riskStatus.toLowerCase().includes('high') || riskStatus.toLowerCase().includes('tinggi')) ? 'border-t-[#ef4444] border-r-[#ef4444] border-b-[#ef4444]' :
                  (riskStatus.toLowerCase().includes('moderate') || riskStatus.toLowerCase().includes('sedang')) ? 'border-t-[#fbbf24] border-r-[#fbbf24]' :
                  'border-t-[#22c55e]'
                } border-l-[#f8fafc]`} />
                <div className="absolute inset-16 sm:inset-20 rounded-full bg-white flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-slate-800"><AnimatedNumber value={riskScore} />%</span>
                </div>
                <div className="absolute inset-20 sm:inset-24 rounded-full bg-transparent" />
              </div>
            </div>
          </article>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1.95fr]">
          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-950">
                Data Skrining Anda
              </h2>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {screeningData.length > 0 ? screeningData.map((item, index) => (
                <div
                  key={index}
                  className="rounded-3xl bg-[#E8EBEE] px-5 py-4 text-sm text-slate-800 shadow-sm"
                >
                  {item}
                </div>
              )) : (
                <div className="flex h-full min-h-[200px] items-center justify-center text-slate-500 text-sm">
                  Belum ada data skrining.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100">
                  <img src={iconGrafik} alt="Icon grafik" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    Tren Kesehatan Jantung - Hearthy
                  </p>
                  <p className="text-sm text-slate-500">
                    Tingkat Risiko Kardiovaskular
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-4">
              {chartData.points.length > 0 ? (
                <div className="w-full">
                  <svg viewBox="0 0 720 280" className="h-auto w-full max-h-[320px]">
                  <defs>
                    <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g opacity="0.55" stroke="#94a3b8" strokeWidth="1">
                    {[0, 1, 2, 3, 4].map((row) => (
                      <line
                        key={row}
                        x1="40"
                        y1={40 + row * 45}
                        x2="680"
                        y2={40 + row * 45}
                      />
                    ))}
                  </g>
                  <path
                    d={chartData.path}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`${chartData.path} L ${chartData.points[chartData.points.length-1].x} 260 L 50 260 Z`}
                    fill="url(#fillGradient)"
                    opacity="0.4"
                  />
                  {chartData.points.map((point, index) => (
                    <g key={point.x}>
                      <circle cx={point.x} cy={point.y} r="6" fill="#fff" stroke="#dc2626" strokeWidth="4" />
                      <circle cx={point.x} cy={point.y} r="3" fill="#dc2626" />
                      <text x={point.x} y={point.y - 14} textAnchor="middle" className="text-[12px] font-semibold" fill="#475569">
                        {point.value}%
                      </text>
                      <text x={point.x} y="270" textAnchor="middle" className="text-[11px] font-medium" fill="#64748b">
                        {chartData.labels[index]}
                      </text>
                    </g>
                  ))}
                </svg>
                </div>
              ) : (
                <div className="flex h-[320px] items-center justify-center text-slate-500">
                  Belum ada data grafik (Lakukan asesmen)
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="mt-8">
          <article className="rounded-[32px] bg-[#ffffff] p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <h2 className="text-xl font-semibold text-slate-950 mb-4">
              Analisis & Rekomendasi AI
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed text-justify prose prose-sm max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="mt-4 space-y-3" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                  li: ({node, ...props}) => {
                    // Cek apakah di dalam ul atau ol
                    const isOrdered = node.parent && node.parent.tagName === 'ol';
                    if (isOrdered) {
                      return <li className="pl-1 text-slate-700 leading-relaxed" {...props} />;
                    }
                    return (
                      <li className="flex gap-4 items-start rounded-2xl bg-[#1e3a5a]/[0.03] p-4 border border-[#1e3a5a]/10 shadow-sm transition-all hover:bg-[#1e3a5a]/[0.05]" {...props}>
                        <div className="mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a5a] text-white shadow-sm">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div className="text-sm leading-relaxed text-slate-700">{props.children}</div>
                      </li>
                    );
                  },
                  strong: ({node, ...props}) => <strong className="font-semibold text-[#1e3a5a]" {...props} />,
                  h3: ({node, ...props}) => (
                    <h3 className="flex items-center gap-3 text-lg font-bold mt-8 mb-4 text-slate-800" {...props}>
                      <span className="h-6 w-1.5 rounded-full bg-[#1e3a5a] shadow-sm"></span>
                      {props.children}
                    </h3>
                  )
                }}
              >
                {aiInsights}
              </ReactMarkdown>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
