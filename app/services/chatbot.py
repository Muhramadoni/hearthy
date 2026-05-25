from google import genai
from google.genai import types
from app.schemas.chat import ChatRequest

SYSTEM_PROMPT = """
Anda adalah HearthyBot, asisten kesehatan kardiovaskular dari aplikasi Hearthy.
Tugas Anda adalah menjawab pertanyaan seputar kesehatan jantung, pencegahan, gejala penyakit kardiovaskular, gaya hidup sehat, dan rekomendasi terkait hasil asesmen risiko.

Aturan wajib:
- Tulis dalam Bahasa Indonesia yang ramah, santun, dan empati.
- Berikan saran yang praktis dan terstruktur.
- Jangan berikan diagnosis medis pasti. Selalu tambahkan disclaimer singkat bahwa ini bukan diagnosis medis dan pengguna sebaiknya berkonsultasi dengan dokter untuk keluhan spesifik.
- Jika pengguna menyebutkan gejala darurat (nyeri dada hebat, sesak napas mendadak yang memburuk, mati rasa di separuh tubuh, pingsan), instruksikan untuk segera menghubungi layanan gawat darurat (119 atau ambulans) dan pergi ke IGD terdekat.
- Jawab secara ringkas namun informatif (tidak terlalu panjang).
"""

class HearthyBot:
    def __init__(self, api_key: str, model_name: str):
        self._client = genai.Client(api_key=api_key)
        self._model_name = model_name

    def chat(self, request: ChatRequest) -> str:
        # Konversi riwayat percakapan sebelumnya
        contents = []
        for msg in request.history:
            # Pastikan role yang dikirim ke Gemini sesuai ("user" atau "model")
            role = "user" if msg.role == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
        
        # Tambahkan pesan saat ini
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=request.message)]))
        
        response = self._client.models.generate_content(
            model=self._model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.7,
            ),
        )
        return response.text
