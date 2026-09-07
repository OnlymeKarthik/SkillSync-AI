"""
Vidyavani — AI Roadmap Generator Endpoint
=============================================
POST /api/v1/roadmap/generate  — Generate a streaming personalized roadmap
GET  /api/v1/roadmap/{id}      — Retrieve a saved roadmap
GET  /api/v1/roadmap/user/{user_id} — List all saved roadmaps for a user

The roadmap generator is the WOW feature of Vidyavani.
It uses LangGraph to orchestrate:
  1. Neo4j traversal — find the skill gap path from user's current skills to target career
  2. Groq LLM — narrate the roadmap in structured stages
  3. Resource matching — attach free (SWAYAM/YouTube) and paid (Coursera) resources
  4. Decision breakpoints — branching paths based on user preferences

Response is streamed via Server-Sent Events (SSE) so the UI
shows the roadmap being generated in real time.
"""

from typing import AsyncGenerator, Optional
from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.agents.roadmap_agent import roadmap_agent

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


# =============================================================================
# Schemas
# =============================================================================

class RoadmapGenerateRequest(BaseModel):
    """Request to generate a personalized learning roadmap."""

    target_career_slug: str = Field(
        ...,
        description="The career the user wants to reach (e.g., 'data-engineer')",
        examples=["data-engineer", "cloud-architect", "fullstack-developer"],
    )
    current_skills: list[str] = Field(
        default=[],
        description="Skills the user already has (from resume or self-reported)",
        examples=[["Python", "SQL", "Excel"]],
    )
    track_preference: str = Field(
        default="hybrid",
        pattern="^(free|paid|hybrid)$",
        description="free = SWAYAM/YouTube only | paid = Coursera/Udemy | hybrid = mix",
    )
    timeline_weeks: Optional[int] = Field(
        default=12,
        ge=4,
        le=52,
        description="Target timeline in weeks (4–52)",
    )
    experience_level: str = Field(
        default="beginner",
        pattern="^(beginner|intermediate|advanced)$",
    )
    user_id: Optional[str] = Field(
        default=None,
        description="If provided, roadmap is saved to user profile",
    )


# =============================================================================
# Endpoints
# =============================================================================

@router.post(
    "/generate",
    summary="Generate a personalized AI learning roadmap (streaming)",
    description=(
        "Uses LangGraph + Neo4j Knowledge Graph + Groq LLM to generate "
        "a multi-stage personalized learning roadmap. "
        "Response is streamed as Server-Sent Events for real-time UI updates."
    ),
)
async def generate_roadmap(
    request: RoadmapGenerateRequest,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """
    ⭐ FLAGSHIP FEATURE — Streaming AI roadmap generation.

    The frontend receives chunks like:
        data: {"stage": 1, "title": "Learn Docker Basics", "weeks": "1-2", ...}
        data: {"stage": 2, "title": "Kubernetes Fundamentals", "weeks": "3-5", ...}
        data: {"decision": true, "question": "Prefer AWS or GCP?", "options": [...]}
        data: {"done": true, "roadmap_id": "uuid-here"}

    Uses SSE (text/event-stream) so Vercel AI SDK can handle it natively.
    """
    log.info(
        "Roadmap generation requested",
        career=request.target_career_slug,
        skills_count=len(request.current_skills),
        track=request.track_preference,
    )

    async def event_stream() -> AsyncGenerator[str, None]:
        """
        Yields SSE-formatted chunks as the LangGraph agent generates the roadmap.
        Each chunk is a JSON string prefixed with 'data: '.
        """
        try:
            async for chunk in roadmap_agent.generate_stream(
                target_career=request.target_career_slug,
                current_skills=request.current_skills,
                track=request.track_preference,
                timeline_weeks=request.timeline_weeks,
                experience_level=request.experience_level,
                user_id=request.user_id,
                db=db,
            ):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            log.error("Roadmap generation error", error=str(e))
            yield f'data: {{"error": "{str(e)}"}}\n\n'

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable Nginx buffering
        },
    )


@router.get(
    "/{roadmap_id}",
    summary="Retrieve a previously generated roadmap",
)
async def get_roadmap(
    roadmap_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Fetch a saved roadmap by ID."""
    from sqlalchemy import text

    result = await db.execute(
        text("SELECT * FROM user_roadmaps WHERE id = :id"),
        {"id": str(roadmap_id)},
    )
    row = result.mappings().one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return dict(row)


@router.get(
    "/user/{user_id}",
    summary="List all roadmaps for a user",
)
async def list_user_roadmaps(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Returns all saved roadmaps for a given user."""
    from sqlalchemy import text

    result = await db.execute(
        text("""
            SELECT ur.id, ur.title, ur.track, ur.created_at, c.title AS career_title
            FROM user_roadmaps ur
            JOIN careers c ON ur.career_id = c.id
            WHERE ur.user_id = :user_id
            ORDER BY ur.created_at DESC
        """),
        {"user_id": user_id},
    )
    return {"roadmaps": [dict(r) for r in result.mappings().all()]}
