"""
Vidyavani — Jobs, Careers, Chat, Graph, Feedback API stubs
=============================================================
These are fully scaffolded endpoints ready for implementation.
Each router is already registered in main.py.
"""

# ---- jobs.py ----------------------------------------------------------------
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get(
    "/",
    summary="List job postings with filters",
    description="Returns scraped job postings. Filter by sector type, state, domain, and salary.",
)
async def list_jobs(
    sector_type: str = Query(default="all", pattern="^(all|PRIVATE|GOVERNMENT)$"),
    state: Optional[str] = Query(default=None),
    domain: Optional[str] = Query(default=None),
    salary_min: Optional[int] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * page_size
    # All user values go into bind params — never interpolated into SQL
    conditions: list[str] = []
    params: dict = {"limit": page_size, "offset": offset}

    if sector_type != "all":
        conditions.append("sector_type = :sector_type")
        params["sector_type"] = sector_type
    if state:
        conditions.append("state ILIKE :state")
        params["state"] = f"%{state}%"
    if domain:
        conditions.append("title ILIKE :domain")
        params["domain"] = f"%{domain}%"
    if salary_min is not None:
        conditions.append("salary_min >= :salary_min")
        params["salary_min"] = salary_min

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    result = await db.execute(
        text(f"""
            SELECT id, title, company, location, state, sector_type,
                   source, salary_min, salary_max, experience_min,
                   experience_max, url, posted_at
            FROM job_postings
            {where}
            ORDER BY posted_at DESC NULLS LAST
            LIMIT :limit OFFSET :offset
        """),
        params,
    )
    return {"jobs": [dict(r) for r in result.mappings().all()], "page": page}
