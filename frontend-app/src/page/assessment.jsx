/**
 * @fileoverview Halaman Asesmen (Assessment Page) - Full Chatbot.
 * Chatbot full-page untuk pengumpulan data klinis dan prediksi AI,
 * dilengkapi panel riwayat asesmen (History) yang bisa diakses via icon jam.
 */
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar.jsx";
import { getAssessments, getAssessmentById, deleteAssessment } from "../services/assessmentService.js";
import Swal from "sweetalert2";

const stressOptions = ["Tidak pernah", "Hampir tidak pernah", "Kadang-kadang", "Cukup sering", "Sangat sering"];

const chatSteps = [
  { key: "age", question: "Halo! Mari kita mulai asesmen risiko kardiovaskular Anda. Berapa usia Anda?", type: "number" },
  { key: "bmi", question: "Berapa BMI (Indeks Massa Tubuh) Anda?", type: "number" },
  { key: "systolicBp", question: "Berapa tekanan darah sistolik Anda (angka atas, misal 120)?", type: "number" },
  { key: "diastolicBp", question: "Berapa tekanan darah diastolik Anda (angka bawah, misal 80)?", type: "number" },
  { key: "cholesterol", question: "Berapa kadar kolesterol Anda (mg/dL)?", type: "number" },
  { key: "heartRate", question: "Berapa detak jantung istirahat Anda (bpm)?", type: "number" },
  { key: "familyHistory", question: "Apakah Anda memiliki riwayat keluarga dengan penyakit jantung?", type: "options", options: ["Ya", "Tidak"] },
  { key: "dietLevel", question: "Bagaimana Anda menilai kualitas diet Anda dari skala 1 (Sangat Buruk) hingga 7 (Sangat Baik)?", type: "number" },
  { key: "alcoholUnits", question: "Berapa kali Anda mengonsumsi alkohol per minggu?", type: "number" },
  { key: "dailySteps", question: "Berapa rata-rata jumlah langkah kaki Anda per hari?", type: "number" },
  { key: "stress1", question: "Mari kita evaluasi tingkat stres Anda. Seberapa sering kamu merasa kesal karena sesuatu yang terjadi secara tidak terduga?", type: "options", options: stressOptions },
  { key: "stress2", question: "Seberapa sering kamu merasa tidak mampu mengendalikan hal-hal penting dalam hidupmu?", type: "options", options: stressOptions },
  { key: "stress3", question: "Seberapa sering kamu merasa gugup dan tertekan?", type: "options", options: stressOptions },
  { key: "stress4", question: "Seberapa sering kamu merasa yakin dengan kemampuanmu menangani masalah pribadi?", type: "options", options: stressOptions },
  { key: "stress5", question: "Seberapa sering kamu merasa bahwa segala sesuatu berjalan sesuai keinginanmu?", type: "options", options: stressOptions },
  { key: "stress6", question: "Seberapa sering kamu merasa tidak mampu mengatasi semua hal yang harus kamu lakukan?", type: "options", options: stressOptions },
  { key: "stress7", question: "Seberapa sering kamu mampu mengendalikan rasa jengkel dalam hidupmu?", type: "options", options: stressOptions },
  { key: "stress8", question: "Seberapa sering kamu merasa bahwa kamu menguasai keadaan?", type: "options", options: stressOptions },
  { key: "stress9", question: "Seberapa sering kamu merasa marah karena hal-hal di luar kendalimu?", type: "options", options: stressOptions },
  { key: "stress10", question: "Seberapa sering kamu merasa kesulitan yang menumpuk begitu banyak sehingga kamu tidak bisa mengatasinya?", type: "options", options: stressOptions },
  { key: "physicalActivity", question: "Berapa jam aktivitas fisik yang Anda lakukan per minggu?", type: "number" },
  { key: "sleepDuration", question: "Berapa jam rata-rata Anda tidur per malam?", type: "number" },
];

export default function AssessmentPage({ currentPage, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem("hearthy_currentStep");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem("hearthy_answers");
    return saved ? JSON.parse(saved) : {};
  });

  const [messages, setMessages] = useState(() => {
    const activeId = sessionStorage.getItem("hearthy_active_history_id");
    if (activeId) {
      return [{ text: "Memuat riwayat...", sender: "bot" }];
    }
    
    const savedAnswers = sessionStorage.getItem("hearthy_answers");
    const savedStep = sessionStorage.getItem("hearthy_currentStep");
    
    if (savedAnswers && savedStep) {
      const parsedAnswers = JSON.parse(savedAnswers);
      const stepInt = parseInt(savedStep, 10);
      const reconstructed = [];
      
      for (let i = 0; i <= stepInt; i++) {
        if (i === chatSteps.length) break;
        reconstructed.push({ text: chatSteps[i].question, sender: "bot", options: chatSteps[i].options });
        
        if (i < stepInt) {
          const ansVal = parsedAnswers[chatSteps[i].key];
          if (ansVal !== undefined) {
             reconstructed[reconstructed.length - 1].options = undefined;
             reconstructed.push({ text: ansVal.toString(), sender: "user" });
          }
        }
      }
      if (reconstructed.length > 0) return reconstructed;
    }

    return [{ text: chatSteps[0].question, sender: "bot", options: chatSteps[0].options }];
  });
  const [inputValue, setInputValue] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const messagesEndRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Save state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("hearthy_currentStep", currentStep.toString());
    sessionStorage.setItem("hearthy_answers", JSON.stringify(answers));
  }, [currentStep, answers]);

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
  }, [messages]);

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

  const calculateStressLevel = (stressAns) => {
    const scores = {
      "Tidak pernah": 0,
      "Hampir tidak pernah": 1,
      "Kadang-kadang": 2,
      "Cukup sering": 3,
      "Sangat sering": 4,
    };
    
    let totalScore = 0;
    const reverseQuestions = ["stress4", "stress5", "stress7", "stress8"];
    
    for (let i = 1; i <= 10; i++) {
      const key = `stress${i}`;
      let score = scores[stressAns[key]];
      if (reverseQuestions.includes(key)) {
        score = 4 - score;
      }
      totalScore += score;
    }

    if (totalScore <= 13) return 3;
    if (totalScore <= 26) return 6;
    return 9;
  };

  const submitAssessment = async (finalAnswers) => {
    const familyVal = finalAnswers.familyHistory === "Ya" ? 1 : 0;
    const stressVal = calculateStressLevel(finalAnswers);

    const extractNumber = (val) => {
      if (typeof val === 'number') return val;
      const match = String(val).match(/-?\d+(\.\d+)?/);
      return match ? parseFloat(match[0]) : 0;
    };

    const payload = {
      answers: {
        age: parseInt(extractNumber(finalAnswers.age)),
        bmi: parseFloat(extractNumber(finalAnswers.bmi)),
        systolic_bp: parseInt(extractNumber(finalAnswers.systolicBp)),
        diastolic_bp: parseInt(extractNumber(finalAnswers.diastolicBp)),
        cholesterol_mg_dl: parseInt(extractNumber(finalAnswers.cholesterol)),
        resting_heart_rate: parseInt(extractNumber(finalAnswers.heartRate)),
        daily_steps: parseInt(extractNumber(finalAnswers.dailySteps)),
        stress_level: stressVal,
        physical_activity_hours_per_week: parseInt(extractNumber(finalAnswers.physicalActivity)),
        sleep_hours: parseFloat(extractNumber(finalAnswers.sleepDuration)),
        family_history_heart_disease: familyVal,
        diet_quality_score: parseInt(extractNumber(finalAnswers.dietLevel)),
        alcohol_units_per_week: parseFloat(extractNumber(finalAnswers.alcoholUnits)),
      },
      chatHistory: messages.filter(msg => !msg.isLoading).map((msg, idx, arr) => {
        if (idx === arr.length - 1) return { ...msg, options: undefined };
        return msg;
      })
    };

    try {
      const token = localStorage.getItem("hearthy_token");
      const activeId = sessionStorage.getItem("hearthy_active_history_id");
      
      let url = "http://localhost:5000/api/assessments/predict";
      let method = "POST";
      
      if (activeId) {
        url = `http://localhost:5000/api/assessments/predict/${activeId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Gagal melakukan prediksi");
      }

      const newAssessmentId = data.data.assessment.id;
      sessionStorage.setItem("hearthy_active_history_id", newAssessmentId);
      
      const newMessages = data.data.assessment.chat_history || [];
      if (newMessages.length > 0) {
        setMessages(newMessages);
      }


      setCurrentStep(chatSteps.length); // Disable input

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { text: `❌ Terjadi kesalahan: ${error.message}. Silakan muat ulang halaman.`, sender: "bot" }
      ]);
    }
  };

  const handleSend = (val) => {
    const value = val || inputValue;
    if (!value.trim()) return;

    if (value.toLowerCase() === "mulai asesmen baru" || value.toLowerCase() === "baru") {
      // sessionStorage.removeItem("hearthy_active_history_id");
      sessionStorage.removeItem("hearthy_currentStep");
      sessionStorage.removeItem("hearthy_answers");
      setMessages((prev) => [
        ...prev,
        { text: value, sender: "user" },
        { text: chatSteps[0].question, sender: "bot", options: chatSteps[0].options }
      ]);
      setCurrentStep(0);
      setAnswers({});
      setInputValue("");
      return;
    }

    if (currentStep >= chatSteps.length) {
      setMessages((prev) => [
        ...prev,
        { text: value, sender: "user" },
        { text: "Sesi asesmen ini telah selesai. Ketik 'Mulai Asesmen Baru' jika Anda ingin mengulang tes.", sender: "bot" }
      ]);
      setInputValue("");
      return;
    }

    const step = chatSteps[currentStep];
    const newAnswers = { ...answers, [step.key]: value };
    setAnswers(newAnswers);
    setInputValue("");

    setMessages((prev) => {
      const updatedMessages = prev.map((msg, idx) => {
        if (idx === prev.length - 1) return { ...msg, options: undefined };
        return msg;
      });
      return [...updatedMessages, { text: value, sender: "user" }];
    });

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < chatSteps.length) {
      setTimeout(() => {
        setCurrentStep(nextStepIndex);
        setMessages((prev) => [
          ...prev,
          { text: chatSteps[nextStepIndex].question, sender: "bot", options: chatSteps[nextStepIndex].options }
        ]);
      }, 500);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { 
            text: (
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#1e3a5a] animate-spin">
                  <path d="M5 22h14"></path>
                  <path d="M5 2h14"></path>
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                </svg>
                <span>Tunggu sebentar, AI kami sedang menganalisis risiko kardiovaskular Anda...</span>
              </div>
            ), 
            sender: "bot",
            isLoading: true
          }
        ]);
        submitAssessment(newAnswers);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleNewChat = () => {
    sessionStorage.removeItem("hearthy_active_history_id");
    sessionStorage.removeItem("hearthy_currentStep");
    sessionStorage.removeItem("hearthy_answers");
    setMessages([{ text: chatSteps[0].question, sender: "bot", options: chatSteps[0].options }]);
    setCurrentStep(0);
    setAnswers({});
    setInputValue("");
  };

  const handleHistoryClick = async (id) => {
    // If clicking the 3-dots menu, don't trigger history load
    if (activeDropdown === id) return;

    try {
      sessionStorage.setItem("hearthy_active_history_id", id);
      // Fetch full assessment detail
      const res = await getAssessmentById(id);
      const data = res.assessment;
      const dateStr = new Date(data.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

      // Check if chat_history exists
      if (data.chat_history && data.chat_history.length > 0) {
        setMessages(data.chat_history);
      } else {
        // Fallback for old records
        const ans = data.answers || {};
        const reconstructedMessages = [
          { text: `📅 Menampilkan riwayat percakapan asesmen tanggal ${dateStr} WIB.`, sender: "bot" }
        ];

        const mapKeyToDb = {
          age: "age",
          bmi: "bmi",
          systolicBp: "systolic_bp",
          diastolicBp: "diastolic_bp",
          cholesterol: "cholesterol_mg_dl",
          heartRate: "resting_heart_rate",
          familyHistory: "family_history_heart_disease",
          dietLevel: "diet_quality_score",
          alcoholUnits: "alcohol_units_per_week",
          dailySteps: "daily_steps",
          physicalActivity: "physical_activity_hours_per_week",
          sleepDuration: "sleep_hours"
        };

        // Reconstruct Q&A
        chatSteps.forEach(step => {
          if (step.key.startsWith("stress")) return; 
          const dbKey = mapKeyToDb[step.key];
          let answerVal = ans[dbKey];
          
          if (step.key === "familyHistory" && answerVal !== undefined) {
            answerVal = answerVal === 1 ? "Ya" : "Tidak";
          }
          
          if (answerVal !== undefined && answerVal !== null) {
            reconstructedMessages.push({ text: step.question, sender: "bot" });
            reconstructedMessages.push({ text: answerVal.toString(), sender: "user" });
          }
        });

        // Handle stress
        if (ans.stress_level !== undefined) {
          const stressStr = ans.stress_level === 3 ? "Rendah" : ans.stress_level === 6 ? "Sedang" : "Tinggi";
          reconstructedMessages.push({ text: "Mari kita evaluasi tingkat stres Anda berdasarkan pertanyaan-pertanyaan sebelumnya.", sender: "bot" });
          reconstructedMessages.push({ text: `(Rekaman) Tingkat stres: ${stressStr}`, sender: "user" });
        }

        // Create the single combined result bubble
        const severityStr = data.severity === 'high' ? 'Tinggi' : data.severity === 'moderate' ? 'Sedang' : 'Rendah';
        const score = data.score || 0;
        const insights = data.aiInsights || "Perhatikan gaya hidup dan pola makan Anda.";

        reconstructedMessages.push(
          { type: "result", data: { score, severityStr, insights, finalAnswers: ans }, sender: "bot" },
          { text: "Ketik 'Mulai Asesmen Baru' atau gunakan icon di pojok kanan atas jika Anda ingin melakukan evaluasi baru.", sender: "bot" }
        );

        setMessages(reconstructedMessages);
      }
      
      setCurrentStep(chatSteps.length); // Disable input
      setAnswers({});
      setInputValue("");
      setIsHistoryOpen(false); // Close sidebar
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

  const currentOptions = messages[messages.length - 1]?.options;
  const isInputDisabled = !!currentOptions;

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

      {/* Card Chatbot */}
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
              <p className="text-xs text-slate-500">Chatbot Prediksi Risiko Kardiovaskular</p>
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
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#1e3a5a] animate-spin">
                        <path d="M5 22h14"></path>
                        <path d="M5 2h14"></path>
                        <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                        <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                      </svg>
                      <span>Tunggu sebentar, AI kami sedang menganalisis risiko kardiovaskular Anda...</span>
                    </div>
                  ) : msg.type === "result" ? (
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
                          <p><span className="text-slate-500">Tensi:</span> {msg.data.finalAnswers.systolicBp || msg.data.finalAnswers.systolic_bp}/{msg.data.finalAnswers.diastolicBp || msg.data.finalAnswers.diastolic_bp} mmHg</p>
                          <p><span className="text-slate-500">Kolesterol:</span> {msg.data.finalAnswers.cholesterol || msg.data.finalAnswers.cholesterol_mg_dl} mg/dL</p>
                          <p><span className="text-slate-500">Detak Jantung:</span> {msg.data.finalAnswers.heartRate || msg.data.finalAnswers.resting_heart_rate} bpm</p>
                          <p><span className="text-slate-500">Gula Diet:</span> {msg.data.finalAnswers.dietLevel || msg.data.finalAnswers.diet_quality_score}/7</p>
                          <p><span className="text-slate-500">Aktivitas:</span> {msg.data.finalAnswers.physicalActivity || msg.data.finalAnswers.physical_activity_hours_per_week} jam/mgg</p>
                          <p><span className="text-slate-500">Langkah:</span> {msg.data.finalAnswers.dailySteps || msg.data.finalAnswers.daily_steps}</p>
                          <p className="col-span-2"><span className="text-slate-500">Riwayat Keluarga:</span> {msg.data.finalAnswers.familyHistory || (msg.data.finalAnswers.family_history_heart_disease === 1 ? "Ya" : "Tidak")}</p>
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
                        <p className="text-sm text-slate-700 leading-relaxed text-justify"><strong>Rekomendasi AI:</strong> {msg.data.insights}</p>
                      </div>
                    </div>
                  ) : msg.text}
                </div>
              </div>
            ))}
            
            {/* Quick Reply Options */}
            {currentOptions && (
              <div className="flex flex-wrap gap-2 mt-2 w-full">
                {currentOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSend(opt)}
                    className="px-5 py-2.5 bg-white border border-[#1e3a5a] text-[#1e3a5a] rounded-full text-sm font-medium hover:bg-[#1e3a5a] hover:text-white transition-colors shadow-sm"
                  >
                    {opt}
                  </button>
                ))}
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
              placeholder={isInputDisabled ? "Pilih salah satu opsi di atas..." : "Ketik jawaban Anda..."}
            />
            <button
              onClick={() => handleSend()}
              disabled={isInputDisabled || !inputValue.trim()}
              className={`px-6 py-3.5 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                isInputDisabled || !inputValue.trim()
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




