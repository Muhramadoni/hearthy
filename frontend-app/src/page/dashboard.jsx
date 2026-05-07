import iconGrafik from "../icon/icon-grafik.svg";

const metricItems = [
  {
    title: "Tekanan darah",
    value: "100 /90",
    unit: "mmHg",
  },
  {
    title: "Detak jantung",
    value: "100 /90",
    unit: "BPM",
  },
  {
    title: "BMI",
    value: "100 /90",
    unit: "kg/m²",
  },
  {
    title: "Kolesterol",
    value: "100 /90",
    unit: "mmHg",
  },
];

const causes = [
  "Pola Makan Tidak Seimbang",
  "Kurangnya Aktivitas Fisik",
  "Faktor Stres dan Istirahat",
];

const chartValues = [12, 16, 22, 29, 25, 20, 14];
const chartLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const minValue = Math.min(...chartValues) - 2;
const maxValue = Math.max(...chartValues) + 2;
const chartPoints = chartValues.map((value, index) => {
  const x = 50 + index * 90;
  const y = 240 - ((value - minValue) / (maxValue - minValue)) * 180;
  return { x, y, value };
});
const linePath = chartPoints
  .map((point, index) =>
    index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
  )
  .join(" ");

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      <main className="mx-auto max-w-screen-2xl px-6 py-10">
        <section className="mb-8">
          <p className="text-sm font-semibold text-slate-600">
            Ringkasan kesehatan anda
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Lihat performa kesehatan jantung anda, perbandingan risiko, dan rekomendasi preventif dalam satu tampilan.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Status risiko
            </p>
            <span className="mt-4 inline-flex rounded-full bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white">
              Tinggi
            </span>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-600">
              Risiko telah melewati batas normal
            </p>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Skor risiko
            </p>
            <p className="mt-4 text-5xl font-bold text-[#dc2626]">90%</p>
            <p className="mt-3 text-sm text-slate-600">Skor risiko terbaru</p>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pengecekan terakhir
            </p>
            <p className="mt-4 text-2xl font-semibold text-slate-950">30 April 2026</p>
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
                <p className="mt-6 text-3xl font-bold text-[#dc2626]">
                  {metric.value}
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
              <button className="inline-flex items-center justify-center rounded-2xl bg-[#1e3a5a] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-900/10 transition hover:bg-[#173652]">
                Hari ini
                <span className="ml-2">▾</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-4">
              <svg viewBox="0 0 720 280" className="h-[320px] w-full">
                <defs>
                  <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g opacity="0.55" stroke="#94a3b8" strokeWidth="1">
                  {[0, 1, 2, 3, 4].map((row) => (
                    <line key={row} x1="40" y1={40 + row * 45} x2="680" y2={40 + row * 45} />
                  ))}
                </g>
                <path
                  d={linePath}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`${linePath} L 680 260 L 50 260 Z`}
                  fill="url(#fillGradient)"
                  opacity="0.4"
                />
                {chartPoints.map((point, index) => (
                  <g key={point.x}>
                    <circle cx={point.x} cy={point.y} r="6" fill="#fff" stroke="#dc2626" strokeWidth="4" />
                    <circle cx={point.x} cy={point.y} r="3" fill="#dc2626" />
                    <text
                      x={point.x}
                      y={point.y - 14}
                      textAnchor="middle"
                      className="text-[12px] font-semibold"
                      fill="#475569"
                    >
                      {point.value}
                    </text>
                    <text
                      x={point.x}
                      y="270"
                      textAnchor="middle"
                      className="text-[11px] font-medium"
                      fill="#64748b"
                    >
                      {chartLabels[index]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <h2 className="text-xl font-semibold text-slate-950">Rekomendasi</h2>
            <div className="mt-5 rounded-[28px] bg-slate-50 p-6 text-sm leading-7 text-slate-600">
              Batasi konsumsi gula dan lebih memperhatikan pola makan harian agar kadar gula darah serta tekanan darah tetap stabil. Selain itu, sempatkan untuk berolahraga secara rutin guna menjaga kesehatan jantung dan membantu menurunkan tingkat risiko kesehatan yang saat ini sedang tinggi.
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <h2 className="text-xl font-semibold text-slate-950">Penyebab</h2>
            <div className="mt-5 space-y-3">
              {causes.map((cause) => (
                <div
                  key={cause}
                  className="flex gap-3 rounded-3xl bg-[#1e3a5a]/10 p-4"
                >
                  <span className="mt-1 h-3.5 w-3.5 rounded-full bg-[#1e3a5a]" />
                  <p className="text-sm leading-7 text-slate-700">{cause}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
