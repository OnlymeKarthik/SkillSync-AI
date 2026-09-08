"""
Vidyavani — Feedback API
"""

from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import structlog

from app.core.database import get_db

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/feedback", tags=["Feedback"])


class FeedbackRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    category: str = "general"
    message: str
    user_id: Optional[str] = None


@router.post("/", summary="Submit feedback")
async def submit_feedback(request: FeedbackRequest, db: AsyncSession = Depends(get_db)):
    """Stores user feedback in Supabase/PostgreSQL."""
    await db.execute(
        text("""
            INSERT INTO feedback (user_id, name, email, category, message)
            VALUES (:user_id, :name, :email, :category, :message)
        """),
        request.model_dump(),
    )
    # NOTE: Do NOT call db.commit() here — the postgres_session() context manager
    # in database.py already auto-commits on clean exit. Double-committing
    # raises InvalidRequestError on some SQLAlchemy versions.
    return {"status": "submitted", "message": "Thank you for your feedback!"}
