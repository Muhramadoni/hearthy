import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Chatbot from "../components/Chatbot.jsx";
import iconLaporan from "../icon/icon-laporan.svg";
import { getAssessments } from "../services/assessmentService.js";

export default function HistoryPage({ currentPage, onNavigate }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [historyGroups, setHistoryGroups] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    document.title = "History - Web Hearty";
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await getAssessments(100, 0);
      const assessments = (res.assessments || [])
        .filter((a) => a.type === "cardiovascular")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Group by month
      const groups = {};
      assessments.forEach((record) => {
        const d = new Date(record.created_at);
        const monthYear = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
        if (!groups[monthYear]) {
          groups[monthYear] = [];
        }
        groups[monthYear].push({
          id: record.id,
          date: d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          rawDate: d,
        });
      });

      const formattedGroups = Object.keys(groups).map((label) => ({
        label,
        records: groups[label],
      }));

      setHistoryGroups(formattedGroups);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleDetailClick = (id) => {
    localStorage.setItem("selected_history_id", id);
    onNavigate?.("history-detail");
  };

  // Flatten, filter, and limit records for pagination
  const allFilteredRecords = [];
  historyGroups.forEach((group) => {
    if (!selectedDate) {
      allFilteredRecords.push(...group.records);
    } else {
      const filterD = new Date(selectedDate);
      const matched = group.records.filter(
        (r) => r.rawDate.toDateString() === filterD.toDateString()
      );
      allFilteredRecords.push(...matched);
    }
  });

  const visibleRecords = allFilteredRecords.slice(0, visibleCount);

  // Regroup visible records by month
  const displayGroupsMap = {};
  visibleRecords.forEach((record) => {
    const monthYear = record.rawDate.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    if (!displayGroupsMap[monthYear]) displayGroupsMap[monthYear] = [];
    displayGroupsMap[monthYear].push(record);
  });

  const finalDisplayGroups = Object.keys(displayGroupsMap).map((label) => ({
    label,
    records: displayGroupsMap[label],
  }));

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-900">
      <Navbar
        currentPage={currentPage ?? "history"}
        onNavigate={onNavigate ?? (() => {})}
      />
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
                <button 
                  onClick={() => setSelectedDate("")}
                  className="inline-flex min-w-[120px] items-center justify-center rounded-2xl bg-[#1b4062] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#163551]"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-10">
            {finalDisplayGroups.length === 0 && (
              <p className="text-center text-slate-500">Belum ada riwayat asesmen.</p>
            )}
            {finalDisplayGroups.map((group) => (
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
                      className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.2)] transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
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
                        <button
                          type="button"
                          onClick={() => handleDetailClick(record.id)}
                          className="font-medium text-sky-700 transition hover:text-sky-800"
                        >
                          Lihat Selengkapnya
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {allFilteredRecords.length > 9 && (
              <div className="mt-12 flex justify-center pb-8">
                {visibleCount < allFilteredRecords.length ? (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 9)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    Tampilkan lebih banyak
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => setVisibleCount(9)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    Tampilkan lebih sedikit
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Chatbot />
    </div>
  );
}
