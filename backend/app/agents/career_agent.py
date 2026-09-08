"""
Vidyavani — Career Advisor Chat Agent
==========================================
Streaming multi-turn career advisor chatbot.
Uses LangGraph + Groq with topic filtering (career-only context).
Fallback: Gemini → Ollama (offline).
"""

import json
from typing import AsyncGenerator, List, Optional, Dict

import structlog
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from app.core.config import settings

log = structlog.get_logger(__name__)

CAREER_SYSTEM_PROMPT = """You are Vidyavani's Career Advisor — an expert on the Indian job market, NSQF framework, skill development, and career growth.

Your role:
- Help users understand skill gaps and how to close them
- Recommend learning paths and resources (prioritize SWAYAM, NPTEL for free options)
- Explain NSQF qualification levels and their industry relevance
- Suggest both private sector AND government job opportunities
- Be encouraging, specific, and data-driven

STRICT RULES:
1. ONLY discuss career, skills, jobs, education, and professional development topics
2. If asked about anything unrelated (cooking, politics, entertainment etc.), politely redirect
3. Always tailor advice to the Indian context (mention NASSCOM, NIELIT, CDAC, etc. where relevant)
4. Keep responses concise and actionable — max 200 words per response
5. When recommending resources, prefer free Indian platforms: SWAYAM, NPTEL, DIKSHA

User's current skills: {user_skills}
"""


class CareerAdvisorAgent:
    """Streaming career advisor with topic filtering and multi-provider fallback."""

    def __init__(self):
        # Lazy-initialized to avoid crashing at import time when GROQ_API_KEY
        # is blank/placeholder. The client is created on first actual use.
        self._groq: ChatGroq | None = None

    def _get_groq(self) -> ChatGroq:
        """Return the Groq client, creating it on first call."""
        if self._groq is None:
            if not settings.GROQ_API_KEY or settings.GROQ_API_KEY.startswith("your_"):
                raise RuntimeError(
                    "GROQ_API_KEY is not set. Add a valid key to backend/.env "
                    "(get one free at console.groq.com)."
                )
            self._groq = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model=settings.GROQ_MODEL,
                temperature=0.7,
                max_tokens=settings.GROQ_MAX_TOKENS,
                streaming=True,
            )
        return self._groq

    def _is_career_related(self, message: str) -> bool:
        """
        Simple topic guard — rejects clearly off-topic messages.
        In production, use a classifier or LLM guard.
        """
        off_topic_keywords = [
            "recipe", "cook", "movie", "cricket", "weather",
            "politics", "religion", "joke", "game", "sport",
        ]
        message_lower = message.lower()
        return not any(kw in message_lower for kw in off_topic_keywords)

    async def chat_stream(
        self,
        messages: List[Dict],
        user_skills: List[str],
        session_id: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Streams AI response tokens for the chat UI.
        Compatible with Vercel AI SDK's useChat() hook.
        """
        # Get last user message
        last_user_msg = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
        )

        # Topic guard
        if not self._is_career_related(last_user_msg):
            yield json.dumps({
                "token": "I'm specialized in career guidance and skill development. "
                         "Could you ask me something related to your career or skills? "
                         "I'd love to help you find the right path! 🎯"
            })
            return

        # Build LangChain message history
        lc_messages = [
            SystemMessage(content=CAREER_SYSTEM_PROMPT.format(
                user_skills=", ".join(user_skills) if user_skills else "Not specified"
            ))
        ]
        for msg in messages:
            if msg["role"] == "user":
                lc_messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                lc_messages.append(AIMessage(content=msg["content"]))

        # Stream response
        try:
            async for chunk in self._get_groq().astream(lc_messages):
                if chunk.content:
                    yield json.dumps({"token": chunk.content, "done": False})
            yield json.dumps({"token": "", "done": True})

        except Exception as e:
            log.warning("Groq chat failed, falling back", error=str(e))
            # Fallback: simple Ollama call
            yield json.dumps({"token": "Switching to offline mode... ", "done": False})
            import httpx
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": f"You are a career advisor. {last_user_msg}",
                        "stream": True,
                    },
                    timeout=30,
                ) as resp:
                    async for line in resp.aiter_lines():
                        if line:
                            data = json.loads(line)
                            token = data.get("response", "")
                            if token:
                                yield json.dumps({"token": token, "done": False})
            yield json.dumps({"token": "", "done": True})


# Singleton
career_agent = CareerAdvisorAgent()
