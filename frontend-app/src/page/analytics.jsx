/**
 * @fileoverview Halaman Global Analytics (Data Science).
 * Menampilkan dashboard interaktif dari Streamlit menggunakan iframe.
 */
import Navbar from "../components/Navbar.jsx";
import { useEffect } from "react";

export default function AnalyticsPage({ currentPage, onNavigate }) {
  useEffect(() => {
    document.title = "Global Analytics - Web Hearty";
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      <Navbar
        currentPage={currentPage ?? "analytics"}
        onNavigate={onNavigate ?? (() => {})}
      />
      <main className="mx-auto max-w-screen-2xl px-6 py-10">
        <section className="mb-8">
          <p className="text-sm font-semibold text-slate-600">
            Analisis Data Populasi
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950">Global Analytics</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Eksplorasi wawasan dan kesimpulan dari ribuan data kesehatan kardiovaskular secara interaktif, yang dianalisis oleh tim Data Science kami.
          </p>
        </section>

        <section className="mb-8">
          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70" style={{ height: "1200px" }}>
            <iframe 
              src="http://localhost:8502/?embed=true" 
              width="100%" 
              height="100%" 
              frameBorder="0"
              title="Streamlit Dashboard"
              style={{ border: "none" }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
