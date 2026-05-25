from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ExtractedData(BaseModel):
    age: Optional[float] = Field(None, description="Usia pasien")
    bmi: Optional[float] = Field(None, description="BMI pasien")
    systolic_bp: Optional[float] = Field(None, description="Tekanan darah sistolik (angka atas)")
    diastolic_bp: Optional[float] = Field(None, description="Tekanan darah diastolik (angka bawah)")
    cholesterol_mg_dl: Optional[float] = Field(None, description="Kolesterol total (mg/dL)")
    resting_heart_rate: Optional[float] = Field(None, description="Detak jantung istirahat (bpm)")
    family_history_heart_disease: Optional[bool] = Field(None, description="Riwayat keluarga penyakit jantung")
    diet_quality_score: Optional[float] = Field(None, description="Skor kualitas diet (1-10)")
    alcohol_units_per_week: Optional[float] = Field(None, description="Konsumsi alkohol per minggu (unit)")
    daily_steps: Optional[float] = Field(None, description="Langkah per hari")
    physical_activity_hours_per_week: Optional[float] = Field(None, description="Aktivitas fisik per minggu (jam)")
    sleep_hours: Optional[float] = Field(None, description="Durasi tidur per malam (jam)")
    
    # Stress questions (Literal strings to match original JS logic)
    stress1: Optional[str] = Field(None, description="Sering kesal karena tak terduga (Tidak pernah/Hampir tidak pernah/Kadang-kadang/Cukup sering/Sangat sering)")
    stress2: Optional[str] = Field(None, description="Tidak mampu mengendalikan hal penting")
    stress3: Optional[str] = Field(None, description="Gugup dan tertekan")
    stress4: Optional[str] = Field(None, description="Yakin menangani masalah pribadi")
    stress5: Optional[str] = Field(None, description="Segala sesuatu berjalan sesuai keinginan")
    stress6: Optional[str] = Field(None, description="Tidak mampu mengatasi semua hal yang harus dilakukan")
    stress7: Optional[str] = Field(None, description="Mampu mengendalikan rasa jengkel")
    stress8: Optional[str] = Field(None, description="Merasa menguasai keadaan")
    stress9: Optional[str] = Field(None, description="Marah karena hal di luar kendali")
    stress10: Optional[str] = Field(None, description="Kesulitan menumpuk tak bisa diatasi")

class AgentResponse(BaseModel):
    reply: str = Field(..., description="Respons yang akan dikirim ke pengguna")
    extracted_data: ExtractedData = Field(..., description="Data yang berhasil dikumpulkan sejauh ini")

class ChatIntakeRequest(BaseModel):
    message: str
    chat_history: List[Dict[str, Any]]
    collected_data: dict

class ChatIntakeResponse(BaseModel):
    reply: str
    is_complete: bool
    collected_data: dict
    prediction_result: Optional[dict] = None
