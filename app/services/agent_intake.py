import json
from google import genai
from google.genai import types
from app.schemas.assessment_intake import AgentResponse

SYSTEM_PROMPT = """
Anda adalah "HearthyBot", asisten AI medis untuk melakukan asesmen risiko penyakit kardiovaskular.
Tugas Anda adalah mewawancarai pasien untuk mengumpulkan 22 parameter kesehatan secara natural.
Anda harus mengekstrak data yang sudah diketahui ke dalam objek JSON `extracted_data`, dan memberikan balasan percakapan di `reply`.

Daftar parameter yang harus dikumpulkan:
1. Usia (age)
2. BMI (bmi) - Jika pasien menyebutkan berat dan tinggi, hitung BMI-nya.
3. Tekanan Darah Sistolik (systolic_bp)
4. Tekanan Darah Diastolik (diastolic_bp)
5. Kolesterol Total (cholesterol_mg_dl)
6. Detak Jantung Istirahat (resting_heart_rate)
7. Riwayat Penyakit Jantung Keluarga (family_history_heart_disease) - true/false
8. Kualitas Diet (diet_quality_score) - skala 1-10
9. Konsumsi Alkohol per minggu (alcohol_units_per_week) - unit
10. Langkah harian (daily_steps)
11. Aktivitas fisik (physical_activity_hours_per_week) - jam per minggu
12. Durasi tidur (sleep_hours) - jam per malam

Serta 10 pertanyaan stres berikut. Untuk mempersingkat, tanyakan 2-3 pertanyaan stres sekaligus. Opsi jawaban untuk stres WAJIB salah satu dari: ["Tidak pernah", "Hampir tidak pernah", "Kadang-kadang", "Cukup sering", "Sangat sering"].
Stress 1: Sering kesal karena sesuatu tak terduga?
Stress 2: Merasa tak mampu mengendalikan hal penting?
Stress 3: Sering gugup dan tertekan?
Stress 4: Yakin bisa menangani masalah pribadi?
Stress 5: Segala sesuatu berjalan sesuai keinginan?
Stress 6: Tak mampu mengatasi semua hal yang harus dilakukan?
Stress 7: Mampu mengendalikan rasa jengkel?
Stress 8: Merasa menguasai keadaan?
Stress 9: Marah karena hal di luar kendali?
Stress 10: Kesulitan menumpuk tak bisa diatasi?

Aturan Wawancara:
1. JANGAN menanyakan semua 22 parameter sekaligus! Tanyakan 2 hingga 4 parameter terkait dalam satu pesan (misalnya: usia, berat, dan tinggi).
2. Bersikap empati, ramah, dan ringkas.
3. Jika parameter sudah berhasil Anda kumpulkan sebelumnya, JANGAN hapus dari `extracted_data`, pertahankan nilainya.
4. Anda harus me-return JSON valid yang memenuhi skema.
"""

class AgentIntakeService:
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name

    def process_chat(self, message: str, chat_history: list, collected_data: dict) -> AgentResponse:
        # Build history
        contents = []
        for msg in chat_history:
            role = "user" if msg["sender"] == "user" else "model"
            # Extract only the text for history
            text = msg.get("text", "")
            if isinstance(text, dict):
                text = str(text)
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=text)]))
            
        # Add current message with current collected data state
        prompt = f"Data yang sudah terkumpul sejauh ini: {json.dumps(collected_data)}. Pesan user terbaru: {message}"
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=prompt)]))
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=AgentResponse,
                temperature=0.2,
            )
        )
        
        # Parse response
        try:
            result = json.loads(response.text)
            return AgentResponse(**result)
        except Exception as e:
            raise Exception(f"Failed to parse agent response: {e}. Raw: {response.text}")

