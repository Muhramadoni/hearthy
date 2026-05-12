import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Chatbot from "../components/Chatbot.jsx";

const detailItems = [
  "23 Tahun",
  "22.1",
  "100mmHg",
  "130 mg/dL",
  "100 BPM",
  "Ya",
  "Sedang",
  "2x",
  "5.000 langkah",
  "Normal 0 - 14",
  "1 jam 15 menit",
  "8 jam 10 menit",
];

export default function HistoryDetailPage({ currentPage, onNavigate }) {
  useEffect(() => {
    document.title = "Detail History - Hearthy";
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      <Navbar
        currentPage={currentPage ?? "history"}
        onNavigate={onNavigate ?? (() => {})}
      />

      <main className="mx-auto max-w-screen-2xl px-6 py-10">
        <div className="rounded-[32px] bg-white px-6 py-8 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
                Detail Hasil Prediksi
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Pahami profil risiko jantung Anda secara mendalam untuk
                menentukan langkah pencegahan yang paling tepat bagi kesehatan
                Anda.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => onNavigate?.("history")}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Kembali
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-[#1b4062] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163551]"
              >
                Download
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] bg-slate-50 p-8 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.2)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Hasil Prediksi
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950">
                    Skor risiko anda sekitar 90%
                  </h2>
                </div>
                <span className="rounded-full bg-[#f7d4c5] px-4 py-2 text-sm font-semibold text-[#b02408]">
                  Tinggi
                </span>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                Berikut model grafik parameter klinis anda untuk membantu
                menunjukkan area risiko yang perlu mendapatkan perhatian lebih.
              </p>

              <div className="mt-8 flex items-center justify-center">
                <div className="relative h-[300px] w-[300px] rounded-full bg-[#f8fafc] shadow-inner shadow-slate-200/80">
                  <div className="absolute inset-0 rounded-full border-8 border-transparent border-r-[#ef4444] border-b-[#2563eb] border-l-[#fbbf24] border-t-[#f8fafc]" />
                  <div className="absolute inset-20 rounded-full bg-white"></div>
                  <div className="absolute inset-24 rounded-full bg-[#f8fafc]" />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Tekanan Darah
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    Tinggi
                  </p>
                </div>
                <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Denyut Jantung
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    100 BPM
                  </p>
                </div>
                <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Lainnya
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    90%
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-8 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.2)]">
              <h3 className="text-xl font-semibold text-slate-950">
                Data Skrining Anda
              </h3>
              <div className="mt-6 space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {detailItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-3xl bg-slate-50 px-5 py-4 text-sm text-slate-800 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] bg-white p-8 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.2)]">
            <h3 className="text-xl font-semibold text-slate-950">
              Rekomendasi
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Berdasarkan analisis risiko Anda yang tinggi, kami sangat
              menyarankan Anda untuk segera menjadwalkan konsultasi dengan
              dokter spesialis jantung guna pemeriksaan lebih lanjut.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <button className="rounded-3xl bg-[#1b4062] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#163551]">
                kurangi asupan garam harian
              </button>
              <button className="rounded-3xl bg-[#1b4062] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#163551]">
                hindari aktivitas fisik yang terlalu berat
              </button>
              <button className="rounded-3xl bg-[#1b4062] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#163551]">
                konsumsi makanan tinggi serat
              </button>
            </div>
          </div>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}
