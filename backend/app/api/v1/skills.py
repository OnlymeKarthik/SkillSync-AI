"""
Vidyavani — Core API Endpoint: Skill Matching
=================================================
POST /api/v1/skills/match

The heart of the platform:
  Given a raw skill string (e.g., from a job posting),
  generate its bge-m3 vector embedding and find the
  closest matching NSQF curriculum skills using
  cosine distance in PostgreSQL/pgvector.

This is how we detect skill gaps:
  → High similarity = skill IS covered by curriculum
  → Low similarity  = skill IS a gap in the curriculum

Also provides:
  POST /api/v1/skills/match-batch — match multiple skills at once
  GET  /api/v1/skills/gap-summary — top N unmatched skills (the gaps)
"""

from typing import List, Optional
from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.embedding import embedding_service

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/skills", tags=["Skills"])


# =============================================================================
# Request / Response Schemas
# =============================================================================

class SkillMatchRequest(BaseModel):
    """Request body for matching a single job skill against NSQF curricula."""

    skill: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="The skill name extracted from a job posting.",
        examples=["React.js", "Docker containerization", "Large Language Models"],
    )
    match_threshold: float = Field(
        default=0.70,
        ge=0.0,
        le=1.0,
        description=(
            "Minimum cosine similarity to include in results. "
            "0.70 = reasonably similar, 0.90+ = near-identical."
        ),
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of curriculum skill matches to return.",
    )


class CurriculumMatch(BaseModel):
    """A single curriculum skill that matched the query."""
    skill_id: UUID
    skill_name: str
    course_name: str
    nsqf_level: int
    similarity_score: float = Field(description="Cosine similarity: 0.0 to 1.0")
    is_strong_match: bool = Field(
        description="True if similarity >= 0.85 (skill is well-covered by curriculum)"
    )


class SkillMatchResponse(BaseModel):
    """Response for a single skill match query."""
    queried_skill: str
    matches: List[CurriculumMatch]
    is_curriculum_gap: bool = Field(
        description=(
            "True if no strong match (>= 0.85) exists in any curriculum. "
            "This skill represents a gap the education system should address."
        )
    )
    gap_severity: str = Field(
        description="none | low | medium | high — based on best similarity score"
    )


class BatchMatchRequest(BaseModel):
    """Request body for matching multiple skills in one call."""
    skills: List[str] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of skill names to match.",
        examples=[["React.js", "Docker", "Kubernetes", "GraphQL"]],
    )
    match_threshold: float = Field(default=0.70, ge=0.0, le=1.0)
    top_k: int = Field(default=3, ge=1, le=10)


class BatchMatchResponse(BaseModel):
    """Response for batch skill matching."""
    results: List[SkillMatchResponse]
    total_skills: int
    gap_count: int
    coverage_percent: float = Field(description="% of skills covered by curriculum")


# =============================================================================
# Helper Functions
# =============================================================================

def _calculate_gap_severity(best_score: float) -> str:
    """
    Translate cosine similarity into a human-readable gap severity.

    Score interpretation:
      0.90+ → No gap (well covered)
      0.75–0.89 → Low gap (partially covered)
      0.50–0.74 → Medium gap (barely mentioned)
      < 0.50  → High gap (completely missing)
    """
    if best_score >= 0.90:
        return "none"
    elif best_score >= 0.75:
        return "low"
    elif best_score >= 0.50:
        return "medium"
    else:
        return "high"


async def _match_skill(
    skill: str,
    db: AsyncSession,
    threshold: float = 0.70,
    top_k: int = 5,
) -> SkillMatchResponse:
    """
    Core matching logic — shared by single and batch endpoints.

    Steps:
      1. Generate bge-m3 embedding for the skill string
      2. Call match_curriculum_skills() SQL function (cosine distance via pgvector)
      3. Structure results and compute gap metrics
    """
    # Step 1: Generate embedding
    try:
        embedding = await embedding_service.embed(skill)
    except Exception as e:
        log.error("Embedding generation failed", skill=skill, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Embedding service error: {str(e)}",
        )

    # Step 2: Query PostgreSQL using the cosine similarity function from schema.sql
    # The <=> operator is pgvector's cosine distance (lower = more similar)
    query = text("""
        SELECT
            skill_id,
            skill_name,
            course_name,
            nsqf_level,
            similarity_score
        FROM match_curriculum_skills(
            :embedding ::vector,
            :threshold,
            :top_k
        )
        ORDER BY similarity_score DESC
    """)

    result = await db.execute(
        query,
        {
            "embedding": embedding,
            "threshold": threshold,
            "top_k": top_k,
        },
    )
    rows = result.mappings().all()

    # Step 3: Structure results
    matches = [
        CurriculumMatch(
            skill_id=row["skill_id"],
            skill_name=row["skill_name"],
            course_name=row["course_name"],
            nsqf_level=row["nsqf_level"],
            similarity_score=round(row["similarity_score"], 4),
            is_strong_match=row["similarity_score"] >= 0.85,
        )
        for row in rows
    ]

    best_score = matches[0].similarity_score if matches else 0.0
    is_gap = not any(m.is_strong_match for m in matches)

    return SkillMatchResponse(
        queried_skill=skill,
        matches=matches,
        is_curriculum_gap=is_gap,
        gap_severity=_calculate_gap_severity(best_score),
    )


# =============================================================================
# Endpoints
# =============================================================================

@router.post(
    "/match",
    response_model=SkillMatchResponse,
    summary="Match a job skill to NSQF curriculum skills",
    description=(
        "Generates a vector embedding for the input skill and performs "
        "cosine similarity search against all curriculum skills in PostgreSQL. "
        "Returns the closest matches and whether the skill represents a curriculum gap."
    ),
)
async def match_skill(
    request: SkillMatchRequest,
    db: AsyncSession = Depends(get_db),
) -> SkillMatchResponse:
    """
    ⭐ KEY ENDPOINT — The core of Vidyavani's gap detection.

    Example request:
        POST /api/v1/skills/match
        {
          "skill": "Docker containerization",
          "match_threshold": 0.70,
          "top_k": 5
        }

    Example response shows similarity scores:
        "Docker" → "Container Technology" (0.91) ← covered
        "Kubernetes" → "Basic Linux" (0.52) ← GAP
    """
    log.info("Skill match request", skill=request.skill)
    return await _match_skill(
        skill=request.skill,
        db=db,
        threshold=request.match_threshold,
        top_k=request.top_k,
    )


@router.post(
    "/match-batch",
    response_model=BatchMatchResponse,
    summary="Match multiple job skills at once",
    description="Batch version of /match — efficient for processing all skills from a job posting.",
)
async def match_skills_batch(
    request: BatchMatchRequest,
    db: AsyncSession = Depends(get_db),
) -> BatchMatchResponse:
    """
    Match all skills from a job posting in a single API call.
    Used by the scraper pipeline after NER extraction.
    """
    log.info("Batch skill match request", count=len(request.skills))

    results = []
    for skill in request.skills:
        result = await _match_skill(
            skill=skill,
            db=db,
            threshold=request.match_threshold,
            top_k=request.top_k,
        )
        results.append(result)

    gap_count = sum(1 for r in results if r.is_curriculum_gap)
    coverage_pct = round((len(results) - gap_count) / len(results) * 100, 1)

    return BatchMatchResponse(
        results=results,
        total_skills=len(results),
        gap_count=gap_count,
        coverage_percent=coverage_pct,
    )


@router.get(
    "/gap-summary",
    summary="Get top skill gaps across all job postings",
    description=(
        "Returns the N skills most frequently demanded in job postings "
        "that have NO strong match in any NSQF curriculum. "
        "Filtered by sector type: all, private, or government."
    ),
)
async def get_gap_summary(
    sector_type: str = Query(default="all", pattern="^(all|PRIVATE|GOVERNMENT)$"),
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the top skill gaps — the skills industry demands that
    curricula don't teach. This powers the dashboard charts.
    """
    where_clause = "" if sector_type == "all" else "WHERE sector_type = :sector_type"

    query = text(f"""
        SELECT
            skill_name,
            SUM(demand_count)       AS total_demand,
            MAX(demand_percent)     AS peak_demand_percent,
            sector_type
        FROM skill_demand_stats
        {where_clause}
        AND period_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY skill_name, sector_type
        ORDER BY total_demand DESC
        LIMIT :limit
    """)

    params = {"limit": limit}
    if sector_type != "all":
        params["sector_type"] = sector_type

    result = await db.execute(query, params)
    rows = result.mappings().all()

    return {
        "sector_type": sector_type,
        "period": "last_30_days",
        "gaps": [dict(row) for row in rows],
    }
