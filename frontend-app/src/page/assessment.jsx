import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import iconProfilAsasment from "../icon/icon-profil-asasment.svg";
import iconDetakJantung from "../icon/icon-detak jantung.svg";

export default function AssessmentPage({ currentPage, onNavigate }) {
  const [familyHistory, setFamilyHistory] = useState("Ya");

  useEffect(() => {
    document.title = 'Assessment - Web Hearty'
  }, [])

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
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  BMI
                </span>
                <input
                  type="text"
                  placeholder="Masukkan berat badan"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Tekanan darah
                </span>
                <input
                  type="text"
                  placeholder="Masukkan tekanan darah"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Kolestrol
                </span>
                <input
                  type="text"
                  placeholder="Contoh < 200"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Detak jantung
                </span>
                <input
                  type="text"
                  placeholder="Contoh 60 - 100"
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
                <div className="relative mt-3">
                  <select className="w-full appearance-none rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10">
                    <option>Normal</option>
                    <option>Sedang</option>
                    <option>Tinggi</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-slate-400">
                    ▼
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Konsumsi alcohol per-minggu
                </span>
                <input
                  type="text"
                  placeholder="Berapa kali anda konsumsi alkohol"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Rata-rata jumlah langkah per-hari
                </span>
                <input
                  type="text"
                  placeholder="Rata-rata langkah harian contoh > 5000"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Level stress
                </span>
                <div className="relative mt-3">
                  <select className="w-full appearance-none rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10">
                    <option>Normal 0 - 14</option>
                    <option>Sedang 15 - 21</option>
                    <option>Tinggi 22+</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-slate-400">
                    ▼
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Jumlah jam aktivitas fisik per-minggu
                </span>
                <input
                  type="text"
                  placeholder="Contoh 1 jam 15 menit"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Rata-rata durasi tidur per-malam
                </span>
                <input
                  type="text"
                  placeholder="Contoh 8 jam 10 menit"
                  className="mt-3 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5a]/10"
                />
              </label>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 justify-end text-right sm:flex-row sm:items-center sm:justify-end">
          <button className="inline-flex items-center justify-center rounded-full bg-[#dddddd] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300">
            Lihat ringkasan
          </button>
          <button className="inline-flex items-center justify-center rounded-full bg-[#1e3a5a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173652]">
            Simpan dan lihat hasil
          </button>
        </div>
      </main>
    </div>
  );
}
