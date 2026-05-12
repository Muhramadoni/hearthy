import { useState } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Halo! Saya adalah chatbot dummy untuk membantu Anda. Apa yang bisa saya bantu?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { text: input, sender: "user" },
        {
          text: "Ini adalah respons dummy dari chatbot. Silakan ajukan pertanyaan lain!",
          sender: "bot",
        },
      ]);
      setInput("");
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#1e3a5a] text-white h-16 w-16 rounded-full shadow-lg hover:bg-[#173652] transition flex items-center justify-center"
          title="Buka Chatbot"
        >
          <span className="text-[2.2rem] font-semibold">?</span>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="fixed inset-0 bg-black/80 z-40"></div>
          <div
            className="relative z-50 w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12),_inset_0_1px_0_0_rgba(255,255,255,0.5)] ring-1 ring-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4 text-slate-950">
              Chatbot Bantuan
            </h2>
            <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-[#1e3a5a] text-white text-right ml-8"
                      : "bg-gray-100 text-slate-900 mr-8"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border-2 border-slate-300 rounded-2xl px-4 py-2 text-sm focus:border-[#1e3a5a] focus:outline-none"
                placeholder="Ketik pesan Anda..."
              />
              <button
                onClick={handleSend}
                className="bg-[#1e3a5a] text-white px-4 py-2 rounded-2xl hover:bg-[#173652] transition"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
