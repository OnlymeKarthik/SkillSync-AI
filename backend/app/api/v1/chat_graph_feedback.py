"""
Vidyavani — Chat, Graph, Feedback API endpoints
"""

# ===========================================================================
# chat.py
# ===========================================================================
from fastapi import APIRouter as ChatRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
from app.core.database import get_db
from app.agents.career_agent import career_agent
import structlog

chat_log = structlog.get_logger("chat")
router = ChatRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: Optional[str] = None
    user_skills: List[str] = []


@router.post(
    "/stream",
    summary="Streaming AI career advisor chat",
    description=(
        "Multi-turn career advisor chat powered by LangGraph + Groq (primary) "
        "with Gemini and Ollama fallbacks. Topic-filtered to career/skill domain only."
    ),
)
async def chat_stream(request: ChatRequest):
    """
    Streams the AI response token-by-token via SSE.
    Compatible with Vercel AI SDK's useChat() hook on the frontend.
    """
    async def stream() -> AsyncGenerator[str, None]:
        async for token in career_agent.chat_stream(
            messages=[m.model_dump() for m in request.messages],
            user_skills=request.user_skills,
            session_id=request.session_id,
        ):
            yield f"data: {token}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ===========================================================================
# graph.py
# ===========================================================================
from fastapi import APIRouter as GraphRouter, Query as GQuery
from app.core.database import db_manager

graph_router = GraphRouter(prefix="/graph", tags=["Knowledge Graph"])

# Use graph_router as the exportable router
router_graph = graph_router


@graph_router.get("/nodes", summary="Get skill graph nodes for visualization")
async def get_graph_nodes(
    sector: Optional[str] = GQuery(default=None),
    career_slug: Optional[str] = GQuery(default=None),
    limit: int = GQuery(default=50, ge=1, le=200),
):
    """
    Returns nodes and edges for D3.js force-directed graph.
    Filters by sector or career to keep the graph manageable (<= 50 nodes).
    """
    cypher = """
        MATCH (s:Skill)
        OPTIONAL MATCH (s)-[r:REQUIRED_BY]->(c:Career)
        OPTIONAL MATCH (s)-[p:PREREQUISITE_OF]->(s2:Skill)
        WITH s, collect(DISTINCT {type: 'REQUIRED_BY', target: c.slug}) +
                collect(DISTINCT {type: 'PREREQUISITE_OF', target: s2.name}) AS rels
        RETURN s.name AS id, s.name AS label, s.category AS group,
               s.gap_score AS gap_score, rels AS relationships
        LIMIT $limit
    """
    params = {"limit": limit}
    if career_slug:
        cypher = """
            MATCH (s:Skill)-[:REQUIRED_BY]->(c:Career {slug: $career_slug})
            OPTIONAL MATCH (s)-[p:PREREQUISITE_OF]->(s2:Skill)
            RETURN s.name AS id, s.name AS label, s.category AS group,
                   s.gap_score AS gap_score,
                   collect({type:'PREREQUISITE_OF', target:s2.name}) AS relationships
            LIMIT $limit
        """
        params["career_slug"] = career_slug

    nodes = await db_manager.neo4j_query(cypher, params)
    return {"nodes": nodes, "count": len(nodes)}


@graph_router.get("/path", summary="Find skill path between current skills and target career")
async def get_skill_path(
    from_skills: str = GQuery(..., description="Comma-separated current skills"),
    to_career: str = GQuery(..., description="Target career slug"),
):
    """
    Uses Neo4j shortest path to find the missing skill hops
    between what the user knows and what the career requires.
    """
    skill_list = [s.strip() for s in from_skills.split(",")]
    cypher = """
        MATCH (target:Career {slug: $career})
        MATCH (target)<-[:REQUIRED_BY]-(required:Skill)
        WHERE NOT required.name IN $known_skills
        OPTIONAL MATCH path = shortestPath(
            (known:Skill)-[:PREREQUISITE_OF*1..5]->(required)
        )
        WHERE known.name IN $known_skills
        RETURN required.name AS missing_skill,
               [n IN nodes(path) | n.name] AS prerequisite_path,
               length(path) AS hops
        ORDER BY hops ASC
        LIMIT 20
    """
    result = await db_manager.neo4j_query(
        cypher, {"career": to_career, "known_skills": skill_list}
    )
    return {"missing_skills": result, "from_skills": skill_list, "to_career": to_career}


# ===========================================================================
# feedback.py
# ===========================================================================
from fastapi import APIRouter as FeedbackRouter
from pydantic import BaseModel as FB
from typing import Optional as Opt
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends as FDepends
from sqlalchemy import text
from app.core.database import get_db as fget_db

feedback_router = FeedbackRouter(prefix="/feedback", tags=["Feedback"])
router_feedback = feedback_router


class FeedbackRequest(FB):
    name: Opt[str] = None
    email: Opt[str] = None
    category: str = "general"
    message: str
    user_id: Opt[str] = None


@feedback_router.post("/", summary="Submit feedback")
async def submit_feedback(request: FeedbackRequest, db: AsyncSession = FDepends(fget_db)):
    """Stores user feedback in Supabase/PostgreSQL."""
    await db.execute(
        text("""
            INSERT INTO feedback (user_id, name, email, category, message)
            VALUES (:user_id, :name, :email, :category, :message)
        """),
        request.model_dump(),
    )
    await db.commit()
    return {"status": "submitted", "message": "Thank you for your feedback!"}
