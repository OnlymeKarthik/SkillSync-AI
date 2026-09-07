"""
Vidyavani — Resume Pydantic Schemas
"""

from typing import List, Optional
from pydantic import BaseModel


class ExtractedSkillItem(BaseModel):
    name: str
    category: str          # e.g., "Programming", "Cloud", "Soft Skills"
    confidence: float
    level: Optional[str] = None   # "beginner" | "intermediate" | "advanced" | None


class ResumeAnalysisResponse(BaseModel):
    session_id: str
    candidate_name: Optional[str] = None
    education_level: Optional[str] = None
    domain: Optional[str] = None
    years_of_experience: Optional[int] = None
    extracted_skills: List[ExtractedSkillItem] = []
    skill_count: int = 0
    resume_summary: str = ""    # AI-generated 2-line summary of the candidate


class CareerScoreResponse(BaseModel):
    career_slug: str
    career_title: str
    match_score: float              # 0–100
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    partially_matched: List[str] = []
    estimated_salary_current: str = ""   # With current skills
    estimated_salary_upskilled: str = "" # After filling gaps
    readiness_label: str = "Needs Work"  # "Ready" | "Almost There" | "Needs Work"
