import Navbar from "../components/Navbar.jsx";
import Chatbot from "../components/Chatbot.jsx";
import iconGrafik from "../icon/icon-grafik.svg";
import { useEffect, useState } from "react";
import { getAssessmentSummary, getAssessments } from "../services/assessmentService.js";

const defaultMetricItems = [
  { title: "Tekanan darah", value: "0 /0", unit: "mmHg" },
  { title: "Detak jantung", value: "0", unit: "BPM" },
  { title: "BMI", value: "0", unit: "kg/m²" },
  { title: "Kolesterol", value: "0", unit: "mg/dL" },
];

export default function DashboardPage({ currentPage, onNavigate }) {
  const [metricItems, setMetricItems] = useState(defaultMetricItems);
  const [riskStatus, setRiskStatus] = useState("Belum ada data");
  const [riskScore, setRiskScore] = useState(0);
  const [lastCheck, setLastCheck] = useState("-");
  const [recommendationText, setRecommendationText] = useState("Lakukan asesmen untuk mendapatkan rekomendasi.");
  const [dynamicCauses, setDynamicCauses] = useState(["Belum ada data"]);
  
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
          
          // Metrics
          const ans = cardioSummary.answers || {};
          setMetricItems([
            { title: "Tekanan darah", value: `${ans.systolic_bp || 0} /${ans.diastolic_bp || 0}`, unit: "mmHg" },
            { title: "Detak jantung", value: `${ans.resting_heart_rate || 0}`, unit: "BPM" },
            { title: "BMI", value: `${ans.bmi || 0}`, unit: "kg/m²" },
            { title: "Kolesterol", value: `${ans.cholesterol_mg_dl || 0}`, unit: "mg/dL" },
          ]);

          // Recommendation
          if (cardioSummary.recommendations && cardioSummary.recommendations.length > 0) {
            setRecommendationText(cardioSummary.recommendations.join(' '));
          } else if (cardioSummary.aiInsights) {
            setRecommendationText(cardioSummary.aiInsights);
          }
          
          // Causes
          const newCauses = [];
          if (ans.systolic_bp >= 130 || ans.diastolic_bp >= 80) newCauses.push("Tekanan Darah Tinggi");
          if (ans.cholesterol_mg_dl >= 200) newCauses.push("Kadar Kolesterol Tinggi");
          if (ans.daily_steps < 5000 || ans.physical_activity_hours_per_week < 2.5) newCauses.push("Kurangnya Aktivitas Fisik");
          if (ans.bmi >= 25) newCauses.push("Berat Badan Berlebih (Overweight/Obesitas)");
          if (ans.sleep_hours < 6) newCauses.push("Kurangnya Waktu Istirahat (Tidur)");
          if (ans.stress_level >= 7) newCauses.push("Tingkat Stres Tinggi");
          if (ans.diet_quality_score <= 3) newCauses.push("Pola Makan Tidak Seimbang");
          if (ans.alcohol_units_per_week >= 7) newCauses.push("Konsumsi Alkohol Berlebih");
          
          if (newCauses.length === 0) {
             newCauses.push("Tidak ada penyebab risiko utama yang terdeteksi.");
          }
          setDynamicCauses(newCauses);
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
    if (s.includes("tinggi") || s.includes("high")) return "bg-[#dc2626]";
    if (s.includes("sedang") || s.includes("moderate")) return "bg-orange-500";
    if (s.includes("rendah") || s.includes("low")) return "bg-green-500";
    return "bg-slate-500";
  };
  const getStatusTextColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes("tinggi") || s.includes("high")) return "text-[#dc2626]";
    if (s.includes("sedang") || s.includes("moderate")) return "text-orange-500";
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
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Dashboard</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Lihat performa kesehatan jantung anda, perbandingan risiko, dan
            rekomendasi preventif dalam satu tampilan.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
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
            <p className={`mt-4 text-5xl font-bold ${getStatusTextColor(riskStatus)}`}>{riskScore}%</p>
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

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1.95fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {metricItems.map((metric) => (
              <article
                key={metric.title}
                className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70"
              >
                <h2 className="text-base font-semibold text-slate-900">
                  {metric.title}
                </h2>
                <p className={`mt-6 font-bold ${getStatusTextColor(riskStatus)}`}>
                  <span className="text-4xl">
                    {metric.value.split(" /")[0]}
                  </span>
                  {metric.value.includes(" /") && (
                    <span className="text-2xl text-[#000000]">
                      {" "}
                      /{metric.value.split(" /")[1]}
                    </span>
                  )}
                </p>
                <span className="mt-8 inline-flex rounded-full bg-[#1e3a5a] px-4 py-2 text-sm font-semibold text-white">
                  {metric.unit}
                </span>
              </article>
            ))}
          </div>

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
                <svg viewBox="0 0 720 280" className="h-[320px] w-full">
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
              ) : (
                <div className="flex h-[320px] items-center justify-center text-slate-500">
                  Belum ada data grafik (Lakukan asesmen)
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <article className="rounded-[32px] bg-[#ffffff] p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <h2 className="text-xl font-semibold text-slate-950">
              Rekomendasi
            </h2>
            <div className="mt-5 rounded-[15px] bg-[#E8EBEE] p-6 text-sm leading-7 text-slate-600">
              {recommendationText}
            </div>
          </article>

          <article className="rounded-[30px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <h2 className="text-xl font-semibold text-slate-950">Penyebab</h2>
            <div className="mt-5 space-y-3">
              {dynamicCauses.map((cause, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 rounded-3xl bg-[#1e3a5a]/10 p-4"
                >
                  <span className="mt-1 h-3.5 w-3.5 rounded-full bg-[#1e3a5a] shrink-0" />
                  <p className="text-sm leading-7 text-slate-700">{cause}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
      <Chatbot />
    </div>
  );
}
