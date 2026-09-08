"""
Vidyavani — Dashboard API
==============================
GET /api/v1/dashboard/gap-analysis
GET /api/v1/dashboard/stats
GET /api/v1/dashboard/sector-breakdown

Powers the Tremor charts on the frontend dashboard.
Returns aggregated skill gap data comparing:
  - What industry demands (from job postings)
  - What NSQF curricula teach
  - Split by Private vs Government sector
"""

from typing import List, Optional
import structlog
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# =============================================================================
# Response Schemas
# =============================================================================

class SkillGapItem(BaseModel):
    skill_name: str
    private_demand: int       # How many private job postings mention this skill
    govt_demand: int          # How many govt job postings mention this skill
    curriculum_coverage: float  # 0.0 to 1.0 — how well curricula cover this skill
    gap_score: float            # Higher = bigger gap


class DashboardStats(BaseModel):
    total_jobs_scraped: int
    total_private_jobs: int
    total_govt_jobs: int
    total_curriculum_skills: int
    total_skill_gaps: int
    avg_gap_coverage_percent: float
    last_updated: str


# =============================================================================
# Endpoints
# =============================================================================

@router.get(
    "/gap-analysis",
    summary="Top skill gaps — industry demand vs curriculum coverage",
    description=(
        "Returns top N skills demanded in job postings that are "
        "either missing from or poorly covered by NSQF curricula. "
        "Split by private and government sector for comparison."
    ),
)
async def get_gap_analysis(
    limit: int = Query(default=10, ge=1, le=50, description="Number of skills to return"),
    sector: str = Query(default="all", pattern="^(all|private|govt|PRIVATE|GOVERNMENT)$"),
    domain: Optional[str] = Query(default=None, description="Filter by career domain"),
    db: AsyncSession = Depends(get_db),
):
    """
    Powers the main bar chart on the dashboard.
    Returns data in the format Tremor's BarChart expects.
    The `sector` filter now actually constrains which job postings are included.
    """
    # Normalize sector to DB values
    sector_map = {"all": None, "private": "PRIVATE", "govt": "GOVERNMENT",
                  "PRIVATE": "PRIVATE", "GOVERNMENT": "GOVERNMENT"}
    db_sector = sector_map.get(sector)

    if db_sector is None:
        # Show both sectors side by side
        query = text("""
            WITH private_demand AS (
                SELECT
                    es.name        AS skill_name,
                    COUNT(*)       AS demand_count
                FROM extracted_skills es
                JOIN job_postings jp ON es.job_id = jp.id
                WHERE jp.sector_type = 'PRIVATE'
                  AND jp.scraped_at >= NOW() - INTERVAL '30 days'
                GROUP BY es.name
            ),
            govt_demand AS (
                SELECT
                    es.name        AS skill_name,
                    COUNT(*)       AS demand_count
                FROM extracted_skills es
                JOIN job_postings jp ON es.job_id = jp.id
                WHERE jp.sector_type = 'GOVERNMENT'
                  AND jp.scraped_at >= NOW() - INTERVAL '30 days'
                GROUP BY es.name
            ),
            combined AS (
                SELECT
                    COALESCE(p.skill_name, g.skill_name) AS skill_name,
                    COALESCE(p.demand_count, 0)           AS private_demand,
                    COALESCE(g.demand_count, 0)           AS govt_demand
                FROM private_demand p
                FULL OUTER JOIN govt_demand g ON p.skill_name = g.skill_name
            )
            SELECT
                c.skill_name,
                c.private_demand,
                c.govt_demand,
                (c.private_demand + c.govt_demand) AS total_demand
            FROM combined c
            ORDER BY total_demand DESC
            LIMIT :limit
        """)
        result = await db.execute(query, {"limit": limit})
    else:
        # Filter to a single sector only
        query = text("""
            SELECT
                es.name                                  AS skill_name,
                COUNT(*) FILTER (WHERE jp.sector_type = 'PRIVATE')     AS private_demand,
                COUNT(*) FILTER (WHERE jp.sector_type = 'GOVERNMENT')  AS govt_demand,
                COUNT(*)                                                AS total_demand
            FROM extracted_skills es
            JOIN job_postings jp ON es.job_id = jp.id
            WHERE jp.sector_type = :sector
              AND jp.scraped_at >= NOW() - INTERVAL '30 days'
            GROUP BY es.name
            ORDER BY total_demand DESC
            LIMIT :limit
        """)
        result = await db.execute(query, {"sector": db_sector, "limit": limit})

    rows = result.mappings().all()

    # Format for Recharts BarChart — each item is one bar group
    chart_data = [
        {
            "skill": row["skill_name"],
            "Private Sector": row["private_demand"],
            "Government": row["govt_demand"],
        }
        for row in rows
    ]

    return {
        "chart_data": chart_data,
        "period": "last_30_days",
        "categories": ["Private Sector", "Government"],
        "sector_filter": sector,
    }


@router.get("/stats", response_model=DashboardStats, summary="Platform KPI stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Returns headline numbers for the stat cards at the top of the dashboard."""

    stats_query = text("""
        SELECT
            COUNT(*)                                          AS total_jobs,
            COUNT(*) FILTER (WHERE sector_type = 'PRIVATE')  AS private_jobs,
            COUNT(*) FILTER (WHERE sector_type = 'GOVERNMENT') AS govt_jobs,
            MAX(scraped_at)                                   AS last_scraped
        FROM job_postings
    """)
    skills_query = text("SELECT COUNT(*) AS total FROM curriculum_skills")
    gaps_query = text("""
        SELECT COUNT(DISTINCT skill_name) AS gaps
        FROM skill_demand_stats
        WHERE demand_percent > 5.0
          AND period_date >= CURRENT_DATE - INTERVAL '7 days'
    """)
    # Compute avg gap coverage dynamically:
    # For each high-demand skill, check if it has a strong curriculum match (similarity >= 0.85).
    # avg_gap_coverage = % of top skills that ARE covered.
    coverage_query = text("""
        SELECT
            ROUND(
                100.0 * COUNT(*) FILTER (
                    WHERE EXISTS (
                        SELECT 1 FROM curriculum_skills cs
                        WHERE cs.embedding IS NOT NULL
                          AND 1 - (cs.embedding <=> es.embedding) >= 0.85
                    )
                ) / NULLIF(COUNT(*), 0),
                1
            ) AS coverage_percent
        FROM extracted_skills es
        WHERE es.embedding IS NOT NULL
    """)

    jobs_result     = await db.execute(stats_query)
    skills_result   = await db.execute(skills_query)
    gaps_result     = await db.execute(gaps_query)
    coverage_result = await db.execute(coverage_query)

    jobs     = jobs_result.mappings().one()
    skills   = skills_result.mappings().one()
    gaps     = gaps_result.mappings().one()
    coverage = coverage_result.mappings().one()

    # Fall back to a sensible default only if no embedding data exists yet
    avg_coverage = float(coverage["coverage_percent"] or 0.0)

    return DashboardStats(
        total_jobs_scraped=jobs["total_jobs"] or 0,
        total_private_jobs=jobs["private_jobs"] or 0,
        total_govt_jobs=jobs["govt_jobs"] or 0,
        total_curriculum_skills=skills["total"] or 0,
        total_skill_gaps=gaps["gaps"] or 0,
        avg_gap_coverage_percent=avg_coverage,
        last_updated=str(jobs["last_scraped"] or "Not yet scraped"),
    )
