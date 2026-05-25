from fastapi import APIRouter, Depends, HTTPException
from app.schemas.assessment_intake import ChatIntakeRequest, ChatIntakeResponse
from app.schemas.prediction import PredictionRequest
from app.services.agent_intake import AgentIntakeService
from app.services.predictor import HearthyPredictor
from app.core.dependencies import get_predictor
from app.core.config import get_settings

router = APIRouter()

def get_agent_intake() -> AgentIntakeService:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")
    return AgentIntakeService(api_key=settings.gemini_api_key, model_name=settings.gemini_model)

def calculate_stress_level(stress_dict: dict) -> int:
    scores = {
        "Tidak pernah": 0,
        "Hampir tidak pernah": 1,
        "Kadang-kadang": 2,
        "Cukup sering": 3,
        "Sangat sering": 4
    }
    total_score = 0
    reverse_questions = ["stress4", "stress5", "stress7", "stress8"]
    
    for i in range(1, 11):
        key = f"stress{i}"
        ans = stress_dict.get(key, "Tidak pernah")
        score = scores.get(ans, 0)
        if key in reverse_questions:
            score = 4 - score
        total_score += score
        
    if total_score <= 13: return 3
    if total_score <= 26: return 6
    return 9

@router.post("/assessment/chat", response_model=ChatIntakeResponse)
def assessment_chat(
    req: ChatIntakeRequest,
    agent: AgentIntakeService = Depends(get_agent_intake),
    predictor: HearthyPredictor = Depends(get_predictor)
):
    try:
        # Call agent
        agent_resp = agent.process_chat(req.message, req.chat_history, req.collected_data)
        
        extracted = agent_resp.extracted_data.model_dump()
        
        # Check if all required fields are present
        required_keys = [
            "age", "bmi", "systolic_bp", "diastolic_bp", "cholesterol_mg_dl", 
            "resting_heart_rate", "family_history_heart_disease", "diet_quality_score", 
            "alcohol_units_per_week", "daily_steps", "physical_activity_hours_per_week", 
            "sleep_hours", "stress1", "stress2", "stress3", "stress4", "stress5", 
            "stress6", "stress7", "stress8", "stress9", "stress10"
        ]
        
        is_complete = True
        for key in required_keys:
            if extracted.get(key) is None:
                is_complete = False
                break
                
        prediction_result = None
        if is_complete:
            # Calculate stress
            stress_level = calculate_stress_level(extracted)
            
            # Map to PredictionRequest
            pred_req = PredictionRequest(
                age=extracted["age"],
                systolic_bp=extracted["systolic_bp"],
                diastolic_bp=extracted["diastolic_bp"],
                resting_heart_rate=extracted["resting_heart_rate"],
                cholesterol_mg_dl=extracted["cholesterol_mg_dl"],
                bmi=extracted["bmi"],
                daily_steps=extracted["daily_steps"],
                physical_activity_hours_per_week=extracted["physical_activity_hours_per_week"],
                sleep_hours=extracted["sleep_hours"],
                alcohol_units_per_week=extracted["alcohol_units_per_week"],
                stress_level=stress_level,
                diet_quality_score=extracted["diet_quality_score"],
                family_history_heart_disease=bool(extracted["family_history_heart_disease"]),
                smoking_status=0, # default since not gathered
                diabetes=0, # default
                hypertension=0 # default
            )
            
            # Run prediction
            pred_resp = predictor.predict(pred_req)
            prediction_result = pred_resp.model_dump()
            
        return ChatIntakeResponse(
            reply=agent_resp.reply,
            is_complete=is_complete,
            collected_data=extracted,
            prediction_result=prediction_result
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
