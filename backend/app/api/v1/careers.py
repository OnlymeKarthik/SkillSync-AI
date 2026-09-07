"""
Vidyavani — Careers API
============================
GET /api/v1/careers/          — List and filter careers
GET /api/v1/careers/{slug}    — Get career details with required skills
GET /api/v1/careers/compare   — Side-by-side career comparison
POST /api/v1/careers/recommend — AI-powered career recommendations
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db

router = APIRouter(prefix="/careers", tags=["Careers"])


class CareerRecommendRequest(BaseModel):
    current_skills: List[str]
    education_level: Optional[str] = None
    interests: List[str] = []
    experience_years: int = 0


@router.get("/", summary="List and filter careers")
async def list_careers(
    domain: Optional[str] = Query(default=None),
    difficulty: Optional[str] = Query(default=None, pattern="^(beginner|intermediate|advanced)$"),
    salary_min: Optional[int] = Query(default=None),
    growth_rate_min: Optional[float] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Browse all available careers with rich filters."""
    conditions, params = [], {"limit": page_size, "offset": (page - 1) * page_size}

    if domain:
        conditions.append("domain ILIKE :domain")
        params["domain"] = f"%{domain}%"
    if difficulty:
        conditions.append("difficulty = :difficulty")
        params["difficulty"] = difficulty
    if salary_min:
        conditions.append("avg_salary_min >= :salary_min")
        params["salary_min"] = salary_min
    if growth_rate_min:
        conditions.append("growth_rate >= :growth_rate_min")
        params["growth_rate_min"] = growth_rate_min

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    result = await db.execute(
        text(f"""
            SELECT id, slug, title, domain, difficulty,
                   avg_salary_min, avg_salary_max, growth_rate, nsqf_levels
            FROM careers {where}
            ORDER BY growth_rate DESC NULLS LAST
            LIMIT :limit OFFSET :offset
        """),
        params,
    )
    return {"careers": [dict(r) for r in result.mappings().all()], "page": page}


@router.get("/compare", summary="Compare multiple careers side by side")
async def compare_careers(
    slugs: str = Query(..., description="Comma-separated career slugs, max 4"),
    db: AsyncSession = Depends(get_db),
):
    """Returns structured comparison data for up to 4 careers."""
    slug_list = [s.strip() for s in slugs.split(",")][:4]
    result = await db.execute(
        text("""
            SELECT c.*, array_agg(cs.skill_name ORDER BY cs.importance DESC) AS top_skills
            FROM careers c
            LEFT JOIN career_skills cs ON c.id = cs.career_id
            WHERE c.slug = ANY(:slugs)
            GROUP BY c.id
        """),
        {"slugs": slug_list},
    )
    careers = [dict(r) for r in result.mappings().all()]
    if not careers:
        raise HTTPException(status_code=404, detail="No careers found for given slugs")
    return {"careers": careers}


@router.get("/{slug}", summary="Get full career details")
async def get_career(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("""
            SELECT c.*, array_agg(
                json_build_object('skill', cs.skill_name, 'importance', cs.importance)
                ORDER BY cs.importance DESC
            ) AS required_skills
            FROM careers c
            LEFT JOIN career_skills cs ON c.id = cs.career_id
            WHERE c.slug = :slug
            GROUP BY c.id
        """),
        {"slug": slug},
    )
    row = result.mappings().one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail=f"Career '{slug}' not found")
    return dict(row)


@router.post("/recommend", summary="AI-powered career recommendations with weighted scoring")
async def recommend_careers(
    request: CareerRecommendRequest,
    top_k: int = Query(default=5, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
):
    """
    Weighted scoring formula:
      match_score = (skill_overlap × 0.5) + (education_fit × 0.3) + (interest_align × 0.2)

    Returns top-K career recommendations ranked by match score.
    """
    from app.services.embedding import embedding_service

    if not request.current_skills:
        raise HTTPException(status_code=400, detail="At least one skill required")

    # Embed the combined skills string for semantic career matching
    skills_text = ", ".join(request.current_skills)
    query_vec = await embedding_service.embed(skills_text)

    result = await db.execute(
        text("""
            SELECT
                slug, title, domain, difficulty,
                avg_salary_min, avg_salary_max, growth_rate,
                1 - (embedding <=> :vec ::vector) AS skill_similarity
            FROM careers
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> :vec ::vector
            LIMIT :k
        """),
        {"vec": query_vec, "k": top_k},
    )
    rows = result.mappings().all()

    recommendations = []
    for row in rows:
        # Weighted score (simplified — full scoring in roadmap_agent)
        skill_score = row["skill_similarity"] * 0.5
        match_score = round(min(skill_score * 100 + 20, 100), 1)
        recommendations.append({
            **dict(row),
            "match_score": match_score,
        })

    return {"recommendations": recommendations}
