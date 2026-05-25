/**
 * @fileoverview Halaman Detail Riwayat (History Detail Page).
 * Menampilkan ringkasan hasil secara mendalam dari sebuah sesi asesmen tertentu,
 * termasuk skor akhir, status tingkat keparahan, ringkasan input pengguna, dan rekomendasi langkah pencegahan.
 */
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { getAssessmentById } from "../services/assessmentService.js";
import Swal from "sweetalert2";

/**
 * Komponen Utama: HistoryDetailPage
 * Mengambil data detail suatu asesmen berdasarkan ID (dari `localStorage`) 
 * dan menyediakan antarmuka visual termasuk grafis melingkar (gauge) serta fungsionalitas cetak PDF.
 *
 * @param {Object} props - Properti komponen.
 * @param {string} props.currentPage - Penanda halaman aktif untuk navigasi Navbar.
 * @param {function} props.onNavigate - Fungsi navigasi ke halaman lain.
 * @returns {JSX.Element} Antarmuka pengguna Halaman Detail Riwayat.
 */
export default function HistoryDetailPage({ currentPage, onNavigate }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Detail History - Hearthy";
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const id = localStorage.getItem("selected_history_id");
      if (!id) {
        onNavigate?.("history");
        return;
      }
      const res = await getAssessmentById(id);
      setAssessment(res.assessment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex flex-col text-slate-500">
        <Navbar
          currentPage={currentPage ?? "history"}
          onNavigate={onNavigate ?? (() => {})}
        />
        <div className="flex-1 flex items-center justify-center">
          Loading data...
        </div>
      </div>
    );
  }
  
  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex flex-col text-slate-500">
        <Navbar
          currentPage={currentPage ?? "history"}
          onNavigate={onNavigate ?? (() => {})}
        />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div>Data tidak ditemukan.</div>
          <button
            onClick={() => onNavigate?.("history")}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#1b4062] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#163551]"
          >
            Kembali ke History
          </button>
        </div>
      </div>
    );
  }

  
  const recommendations = Array.isArray(assessment.recommendations) 
    ? assessment.recommendations 
    : [assessment.recommendations || "Belum ada rekomendasi."];

  const handleDownloadPDF = () => {
    // We use native browser print which correctly supports Tailwind v4 (oklch/oklab colors)
    // The user can select "Save as PDF" in the print dialog.
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950 print:bg-white">
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { margin: 0; }
        }
      `}</style>
      <div className="print:hidden">
        <Navbar
          currentPage={currentPage ?? "history"}
          onNavigate={onNavigate ?? (() => {})}
        />
      </div>

      <main className="mx-auto max-w-screen-2xl px-6 py-10 print:p-0 print:m-0">
        <div id="pdf-content" className="flex flex-col gap-6 print:p-8 print:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl print:block print:mb-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 print:text-2xl">
                Laporan Hasil Prediksi Hearthy
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 print:text-xs print:mt-1 print:leading-5">
                Profil risiko jantung Anda secara mendalam berdasarkan parameter klinis dan gaya hidup yang diberikan.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center print:hidden">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center justify-center rounded-2xl bg-[#1e3a5a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173652]"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.("history")}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Kembali
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 print:flex-col">
            <div className="rounded-[32px] bg-white p-8 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70 print:bg-white print:shadow-none print:border-b print:border-slate-200 print:rounded-none print:p-0 print:pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Hasil Prediksi
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950">
                    Skor risiko anda sekitar {assessment.score || 0}%
                  </h2>
                </div>
                <span className={`self-start sm:self-auto rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                  assessment.severity === 'high' ? 'bg-red-100 text-red-700' :
                  assessment.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  assessment.severity === 'low' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {assessment.severity || "Unknown"}
                </span>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                {assessment.aiInsights || "Berdasarkan analisis risiko Anda, kami menyarankan Anda untuk memperhatikan gaya hidup dan pola makan."}
              </p>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70 print:shadow-none print:border-t print:border-slate-200 print:rounded-none print:p-0 print:pt-8 print:mt-8">
            <h3 className="text-xl font-semibold text-slate-950">
              Rekomendasi
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {assessment.aiInsights || "Berdasarkan analisis risiko Anda, kami menyarankan Anda untuk memperhatikan gaya hidup dan pola makan."}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-1 print:gap-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="rounded-3xl bg-[#1b4062] px-6 py-4 text-sm font-semibold text-white transition flex items-center print:bg-white print:text-slate-900 print:border print:border-slate-300 print:rounded-md print:py-2 print:px-3 print:break-inside-avoid print:text-xs">
                  <span className="print:hidden">{rec}</span>
                  <span className="hidden print:inline-flex gap-2">
                    <span className="font-bold text-slate-500">{i + 1}.</span> {rec}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <div className="print:hidden">
      </div>
    </div>
  );
}
