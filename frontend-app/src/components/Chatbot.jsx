import { useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Halo! Saya adalah HearthyBot. Ada yang bisa saya bantu terkait kesehatan jantung Anda?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!user) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Konversi riwayat pesan untuk dikirim ke API
    const history = messages
      .filter(msg => msg.sender !== "loading")
      .map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        content: msg.text
      }));

    setMessages((prev) => [
      ...prev,
      { text: userMessage, sender: "user" },
      { text: "Berpikir...", sender: "loading" }
    ]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage,
          history: history
        })
      });

      const data = await response.json();
      
      setMessages((prev) => {
        const newMsgs = prev.filter(msg => msg.sender !== "loading");
        if (response.ok && data.status === "success") {
          return [...newMsgs, { text: data.reply, sender: "bot" }];
        } else {
          return [...newMsgs, { text: "Maaf, terjadi kesalahan saat menghubungi server.", sender: "bot" }];
        }
      });
    } catch (error) {
      setMessages((prev) => {
        const newMsgs = prev.filter(msg => msg.sender !== "loading");
        return [...newMsgs, { text: "Maaf, tidak dapat terhubung ke server AI.", sender: "bot" }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-4 right-4 z-40 transition-transform duration-300 ${isOpen ? "translate-x-32 opacity-0" : "translate-x-0 opacity-100"}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#1e3a5a] text-white h-16 w-16 rounded-full shadow-lg hover:bg-[#173652] transition flex items-center justify-center"
          title="Buka Chatbot"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">
            Hearthy - Chatbot
          </h2>
          <div className="flex items-center gap-1 text-slate-500">
            <button title="History Chat" className="p-2 hover:bg-slate-100 rounded-full transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
            <button onClick={() => setMessages([{ text: "Halo! Saya adalah HearthyBot. Ada yang bisa saya bantu terkait kesehatan jantung Anda?", sender: "bot" }])} title="Chat Baru" className="p-2 hover:bg-slate-100 rounded-full transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button onClick={() => setIsOpen(false)} title="Tutup" className="p-2 hover:bg-slate-100 rounded-full transition ml-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-[#1e3a5a] text-white ml-auto rounded-tr-sm"
                  : msg.sender === "loading"
                  ? "bg-slate-100 text-slate-500 mr-auto rounded-tl-sm animate-pulse"
                  : "bg-white border border-slate-200 text-slate-900 mr-auto rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
              className={`flex-1 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm focus:border-[#1e3a5a] focus:ring-1 focus:ring-[#1e3a5a] focus:outline-none ${isLoading ? "bg-slate-100" : ""}`}
              placeholder="Ketik pesan Anda..."
            />
            <button
              onClick={handleSend}
              className="bg-[#1e3a5a] text-white px-5 py-2.5 rounded-2xl hover:bg-[#173652] transition flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
