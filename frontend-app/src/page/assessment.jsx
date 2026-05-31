import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const QUESTIONS = [
  { id: 'age', type: 'number', aiText: "Halo! Saya Hearthy AI. Mari mulai dengan mengetahui usia Anda. Berapa usia Anda saat ini?", placeholder: "Contoh: 25", suffix: "Tahun" },
  { id: 'height', type: 'number', aiText: "Terima kasih. Selanjutnya, berapa tinggi badan Anda?", placeholder: "Contoh: 170", suffix: "cm" },
  { id: 'weight', type: 'number', aiText: "Baik. Sekarang, berapa berat badan Anda?", placeholder: "Contoh: 65", suffix: "kg" },
  { id: 'steps', type: 'single', aiText: "Saya sudah mencatatnya. Bagaimana dengan aktivitas harian Anda? Berapa perkiraan langkah harian Anda?", options: ["Kurang Aktif (< 5.000 langkah)", "Cukup Aktif (5.000-7.499 langkah)", "Aktif (7.500-9.999 langkah)", "Sangat Aktif (≥ 10.000 langkah)"] },
  { id: 'activity', type: 'single', aiText: "Menarik. Berapa jam Anda melakukan aktivitas fisik (olahraga ringan/berat) dalam seminggu?", options: ["Kurang (< 1.25 jam/minggu)", "Cukup (1.25-2.5 jam/minggu)", "Baik (≥ 2.5 jam/minggu)"] },
  { id: 'sleep_hours', type: 'number', aiText: "Selanjutnya mengenai pola istirahat Anda. Berapa jam rata-rata Anda tidur setiap malam?", placeholder: "Contoh: 7", suffix: "Jam" },
  { id: 'blood_pressure', type: 'text', aiText: "Selanjutnya, berapa tekanan darah Anda? Masukkan Sistolik dan Diastolik dipisahkan dengan garis miring (/).", placeholder: "Contoh: 120/80", suffix: "mmHg" },
  { id: 'diet', type: 'single', aiText: "Sekarang mari beralih ke pola makan. Bagaimana Anda menilai kualitas diet/makanan Anda sehari-hari?", options: ["Sangat Baik", "Baik", "Cukup", "Buruk"] },
  { id: 'alcohol', type: 'single', aiText: "Seberapa banyak unit minuman beralkohol yang Anda konsumsi dalam seminggu?", options: ["Tidak Minum (0 unit)", "Rendah (1-7 unit/minggu)", "Sedang (8-14 unit/minggu)", "Tinggi (> 14 unit/minggu)"] },
  { id: 'resting_heart_rate', type: 'number', aiText: "Terima kasih informasinya. Mari kita catat tanda vital Anda. Berapa detak jantung istirahat Anda (BPM)?", placeholder: "Contoh: 72", suffix: "BPM" },
  { id: 'cholesterol', type: 'number', aiText: "Baik. Berapa kadar Kolesterol Total Anda (mg/dL)?", placeholder: "Contoh: 200", suffix: "mg/dL" },
  { id: 'disease', type: 'multiple', aiText: "Apakah Anda memiliki riwayat penyakit terkait kardiovaskular (seperti Hipertensi atau Penyakit Jantung)?", options: ["Ya", "Tidak"] },
  { id: 'stress1', type: 'single', aiText: "Terakhir, saya akan menanyakan beberapa pertanyaan singkat terkait tingkat stres Anda dalam sebulan terakhir. Pertama, seberapa sering Anda merasa kesal karena sesuatu yang tak terduga?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress2', type: 'single', aiText: "Seberapa sering Anda merasa tak mampu mengendalikan hal-hal penting dalam hidup Anda?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress3', type: 'single', aiText: "Seberapa sering Anda merasa gugup dan tertekan?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress4', type: 'single', aiText: "Seberapa sering Anda merasa yakin dengan kemampuan Anda untuk menangani masalah pribadi?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress5', type: 'single', aiText: "Seberapa sering Anda merasa segala sesuatu berjalan sesuai keinginan Anda?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress6', type: 'single', aiText: "Seberapa sering Anda merasa tak mampu mengatasi semua hal yang harus Anda lakukan?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress7', type: 'single', aiText: "Seberapa sering Anda mampu mengendalikan rasa jengkel dalam hidup Anda?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress8', type: 'single', aiText: "Seberapa sering Anda merasa menguasai keadaan?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress9', type: 'single', aiText: "Seberapa sering Anda merasa marah karena hal-hal yang terjadi di luar kendali Anda?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
  { id: 'stress10', type: 'single', aiText: "Terakhir, seberapa sering Anda merasa kesulitan menumpuk sangat tinggi sehingga tidak dapat diatasi?", options: ["Tidak pernah", "Jarang", "Kadang-kadang", "Sering", "Sangat Sering"] },
];

export default function AssessmentPage({ currentPage, onNavigate }) {
  const [phase, setPhase] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [selectedMultiple, setSelectedMultiple] = useState([]);
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [predictionResult, setPredictionResult] = useState(null);
  const [screeningData, setScreeningData] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const submitToBackend = async (finalAnswers) => {
    try {
      const heightM = (parseFloat(finalAnswers.height) || 170) / 100;
      const weightKg = parseFloat(finalAnswers.weight) || 65;
      const bmi = weightKg / (heightM * heightM);

      const dailyStepsMap = { "Kurang Aktif (< 5.000 langkah)": 4000, "Cukup Aktif (5.000-7.499 langkah)": 6000, "Aktif (7.500-9.999 langkah)": 8500, "Sangat Aktif (≥ 10.000 langkah)": 12000 };
      const activityMap = { "Kurang (< 1.25 jam/minggu)": 1.0, "Cukup (1.25-2.5 jam/minggu)": 2.0, "Baik (≥ 2.5 jam/minggu)": 3.5 };
      const dietMap = { "Sangat Baik": 9, "Baik": 7, "Cukup": 5, "Buruk": 3 };
      const alcoholMap = { "Tidak Minum (0 unit)": 0, "Rendah (1-7 unit/minggu)": 4, "Sedang (8-14 unit/minggu)": 11, "Tinggi (> 14 unit/minggu)": 16 };
      const stressMap = {
        "Tidak pernah": "Tidak pernah",
        "Jarang": "Hampir tidak pernah",
        "Kadang-kadang": "Kadang-kadang",
        "Sering": "Cukup sering",
        "Sangat Sering": "Sangat sering"
      };

      const hasDisease = (finalAnswers.disease || []).includes("Ya");
      
      let systolic = 120;
      let diastolic = 80;
      if (finalAnswers.blood_pressure) {
        const parts = finalAnswers.blood_pressure.split('/');
        if (parts.length === 2) {
          systolic = parseFloat(parts[0]) || 120;
          diastolic = parseFloat(parts[1]) || 80;
        }
      }

      const mappedData = {
        age: parseFloat(finalAnswers.age) || 25,
        bmi: parseFloat(bmi.toFixed(2)),
        systolic_bp: systolic,
        diastolic_bp: diastolic,
        cholesterol_mg_dl: parseFloat(finalAnswers.cholesterol) || 200,
        resting_heart_rate: parseFloat(finalAnswers.resting_heart_rate) || 72,
        family_history_heart_disease: hasDisease ? 1 : 0,
        diet_quality_score: dietMap[finalAnswers.diet] || 5,
        alcohol_units_per_week: alcoholMap[finalAnswers.alcohol] || 0,
        daily_steps: dailyStepsMap[finalAnswers.steps] || 5000,
        physical_activity_hours_per_week: activityMap[finalAnswers.activity] || 0,
        sleep_hours: parseFloat(finalAnswers.sleep_hours) || 7,
        stress1: stressMap[finalAnswers.stress1] || "Tidak pernah",
        stress2: stressMap[finalAnswers.stress2] || "Tidak pernah",
        stress3: stressMap[finalAnswers.stress3] || "Tidak pernah",
        stress4: stressMap[finalAnswers.stress4] || "Tidak pernah",
        stress5: stressMap[finalAnswers.stress5] || "Tidak pernah",
        stress6: stressMap[finalAnswers.stress6] || "Tidak pernah",
        stress7: stressMap[finalAnswers.stress7] || "Tidak pernah",
        stress8: stressMap[finalAnswers.stress8] || "Tidak pernah",
        stress9: stressMap[finalAnswers.stress9] || "Tidak pernah",
        stress10: stressMap[finalAnswers.stress10] || "Tidak pernah",
      };
      
      setScreeningData(mappedData);

      const token = localStorage.getItem("hearthy_token");
      const res = await fetch("http://localhost:5000/api/assessments/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: "Saya sudah mengisi semua data. Analisis data saya sekarang.",
          chat_history: [],
          collected_data: mappedData
        })
      });

      if (!res.ok) throw new Error("Gagal menghubungkan ke server.");
      const json = await res.json();
      setPredictionResult(json.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Terjadi Kesalahan",
        text: "Gagal memproses prediksi. Silakan coba lagi nanti.",
        icon: "error"
      });
      setPhase(2); 
    }
  };

  useEffect(() => {
    if (phase === 3) {
      const intervals = [
        { time: 1000, step: 1 },
        { time: 2000, step: 2 },
        { time: 3000, step: 3 },
        { time: 4000, step: 4 },
        { time: 5000, step: 5 },
        { time: 6000, step: 6 },
        { time: 7000, step: 7 },
      ];

      intervals.forEach(({ time, step }) => {
        setTimeout(() => setLoadingStep(step), time);
      });

      const runSubmit = async () => {
        await submitToBackend(answers);
        setTimeout(() => {
          setPhase(4);
        }, 8000);
      };
      runSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleNextStep = (val) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAnswers(prev => ({ ...prev, [QUESTIONS[currentStep].id]: val }));
      setInputValue("");
      setSelectedMultiple([]);
      setIsTransitioning(false);
      
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setPhase(3);
      }
    }, 1200);
  };

  const handleInputSubmit = () => {
    if (!inputValue) return;
    handleNextStep(inputValue);
  };

  const handleMultipleToggle = (opt) => {
    if (selectedMultiple.length > 0 && !selectedMultiple.includes(opt)) {
      Swal.fire({
        title: 'Ubah Pilihan?',
        text: "Apakah Anda yakin ingin mengubah pilihan Anda?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1e3a5a',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, ubah',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedMultiple([opt]);
        }
      });
      return;
    }

    if (selectedMultiple.includes(opt)) {
      Swal.fire({
        title: 'Batalkan Pilihan?',
        text: "Apakah Anda yakin ingin membatalkan pilihan ini?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1e3a5a',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, batalkan',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedMultiple([]);
        }
      });
      return;
    }

    setSelectedMultiple([opt]);
  };

  const handleMultipleSubmit = () => {
    if (selectedMultiple.length === 0) return;
    handleNextStep(selectedMultiple);
  };

  const renderWelcomeScreen = () => {

    return (
      <div className="flex flex-col h-full animate-fade-in custom-scrollbar overflow-y-auto px-4 md:px-12 py-10">
        <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-[#1e3a5a] to-[#2a5280] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#1e3a5a]/20 mb-4 transform transition hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-white">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1e3a5a] tracking-tight leading-tight">Asesmen Prediksi Risiko Kardiovaskular AI</h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl">
            Hearthy akan memandu Anda melalui beberapa pertanyaan untuk memahami kondisi kesehatan, gaya hidup, dan faktor risiko yang dapat memengaruhi kesehatan jantung Anda.
          </p>
          <button 
            onClick={() => setPhase(2)}
            className="mt-10 px-12 py-5 bg-[#1e3a5a] text-white rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:bg-[#152840] hover:-translate-y-1 transition-all duration-300"
          >
            Mulai Asesmen Sekarang
          </button>
        </div>
      </div>
    );
  };

  const renderWizardScreen = () => {
    const q = QUESTIONS[currentStep];
    const progress = Math.round(((currentStep) / QUESTIONS.length) * 100);

    return (
      <div className="flex flex-col h-full animate-fade-in relative">
        <div className="flex flex-col mb-8 mt-6 px-8 md:px-12">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">Asesmen Prediksi Risiko Kardiovaskular AI</h2>
              <p className="text-slate-800 font-bold text-base md:text-lg">Pertanyaan {currentStep + 1} dari {QUESTIONS.length}</p>
            </div>
            <span className="text-xl md:text-2xl font-black text-[#1e3a5a]">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-[#1e3a5a] h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 md:px-12 py-12 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-4xl bg-white lg:bg-transparent lg:shadow-none p-6 sm:p-8 rounded-3xl">
            {isTransitioning ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-20 animate-scale-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-xl font-bold text-slate-700">Jawaban tersimpan</p>
              </div>
            ) : (
              <div className="animate-fade-up">
                <div className="flex items-start gap-4 mb-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a5a] to-[#254b75] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl rounded-tl-none shadow-sm">
                    <p className="text-base md:text-xl font-semibold text-slate-800 leading-relaxed">{q.aiText}</p>
                  </div>
                </div>

                <div className="pl-16">
                  {(q.type === 'number' || q.type === 'text') && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <input 
                          type={q.type} 
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                          placeholder={q.placeholder}
                          className="w-full text-lg md:text-2xl font-bold text-slate-800 bg-white border-2 border-slate-200 rounded-2xl py-4 pl-6 pr-16 focus:border-[#1e3a5a] focus:ring-4 focus:ring-[#1e3a5a]/10 outline-none transition-all"
                          autoFocus
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{q.suffix}</span>
                      </div>
                      <button 
                        onClick={handleInputSubmit}
                        disabled={!inputValue}
                        className="px-8 py-4 bg-[#1e3a5a] text-white font-bold rounded-2xl disabled:bg-slate-200 disabled:text-slate-400 hover:bg-[#152840] transition-colors"
                      >
                        Lanjut
                      </button>
                    </div>
                  )}

                  {q.type === 'single' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {q.options.map((opt, i) => (
                        <button 
                          key={i}
                          onClick={() => handleNextStep(opt)}
                          className="text-left px-6 py-5 bg-white border-2 border-slate-100 hover:border-[#1e3a5a] hover:shadow-lg rounded-2xl transition-all group flex items-center justify-between"
                        >
                          <span className="font-bold text-slate-700 group-hover:text-[#1e3a5a] text-base md:text-lg">{opt}</span>
                          <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-[#1e3a5a] flex items-center justify-center">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#1e3a5a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'multiple' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {q.options.map((opt, i) => {
                          const isSelected = selectedMultiple.includes(opt);
                          return (
                            <button 
                              key={i}
                              onClick={() => handleMultipleToggle(opt)}
                              className={`text-left px-6 py-4 border-2 rounded-2xl transition-all flex items-center justify-between ${isSelected ? 'border-[#1e3a5a] bg-[#1e3a5a]/5 shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                            >
                              <span className={`font-bold text-base md:text-lg ${isSelected ? 'text-[#1e3a5a]' : 'text-slate-700'}`}>{opt}</span>
                              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#1e3a5a] border-[#1e3a5a]' : 'border-slate-300'}`}>
                                {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <button 
                        onClick={handleMultipleSubmit}
                        disabled={selectedMultiple.length === 0}
                        className="w-full py-4 bg-[#1e3a5a] text-white font-bold text-lg rounded-2xl disabled:bg-slate-200 disabled:text-slate-400 hover:bg-[#152840] transition-colors"
                      >
                        Lanjut
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysisScreen = () => {
    const stepsText = [
      "Mengumpulkan data pengguna",
      "Menghitung BMI",
      "Mengevaluasi aktivitas fisik",
      "Menganalisis pola tidur",
      "Mengukur tingkat stres",
      "Mengidentifikasi faktor risiko",
      "Menghasilkan prediksi kesehatan"
    ];

    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in py-10">
        <div className="w-32 h-32 relative mb-10">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-full h-full bg-gradient-to-tr from-[#1e3a5a] to-[#3b82f6] rounded-full flex items-center justify-center shadow-2xl">
             <svg className="w-16 h-16 text-white animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
               <path d="M5 22h14" />
               <path d="M5 2h14" />
               <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
               <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
             </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#1e3a5a] mb-8 text-center px-4">Hearthy sedang menganalisis data Anda...</h2>
        
        <div className="space-y-4 w-full max-w-sm">
          {stepsText.map((text, idx) => {
            const isActive = loadingStep >= idx + 1;
            return (
              <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-green-500' : 'bg-slate-200'}`}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className={`font-semibold text-lg ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderResultScreen = () => {
    if (!predictionResult || !predictionResult.prediction_result) {
       return <div className="p-10 text-center">Data hasil analisis tidak ditemukan.</div>;
    }

    const { risk_score, risk_category, recommendations } = predictionResult.prediction_result;
    const { final_chat_history } = predictionResult;
    
    const resultMsg = final_chat_history?.find(m => m.type === 'result');
    const insights = resultMsg?.data?.insights || recommendations || "Perhatikan selalu gaya hidup Anda.";

    const riskMap = { "Low": "Rendah", "Medium": "Sedang", "High": "Tinggi", "low": "Rendah", "moderate": "Sedang", "high": "Tinggi" };
    const mappedRisk = riskMap[risk_category] || risk_category;
    const isHigh = risk_category?.toLowerCase() === 'high';
    const isMed = risk_category?.toLowerCase() === 'medium' || risk_category?.toLowerCase() === 'moderate';
    
    const scoreColor = isHigh ? 'text-[#ef4444]' : isMed ? 'text-[#eab308]' : 'text-[#22c55e]';
    const bgColor = isHigh ? 'bg-[#fef2f2]' : isMed ? 'bg-[#fefce8]' : 'bg-[#f0fdf4]';

    const ans = predictionResult?.collected_data || screeningData || {};
    const displayData = [
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
      `Tingkat Stres (0-10): ${ans.stress_level !== undefined ? ans.stress_level : "-"}`,
      `Alkohol: ${ans.alcohol_units_per_week || "-"} unit/minggu`,
    ];

    return (
      <div className="flex flex-col h-full overflow-y-auto px-4 md:px-10 py-8 animate-fade-in custom-scrollbar">
        <h2 className="text-3xl font-extrabold text-[#1e3a5a] mb-8 text-center">Hasil Prediksi Risiko Kardiovaskular</h2>
        
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto pb-8">
          <div className="w-full space-y-6">
            <div className={`p-8 rounded-[32px] border-2 ${isHigh ? 'bg-[#fff5f5] border-[#fee2e2] shadow-sm' : isMed ? 'bg-[#fffbeb] border-[#fef3c7] shadow-sm' : 'bg-[#f0fdf4] border-[#dcfce7] shadow-sm'}`}>
               <p className="text-[#64748b] font-bold uppercase tracking-widest text-sm mb-2 text-center">Skor Risiko</p>
               <div className="flex items-end justify-center gap-2 mb-6">
                 <span className={`text-7xl font-black ${scoreColor} leading-none`}>{Math.round(risk_score)}</span>
                 <span className="text-2xl font-bold text-[#cbd5e1] mb-2">%</span>
               </div>
               
               <div className={`p-4 rounded-2xl flex items-center justify-between ${bgColor}`}>
                 <span className="font-bold text-[#334155]">Tingkat Risiko</span>
                 <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase ${
                    isHigh ? 'bg-[#fecaca] text-[#991b1b]' : 
                    isMed ? 'bg-[#fef08a] text-[#854d0e]' : 'bg-[#bbf7d0] text-[#166534]'
                 }`}>{mappedRisk}</span>
               </div>
            </div>

            <div className="bg-[#f8fafc] p-6 rounded-3xl border border-[#e2e8f0] shadow-sm">
              <p className="text-[#1e293b] font-bold text-lg mb-4">Data Skrining</p>
              <div className="space-y-3">
                {displayData.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-[#ffffff] px-5 py-4 text-sm text-slate-800 shadow-sm border border-[#f1f5f9]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            </div>

            <button
              onClick={() => setShowAnalysisModal(true)}
              className="w-full bg-white border-2 border-[#1e3a5a] text-[#1e3a5a] p-5 rounded-3xl font-bold hover:bg-[#1e3a5a] hover:text-white transition-all flex items-center justify-between shadow-sm group"
            >
              <span className="text-lg">Baca Hasil Analisis Anda</span>
              <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-lg rounded-3xl hover:border-slate-300 transition-all"
            >
              Ulangi Asesmen
            </button>
          </div>

        {showAnalysisModal && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[88px] md:pt-[120px] p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-screen-2xl max-h-[calc(100vh-108px)] md:max-h-[calc(100vh-140px)] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-6 sm:p-8 bg-gradient-to-br from-[#1e3a5a] to-[#254b75] text-white flex justify-between items-center shrink-0">
                <h3 className="text-2xl font-bold">Hasil Analisis</h3>
                <button onClick={() => setShowAnalysisModal(false)} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar text-slate-800">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                    ul: ({...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                    li: ({...props}) => <li className="pl-1" {...props} />,
                    strong: ({...props}) => <strong className="font-bold text-slate-900" {...props} />,
                  }}
                >
                  {insights}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950 flex flex-col">
      <Navbar currentPage={currentPage ?? "assessment"} onNavigate={onNavigate ?? (() => {})} />
      
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-6 py-6 flex flex-col h-[calc(100vh-80px)]">
        <div className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] border border-slate-100 flex flex-col h-full overflow-hidden">
          {phase === 1 && renderWelcomeScreen()}
          {phase === 2 && renderWizardScreen()}
          {phase === 3 && renderAnalysisScreen()}
          {phase === 4 && renderResultScreen()}
        </div>
      </main>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-up { animation: fade-up 0.5s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; border: 3px solid transparent; background-clip: content-box; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
        
        /* Hide number input arrows */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
