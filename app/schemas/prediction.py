from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    age: float = Field(..., ge=1, le=120)
    systolic_bp: float = Field(..., ge=70, le=250)
    diastolic_bp: float = Field(..., ge=40, le=150)
    resting_heart_rate: float = Field(..., ge=30, le=200)
    cholesterol_mg_dl: float = Field(..., ge=50, le=500)
    bmi: float = Field(..., ge=10, le=60)
    daily_steps: float = Field(..., ge=0, le=50000)
    physical_activity_hours_per_week: float = Field(..., ge=0, le=24)
    sleep_hours: float = Field(..., ge=0, le=24)
    alcohol_units_per_week: float = Field(0, ge=0, le=100)
    stress_level: float = Field(..., ge=1, le=10)
    diet_quality_score: float = Field(..., ge=1, le=10)
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