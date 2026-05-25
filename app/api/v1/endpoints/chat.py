from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chatbot import HearthyBot
from app.core.dependencies import get_chatbot

router = APIRouter()

@router.post("", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest, chatbot: HearthyBot = Depends(get_chatbot)):
    try:
        reply = chatbot.chat(request)
        return ChatResponse(status="success", reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
