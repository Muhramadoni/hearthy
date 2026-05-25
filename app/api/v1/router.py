from fastapi import APIRouter
from app.api.v1.endpoints import predict, chat, assessment_chat

router = APIRouter(prefix="/api/v1")

router.include_router(predict.router, tags=["Prediction"])
router.include_router(chat.router, prefix="/chat", tags=["Chat"])
router.include_router(assessment_chat.router, tags=["Assessment Chat"])