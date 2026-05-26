/**
 * @fileoverview Halaman Asesmen (Assessment Page) - Full Chatbot.
 * Chatbot full-page untuk pengumpulan data klinis dan prediksi AI,
 * dilengkapi panel riwayat asesmen (History) yang bisa diakses via icon jam.
 */
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar.jsx";
import { getAssessments, getAssessmentById, deleteAssessment } from "../services/assessmentService.js";
import Swal from "sweetalert2";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AssessmentPage({ currentPage, onNavigate }) {
  const [messages, setMessages] = useState(() => {
    const activeId = sessionStorage.getItem("hearthy_active_history_id");
    if (activeId) {
      return [{ text: "Memuat riwayat...", sender: "bot" }];
    }
    
    const savedMessages = sessionStorage.getItem("hearthy_agent_messages");
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }

    return [];
  });
  
  const [collectedData, setCollectedData] = useState(() => {
    const saved = sessionStorage.getItem("hearthy_agent_collected");
    return saved ? JSON.parse(saved) : {};
  });

  const [inputValue, setInputValue] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Save state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("hearthy_agent_messages", JSON.stringify(messages));
    sessionStorage.setItem("hearthy_agent_collected", JSON.stringify(collectedData));
  }, [messages, collectedData]);

  // Initial greeting if no messages
  useEffect(() => {
    const activeId = sessionStorage.getItem("hearthy_active_history_id");
    if (!activeId && messages.length === 0 && !isAgentTyping) {
      sendToAgent("Halo, saya ingin memulai asesmen risiko jantung.");
    }
  }, [messages]);

  // Load active history on mount if it exists
  useEffect(() => {
    const activeId = sessionStorage.getItem("hearthy_active_history_id");
    if (activeId) {
      handleHistoryClick(activeId);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping]);

  useEffect(() => {
    document.title = "Assessment - Web Hearty";
  }, []);

  // Load history records
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await getAssessments(100, 0);
        const assessments = (res.assessments || [])
          .filter((a) => a.type === "cardiovascular")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setHistoryRecords(assessments);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    }
    loadHistory();
  }, []);

  const sendToAgent = async (userMessage) => {
    const token = localStorage.getItem("hearthy_token");
    if (!token) {
      setMessages(prev => [...prev, { text: "Anda harus login untuk menggunakan fitur ini.", sender: "bot" }]);
      return;
    }

    if (userMessage.toLowerCase() === "mulai asesmen baru" || userMessage.toLowerCase() === "baru") {
      handleNewChat();
      return;
    }

    // Add user message to UI immediately if it's not the initial hidden trigger
    if (userMessage !== "Halo, saya ingin memulai asesmen risiko jantung.") {
      setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);
    }
    
    setInputValue("");
    setIsAgentTyping(true);
    setIsInputDisabled(true);

    try {
      const activeId = sessionStorage.getItem("hearthy_active_history_id");
      const endpoint = activeId 
        ? `http://localhost:5000/api/assessments/chat/${activeId}`
        : "http://localhost:5000/api/assessments/chat";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          chat_history: messages.filter(m => m.type !== 'result'),
          collected_data: collectedData
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal menghubungi AI");
      }
      
      const resJson = await res.json();
      const aiData = resJson.data;

      if (aiData.final_chat_history) {
        setMessages(aiData.final_chat_history);
      } else {
        setMessages(prev => [...prev, { text: aiData.reply, sender: "bot" }]);
      }
      
      // Update collected data state
      if (aiData.collected_data) {
        setCollectedData(aiData.collected_data);
      }

      // If assessment is complete, set the active history ID and disable input
      if (aiData.is_complete && aiData.prediction_result) {
        
        if (aiData.assessment_id) {
          sessionStorage.setItem("hearthy_active_history_id", aiData.assessment_id);
        }
      } else {
        setIsInputDisabled(false);
      }

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { text: `❌ Terjadi kesalahan: ${error.message}. Silakan coba ketik ulang jawaban Anda.`, sender: "bot" }
      ]);
      setIsInputDisabled(false);
    } finally {
      setIsAgentTyping(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendToAgent(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleNewChat = () => {
    sessionStorage.removeItem("hearthy_active_history_id");
    sessionStorage.removeItem("hearthy_agent_messages");
    sessionStorage.removeItem("hearthy_agent_collected");
    setMessages([]);
    setCollectedData({});
    setInputValue("");
    setIsInputDisabled(false);
  };

  const handleHistoryClick = async (id) => {
    if (activeDropdown === id) return;

    try {
      sessionStorage.setItem("hearthy_active_history_id", id);
      const res = await getAssessmentById(id);
      const data = res.assessment;
      const dateStr = new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

      if (data.chat_history && data.chat_history.length > 0) {
        setMessages(data.chat_history);
      } else {
        const ans = data.answers || {};
        const severityStr = data.severity === 'high' ? 'Tinggi' : data.severity === 'moderate' ? 'Sedang' : 'Rendah';
        const score = data.score || 0;
        const insights = data.aiInsights || "Perhatikan gaya hidup dan pola makan Anda.";

        setMessages([
          { text: `📅 Menampilkan riwayat percakapan asesmen tanggal ${dateStr} WIB.`, sender: "bot" },
          { type: "result", data: { score, severityStr, insights, finalAnswers: ans }, sender: "bot" }
        ]);
      }
      
      setIsInputDisabled(true);
      setInputValue("");
      setIsHistoryOpen(false);
    } catch (err) {
      console.error(err);
      setMessages([{ text: "Gagal memuat detail riwayat. Silakan coba lagi.", sender: "bot" }]);
    }
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    setActiveDropdown(null);

    const result = await Swal.fire({
      title: "Hapus Riwayat?",
      text: "Riwayat asesmen ini akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#e2e8f0",
      customClass: {
        cancelButton: "!text-slate-900",
        popup: "!rounded-3xl",
        title: "!text-[#1e3a5a]",
      },
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteAssessment(id);
        setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
        Swal.fire({
          title: "Terhapus!",
          text: "Riwayat telah berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#1e3a5a",
          customClass: { popup: "!rounded-3xl" },
        });
      } catch (err) {
        Swal.fire({
          title: "Gagal",
          text: err.message || "Gagal menghapus riwayat.",
          icon: "error",
          confirmButtonColor: "#1e3a5a",
          customClass: { popup: "!rounded-3xl" },
        });
      }
    }
  };

  const filteredHistoryRecords = historyRecords.filter((record) => {
    if (!selectedDate) return true;
    const recordDate = new Date(record.created_at).toISOString().split('T')[0];
    return recordDate === selectedDate;
  });

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950 flex flex-col">
      <Navbar
        currentPage={currentPage ?? "assessment"}
        onNavigate={onNavigate ?? (() => {})}
      />

      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 md:px-6 py-2 md:py-4 flex flex-col h-[calc(100vh-120px)]">
        <div className="bg-white rounded-[32px] shadow-[0_24px_80px_-28px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70 flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1e3a5a] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Hearthy - Asesmen AI</h2>
              <p className="text-xs text-slate-500">Wawancara Medis Terpandu</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHistoryOpen(true)}
              title="Riwayat Asesmen"
              className="p-2.5 hover:bg-slate-100 rounded-full transition text-slate-500 hover:text-slate-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
            <button
              onClick={handleNewChat}
              title="Chat Baru"
              className="p-2.5 hover:bg-slate-100 rounded-full transition text-slate-500 hover:text-slate-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/50">
          <div className="w-full space-y-5">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-5 py-3.5 rounded-2xl text-[15px] max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#1e3a5a] text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                  }`}
                >
                  {msg.type === "result" ? (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex items-center gap-2 text-[#1e3a5a] font-bold pb-2 border-b border-slate-100">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Analisis Selesai
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-sm">
                        <p className="font-semibold text-slate-700 border-b border-slate-200 pb-1 mb-2">Ringkasan Data Skrining</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <p><span className="text-slate-500">Usia:</span> {msg.data.finalAnswers.age} thn</p>
                          <p><span className="text-slate-500">BMI:</span> {msg.data.finalAnswers.bmi}</p>
                          <p><span className="text-slate-500">Tensi:</span> {msg.data.finalAnswers.systolic_bp}/{msg.data.finalAnswers.diastolic_bp} mmHg</p>
                          <p><span className="text-slate-500">Kolesterol:</span> {msg.data.finalAnswers.cholesterol_mg_dl} mg/dL</p>
                          <p><span className="text-slate-500">Detak Jantung:</span> {msg.data.finalAnswers.resting_heart_rate} bpm</p>
                          <p><span className="text-slate-500">Gula Diet:</span> {msg.data.finalAnswers.diet_quality_score}/10</p>
                          <p><span className="text-slate-500">Aktivitas:</span> {msg.data.finalAnswers.physical_activity_hours_per_week} jam/mgg</p>
                          <p><span className="text-slate-500">Langkah:</span> {msg.data.finalAnswers.daily_steps}</p>
                          <p className="col-span-2"><span className="text-slate-500">Riwayat Keluarga:</span> {msg.data.finalAnswers.family_history_heart_disease ? "Ya" : "Tidak"}</p>
                        </div>
                      </div>

                      <div className="bg-[#1e3a5a]/5 p-4 rounded-xl border border-[#1e3a5a]/10 mt-1">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Hasil Prediksi Risiko Kardiovaskular</p>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl font-bold text-[#1e3a5a]">{msg.data.score}%</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            msg.data.severityStr === 'Tinggi' ? 'bg-red-100 text-red-700' : 
                            msg.data.severityStr === 'Sedang' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>{msg.data.severityStr}</span>
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed text-justify prose prose-sm max-w-none">
                          <strong className="block mb-2">Rekomendasi AI:</strong>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-inherit" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2" {...props} />
                            }}
                          >
                            {msg.data.insights}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="pl-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-inherit" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isAgentTyping && (
              <div className="flex justify-start">
                <div className="px-5 py-3.5 rounded-2xl text-[15px] max-w-[85%] bg-white border border-slate-200 text-slate-800 rounded-tl-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 z-10 relative">
          <div className="w-full flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isInputDisabled}
              className={`flex-1 border-2 border-slate-200 rounded-2xl px-5 py-3.5 text-[15px] focus:border-[#1e3a5a] focus:ring-4 focus:ring-[#1e3a5a]/10 focus:outline-none transition-all ${
                isInputDisabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white text-slate-900"
              }`}
              placeholder={isInputDisabled ? "Asesmen selesai..." : "Ketik pesan Anda di sini..."}
            />
            <button
              onClick={() => handleSend()}
              disabled={isInputDisabled || isAgentTyping || !inputValue.trim()}
              className={`px-6 py-3.5 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                isInputDisabled || isAgentTyping || !inputValue.trim()
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-[#1e3a5a] text-white hover:bg-[#173652] hover:shadow-lg hover:shadow-[#1e3a5a]/20"
              }`}
            >
              <span className="hidden sm:inline">Kirim</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
        </div>
      </main>

      {/* History Sidebar Overlay */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      {/* History Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isHistoryOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#1e3a5a] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-950">Riwayat Asesmen</h2>
          </div>
          <button
            onClick={() => setIsHistoryOpen(false)}
            title="Tutup"
            className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Date Filter */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-[#1e3a5a] focus:border-[#1e3a5a] block w-full px-3 py-2 outline-none transition"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              title="Hapus Filter"
              className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 border border-slate-200"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {filteredHistoryRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-3 text-slate-300">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Belum ada riwayat asesmen pada tanggal tersebut.
            </div>
          ) : (
            filteredHistoryRecords.map((record) => {
              const d = new Date(record.created_at);
              const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
              const timeStr = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
              const severityColor = record.severity === "high" ? "bg-red-100 text-red-700"
                : record.severity === "moderate" ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700";

              return (
                <div key={record.id} className="relative group">
                  <button
                    onClick={() => handleHistoryClick(record.id)}
                    className="w-full text-left rounded-2xl bg-white p-4 pr-10 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1e3a5a]/30 transition-all block"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1e3a5a] transition-colors">{dateStr}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${severityColor}`}>
                        {record.severity || "unknown"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{timeStr}</span>
                      <span className="text-xs font-medium text-slate-500">Skor: {record.score || 0}%</span>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === record.id ? null : record.id);
                    }}
                    className="absolute top-4 right-3 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    title="Opsi"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <circle cx="12" cy="5" r="2"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                      <circle cx="12" cy="19" r="2"></circle>
                    </svg>
                  </button>

                  {activeDropdown === record.id && (
                    <div className="absolute top-12 right-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                      <button
                        onClick={(e) => handleDeleteHistory(e, record.id)}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
