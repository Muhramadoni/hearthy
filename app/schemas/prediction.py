from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    age: float = Field(..., ge=1, le=150)
    systolic_bp: float = Field(..., ge=40, le=300)
    diastolic_bp: float = Field(..., ge=20, le=200)
    resting_heart_rate: float = Field(..., ge=20, le=300)
    cholesterol_mg_dl: float = Field(..., ge=10, le=1000)
    bmi: float = Field(..., ge=1, le=100)
    daily_steps: float = Field(..., ge=0, le=150000)
    physical_activity_hours_per_week: float = Field(..., ge=0, le=168)
    sleep_hours: float = Field(..., ge=0, le=24)
    alcohol_units_per_week: float = Field(0, ge=0, le=200)
    stress_level: float = Field(..., ge=0, le=20)
    diet_quality_score: float = Field(..., ge=0, le=20)
    smoking_status: int = Field(0, ge=0, le=2, description="0=Never, 1=Former, 2=Current")
    family_history_heart_disease: bool = Field(False)
    diabetes: int = Field(0, ge=0, le=1)
    hypertension: int = Field(0, ge=0, le=1)


class F1Scores(BaseModel):
    low: float
    medium: float
    high: float
    macro_avg: float


class PredictionResponse(BaseModel):
    risk_category: str
    risk_score: float
    confidence: float
    f1_scores: F1Scores
    recommendations: str