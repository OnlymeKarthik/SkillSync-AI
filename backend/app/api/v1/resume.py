"""
Vidyavani — Resume Upload & Analysis API
============================================
POST /api/v1/resume/upload   — Accept PDF/DOCX, extract skills with AI
GET  /api/v1/resume/analyze  — Return skill gap analysis for uploaded resume
POST /api/v1/resume/score    — Score resume against a specific career

This is Feature 0 — the entry point of the user journey.
Every personalized recommendation flows from what we extract here.
"""

import os
import uuid
from typing import List, Optional

import structlog
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.schemas.resume import ExtractedSkillItem, ResumeAnalysisResponse, CareerScoreResponse
from app.services.resume_parser import resume_parser_service

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/resume", tags=["Resume"])


# =============================================================================
# Endpoints
# =============================================================================

@router.post(
    "/upload",
    response_model=ResumeAnalysisResponse,
    summary="Upload resume and extract skills with AI",
    description=(
        "Accepts a PDF or DOCX resume file. "
        "Runs it through PyMuPDF + LlamaIndex + spaCy NER to extract "
        "skills, education level, experience, and generates a candidate summary."
    ),
)
async def upload_resume(
    file: UploadFile = File(..., description="Resume file — PDF or DOCX only"),
    target_career: Optional[str] = Form(default=None, description="Optional target career slug"),
    db: AsyncSession = Depends(get_db),
) -> ResumeAnalysisResponse:
    """
    ⭐ KEY FEATURE — Upload resume → get instant AI skill extraction.

    Steps:
      1. Validate file type (PDF/DOCX only)
      2. Save to uploads directory
      3. Extract text via PyMuPDF or python-docx
      4. Run spaCy NER + Groq LLM to extract structured skills
      5. Return structured analysis
    """
    # Validate file type
    allowed_types = {
        "application/pdf": ".pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    }
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF and DOCX files are accepted.",
        )

    # Validate file size
    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # Save file to disk
    session_id = str(uuid.uuid4())
    ext = allowed_types[file.content_type]
    file_path = os.path.join(settings.RESUME_UPLOAD_DIR, f"{session_id}{ext}")
    os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(content)

    log.info("Resume uploaded", session_id=session_id, size=len(content))

    # Parse and extract skills
    try:
        analysis = await resume_parser_service.parse(
            file_path=file_path,
            session_id=session_id,
            file_type=ext,
        )
    except Exception as e:
        log.error("Resume parsing failed", session_id=session_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume analysis failed: {str(e)}",
        )

    return analysis


@router.get(
    "/analyze/{session_id}",
    response_model=CareerScoreResponse,
    summary="Score resume against a specific career",
    description="Returns match score, matched/missing skills, and salary estimates.",
)
async def analyze_against_career(
    session_id: str,
    career_slug: str,
    db: AsyncSession = Depends(get_db),
) -> CareerScoreResponse:
    """
    After resume upload, score the candidate against their target career.
    Uses vector similarity + career_skills table from PostgreSQL.
    """
    try:
        score = await resume_parser_service.score_against_career(
            session_id=session_id,
            career_slug=career_slug,
            db=db,
        )
        return score
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
