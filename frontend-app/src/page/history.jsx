import { useState } from "react";
import iconLaporan from "../icon/icon-laporan.svg";

const historyGroups = [
  {
    label: "April 2026",
    records: [
      { date: "24 April 2026", time: "12.00 WIB" },
      { date: "24 April 2026", time: "12.00 WIB" },
      { date: "24 April 2026", time: "12.00 WIB" },
    ],
  },
  {
    label: "Maret 2026",
    records: [
      { date: "24 Maret 2026", time: "12.00 WIB" },
      { date: "24 Maret 2026", time: "12.00 WIB" },
      { date: "24 Maret 2026", time: "12.00 WIB" },
    ],
  },
  {
    label: "Februari 2026",
    records: [
      { date: "24 Februari 2026", time: "12.00 WIB" },
      { date: "24 Februari 2026", time: "12.00 WIB" },
      { date: "24 Februari 2026", time: "12.00 WIB" },
    ],
  },
];

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState("");

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-900">
      <main className="mx-auto max-w-screen-2xl px-6 py-10">
        <section className="mx-auto max-w-screen-2xl">
          <div className="rounded-[32px] bg-white px-6 py-8 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl text-[#1b4062]">
                  Semua History
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                  Pantau kesehatan Anda secara berkala dengan meninjau riwayat
                  prediksi risiko kardiovaskular sebelumnya.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <div className="relative flex min-w-[240px] max-w-[320px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button className="inline-flex min-w-[120px] items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-10">
            {historyGroups.map((group) => (
              <section key={group.label} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-950">
                    {group.label}
                  </h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.records.map((record, index) => (
                    <article
                      key={`${group.label}-${index}`}
                      className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.2)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                          <img
                            src={iconLaporan}
                            alt="Laporan icon"
                            className="h-5 w-5"
                          />
                        </div>
                        <p className="text-base font-semibold text-slate-950">
                          {record.date}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
                        <span>{record.time}</span>
                        <a
                          href="#"
                          className="font-medium text-sky-700 transition hover:text-sky-800"
                        >
                          Lihat Selengkapnya
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
