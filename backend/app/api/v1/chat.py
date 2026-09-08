"""
Vidyavani — AI Career Advisor Chat API
"""

from typing import List, Optional, AsyncGenerator
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import structlog

from app.agents.career_agent import career_agent

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    # API-client format: full messages list
    messages: Optional[List[ChatMessage]] = None
    session_id: Optional[str] = None
    user_skills: Optional[List[str]] = []

    # Frontend format: single string message + optional history
    message: Optional[str] = None
    current_skills: Optional[List[str]] = None
    history: Optional[List[ChatMessage]] = None


@router.post(
    "/stream",
    summary="Streaming AI career advisor chat",
    description=(
        "Multi-turn career advisor chat powered by LangGraph + Groq (primary) "
        "with Gemini and Ollama fallbacks. Topic-filtered to career/skill domain only. "
        "Accepts {messages, user_skills} (API format) or {message, history, current_skills} (frontend format)."
    ),
)
async def chat_stream(request: ChatRequest):
    """
    Streams the AI response token-by-token via SSE.
    Compatible with Vercel AI SDK's useChat() hook on the frontend.
    """
    # Normalize: support both payload shapes
    if request.messages:
        messages = [m.model_dump() for m in request.messages]
    else:
        history = [m.model_dump() for m in (request.history or [])]
        if request.message:
            history.append({"role": "user", "content": request.message})
        messages = history

    user_skills = request.current_skills or request.user_skills or []

    async def stream() -> AsyncGenerator[str, None]:
        async for token in career_agent.chat_stream(
            messages=messages,
            user_skills=user_skills,
            session_id=request.session_id,
        ):
            yield f"data: {token}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
