import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { getAssessmentById } from "../services/assessmentService.js";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from "html2pdf.js";

export default function HistoryDetailPage({ currentPage, onNavigate }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

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
      Swal.fire("Error", "Gagal memuat detail", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Detail History - Hearthy";
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col text-slate-500">
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
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col text-slate-500">
        <Navbar
          currentPage={currentPage ?? "history"}
          onNavigate={onNavigate ?? (() => {})}
        />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div>Data tidak ditemukan.</div>
          <button
            onClick={() => onNavigate?.("history")}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#1e3a5a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#152840]"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    const element = document.getElementById('pdf-export-template');
    
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `Hearthy_Report_${new Date(assessment.created_at).toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, windowWidth: 600 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const riskMap = { "high": "Tinggi", "moderate": "Sedang", "low": "Rendah", "High": "Tinggi", "Medium": "Sedang", "Low": "Rendah" };
  const mappedRisk = riskMap[assessment.severity] || assessment.severity;
  const isHigh = assessment.severity?.toLowerCase() === 'high';
  const isMed = assessment.severity?.toLowerCase() === 'moderate' || assessment.severity?.toLowerCase() === 'medium';
  
  const scoreColor = isHigh ? 'text-[#ef4444]' : isMed ? 'text-[#eab308]' : 'text-[#22c55e]';
  const bgColor = isHigh ? 'bg-[#fef2f2]' : isMed ? 'bg-[#fefce8]' : 'bg-[#f0fdf4]';

  let insights = assessment.ai_insights || assessment.recommendations || "Perhatikan selalu gaya hidup Anda.";
  if (typeof insights === 'string' && insights.trim() === '[]') {
    insights = "Tidak ada rekomendasi spesifik yang ditemukan.";
  } else if (Array.isArray(insights)) {
    if (insights.length === 0) insights = "Tidak ada rekomendasi spesifik yang ditemukan.";
    else insights = insights.map((r, i) => `${i+1}. ${r}`).join('\n');
  }

  const score = Math.round(assessment.score || 0);

  const ans = assessment.answers || {};
  const screeningData = [
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
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-[#0f172a] flex flex-col font-sans print:bg-[#ffffff]">
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

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col h-[calc(100vh-80px)]">
        <div className="bg-[#ffffff] rounded-[40px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] border border-[#f1f5f9] flex flex-col h-full overflow-hidden">
          
          <div className="flex justify-between items-center p-6 border-b border-[#f1f5f9]">
            <button
              onClick={() => onNavigate?.("history")}
              className="flex items-center gap-2 text-[#64748b] hover:text-[#1e3a5a] font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              Kembali
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5a] text-[#ffffff] rounded-xl font-bold hover:bg-[#152840] transition-colors shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download PDF
            </button>
          </div>

          <div className="flex flex-col h-full overflow-y-auto px-4 md:px-10 py-8 custom-scrollbar">
            <div className="bg-[#ffffff] p-2">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-[#1e3a5a]">Riwayat Hasil Prediksi</h2>
                <p className="text-[#64748b] mt-2 font-medium">Tanggal Asesmen: {new Date(assessment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl mx-auto">
                {/* Left Col - Score Card */}
                <div className="lg:col-span-5 space-y-6">
                <div className={`p-8 rounded-[32px] border-2 ${isHigh ? 'border-[#fee2e2] shadow-[0_20px_25px_-5px_rgba(254,226,226,0.5)]' : 'border-[#f1f5f9] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]'}`}>
                  <p className="text-[#64748b] font-bold uppercase tracking-widest text-sm mb-2 text-center">Skor Risiko</p>
                  <div className="flex items-end justify-center gap-2 mb-6">
                    <span className={`text-7xl font-black ${scoreColor} leading-none`}>{score}</span>
                    <span className="text-2xl font-bold text-[#cbd5e1] mb-2">/ 100</span>
                  </div>
                  
                  <div className={`p-4 rounded-2xl flex items-center justify-between ${bgColor}`}>
                    <span className="font-bold text-[#334155]">Tingkat Risiko</span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase ${
                        isHigh ? 'bg-[#fecaca] text-[#991b1b]' : 
                        isMed ? 'bg-[#fef08a] text-[#854d0e]' : 'bg-[#bbf7d0] text-[#166534]'
                    }`}>{mappedRisk}</span>
                  </div>
                </div>

                <div className="bg-[#ffffff] p-6 rounded-3xl border border-[#f1f5f9] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                  <p className="text-[#1e293b] font-bold text-lg mb-4">Data Skrining</p>
                  <div className="space-y-3">
                    {screeningData.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-3xl bg-[#E8EBEE] px-5 py-4 text-sm text-slate-800 shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col - AI Insights */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div 
                  className="p-8 rounded-[32px] text-[#ffffff] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
                  style={{ background: 'linear-gradient(to bottom right, #1e3a5a, #254b75)' }}
                >
                  <div className="mb-6 border-b border-[#3b5b82] pb-4">
                    <h3 className="text-2xl font-bold">Hasil Analisis</h3>
                  </div>
                  <div className="max-w-none text-[#eff6ff]">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({...props}) => <p className="mb-4 leading-relaxed text-[#eff6ff]" {...props} />,
                          ul: ({...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 text-[#eff6ff]" {...props} />,
                          li: ({...props}) => <li className="pl-1" {...props} />,
                          strong: ({...props}) => <strong className="font-bold text-[#ffffff]" {...props} />,
                        }}
                      >
                        {insights}
                      </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Removed on-screen Skrining to keep it looking like prediction screen */}
            </div>
          </div>
        </div>
      </main>

      {/* HIDDEN PDF TEMPLATE (Mobile-like clean layout) */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none">
        <div id="pdf-export-template" className="w-[600px] bg-[#ffffff] p-8 font-sans text-[#0f172a]">
          
          {/* Header */}
          <div className="border-b-2 border-[#f1f5f9] pb-6 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1e3a5a] mb-1">Hearthy Report</h1>
              <p className="text-[#64748b] text-sm font-medium">Asesmen Risiko Kardiovaskular</p>
            </div>
            <div className="text-right">
              <p className="text-[#94a3b8] text-xs font-bold uppercase mb-1">Tanggal</p>
              <p className="text-[#1e293b] font-bold text-sm">{new Date(assessment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Score & Risk */}
          <div className="flex gap-4 mb-6" style={{ pageBreakInside: 'avoid' }}>
            <div className="flex-1 bg-[#f8fafc] p-6 rounded-3xl border border-[#f1f5f9] text-center">
              <p className="text-[#64748b] text-xs font-bold uppercase tracking-widest mb-2">Skor Risiko</p>
              <div className="flex items-end justify-center gap-1">
                <span className={`text-5xl font-black ${scoreColor} leading-none`}>{score}</span>
                <span className="text-lg font-bold text-[#cbd5e1] mb-1">/ 100</span>
              </div>
            </div>
            <div className={`flex-1 p-6 rounded-3xl border text-center flex flex-col justify-center items-center ${isHigh ? 'bg-[#fef2f2] border-[#fee2e2]' : isMed ? 'bg-[#fefce8] border-[#fef08a]' : 'bg-[#f0fdf4] border-[#bbf7d0]'}`}>
               <p className="text-[#334155] text-xs font-bold uppercase tracking-widest mb-2">Tingkat Risiko</p>
               <span className={`text-xl font-black uppercase ${isHigh ? 'text-[#991b1b]' : isMed ? 'text-[#854d0e]' : 'text-[#166534]'}`}>{mappedRisk}</span>
            </div>
          </div>

          {/* Data Skrining Awal */}
          <div className="mb-6" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-lg font-bold text-[#1e3a5a] mb-3 border-b border-[#f1f5f9] pb-2">1. Data Medis & Gaya Hidup</h2>
            <div className="bg-[#f8fafc] p-5 rounded-2xl border border-[#f1f5f9]">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {screeningData.map((item, index) => (
                  <div key={index} className="text-[#1e293b] font-medium text-xs border-b border-[#f1f5f9] pb-1">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="break-inside-avoid">
            <h2 className="text-lg font-bold text-[#1e3a5a] mb-3 border-b border-[#f1f5f9] pb-2">2. Analisis & Rekomendasi (AI)</h2>
            <div className="text-[#334155] text-sm leading-relaxed bg-[#f8fafc] p-5 rounded-2xl border border-[#f1f5f9]">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({...props}) => <p className="mb-3 text-[#334155] break-inside-avoid" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-4 mb-3 space-y-1 text-[#334155]" {...props} />,
                  li: ({...props}) => <li className="pl-1 break-inside-avoid" {...props} />,
                  strong: ({...props}) => <strong className="font-bold text-[#0f172a]" {...props} />,
                }}
              >
                {insights}
              </ReactMarkdown>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; border: 3px solid transparent; background-clip: content-box; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
      `}</style>
    </div>
  );
}
