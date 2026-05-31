import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import { getAssessments, deleteAssessment } from "../services/assessmentService.js";
import Swal from "sweetalert2";

export default function HistoryPage({ currentPage, onNavigate }) {
  const [historyData, setHistoryData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setActiveDropdown(null);
    const result = await Swal.fire({
      title: "Hapus Riwayat?",
      text: "Riwayat asesmen ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#e2e8f0",
      customClass: {
        cancelButton: "!text-slate-900",
        popup: "!rounded-3xl",
      },
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteAssessment(id);
        setHistoryData(prev => prev.filter(h => h.id !== id));
      } catch (err) {
        Swal.fire({ title: "Gagal", text: "Gagal menghapus data.", icon: "error" });
      }
    }
  };

  useEffect(() => {
    document.title = "Riwayat Asesmen - Web Hearty";
    getAssessments(50, 0).then(res => {
      setHistoryData(res.assessments || []);
    }).catch(err => console.error("Gagal memuat history", err));
  }, []);

  const filteredHistory = filterDate ? historyData.filter(h => new Date(h.created_at).toISOString().split('T')[0] === filterDate) : historyData;

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950 flex flex-col font-sans">
      <Navbar currentPage={currentPage ?? "history"} onNavigate={onNavigate ?? (() => {})} />
      
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-6 py-6 flex flex-col h-[calc(100vh-80px)]">
        <div className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="flex flex-col h-full custom-scrollbar overflow-y-auto px-4 md:px-12 py-10">
            
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold text-[#1e3a5a]">Riwayat Asesmen</h3>
                    <p className="text-slate-500 font-medium mt-1">Daftar pemeriksaan Anda sebelumnya</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full sm:w-auto px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold outline-none focus:border-[#1e3a5a] focus:ring-4 focus:ring-[#1e3a5a]/10 transition-all bg-white"
                  />
                  {filterDate && (
                    <button 
                      onClick={() => setFilterDate("")}
                      className="p-3 text-red-500 bg-red-50 hover:bg-red-100 border-2 border-transparent rounded-xl transition-colors"
                      title="Hapus Filter"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((h, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        localStorage.setItem("selected_history_id", h.id);
                        onNavigate?.("history-detail");
                      }}
                      className="p-6 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md hover:border-[#1e3a5a]/30 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 block group-hover:text-[#1e3a5a] transition-colors">
                          {new Date(h.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <h4 className="text-xl font-bold text-slate-800 mb-1">{h.score} / 100</h4>
                        <p className="text-slate-500 font-medium">{h.severity}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                          h.severity?.toLowerCase().includes('high') || h.severity?.toLowerCase().includes('tinggi') ? 'bg-red-100 text-red-600' :
                          h.severity?.toLowerCase().includes('moderate') || h.severity?.toLowerCase().includes('sedang') ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {h.score}
                        </div>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === h.id ? null : h.id);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                          
                          {activeDropdown === h.id && (
                            <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-10">
                              <button 
                                onClick={(e) => handleDelete(e, h.id)}
                                className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-slate-50">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <p className="font-semibold text-lg mb-2">Belum ada riwayat asesmen.</p>
                    <p className="text-sm text-slate-500 mb-6">Lakukan asesmen kesehatan pertama Anda untuk melihat hasilnya di sini.</p>
                    <button onClick={() => onNavigate?.("assessment")} className="px-6 py-3 bg-[#1e3a5a] text-white rounded-full font-bold shadow-md hover:bg-[#152840] transition-colors">
                      Mulai Asesmen
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; border: 3px solid transparent; background-clip: content-box; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
      `}</style>
    </div>
  );
}
