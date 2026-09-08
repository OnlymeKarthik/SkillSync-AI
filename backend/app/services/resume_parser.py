"""
Vidyavani — Resume Parser Service
=====================================
Extracts structured skills from uploaded PDF/DOCX resumes.
Uses PyMuPDF for PDF text extraction + spaCy NER + Groq LLM for skill structuring.
"""

import json
import os
from typing import List, Optional

import structlog
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from app.core.config import settings
from app.schemas.resume import ExtractedSkillItem, ResumeAnalysisResponse, CareerScoreResponse

log = structlog.get_logger(__name__)


# LLM prompt for extracting structured skills from resume text
SKILL_EXTRACTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an expert HR analyst and career coach specializing in the Indian job market and NSQF framework.
Extract skills from the resume text below and return a JSON object with these exact fields:
{{
  "candidate_name": "string or null",
  "education_level": "string (e.g., 'B.Tech CSE', 'NSQF Level 5', 'Diploma') or null",
  "domain": "string (e.g., 'Software Development', 'Data Science') or null",
  "years_of_experience": integer or null,
  "skills": [
    {{"name": "skill name", "category": "Programming|Cloud|Data|DevOps|Security|Soft Skills|Other", "confidence": 0.0-1.0, "level": "beginner|intermediate|advanced|null"}}
  ],
  "summary": "2-sentence professional summary of the candidate"
}}
Return ONLY valid JSON. No markdown, no explanation."""),
    ("human", "Resume text:\n\n{resume_text}"),
])


class ResumeParserService:
    """Parses resumes and extracts structured skill profiles."""

    def __init__(self):
        # Lazy-initialized to avoid crashing at import time when GROQ_API_KEY
        # is blank/placeholder.
        self._llm: ChatGroq | None = None
        self._chain = None
        # In-memory session store (TODO: migrate to Redis for persistence)
        self._sessions: dict = {}

    def _get_chain(self):
        """Build the LangChain extraction chain on first use."""
        if self._chain is None:
            if not settings.GROQ_API_KEY or settings.GROQ_API_KEY.startswith("your_"):
                raise RuntimeError(
                    "GROQ_API_KEY is not set. Add a valid key to backend/.env "
                    "(get one free at console.groq.com)."
                )
            self._llm = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model=settings.GROQ_MODEL,
                temperature=0,
                max_tokens=2000,
            )
            self._chain = SKILL_EXTRACTION_PROMPT | self._llm
        return self._chain

    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract raw text from a PDF using PyMuPDF."""
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()

    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract raw text from a DOCX file using python-docx."""
        from docx import Document
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs]).strip()

    async def parse(
        self,
        file_path: str,
        session_id: str,
        file_type: str,  # ".pdf" or ".docx"
    ) -> ResumeAnalysisResponse:
        """
        Main parsing pipeline:
          1. Extract raw text from file
          2. Send to Groq LLM for structured skill extraction
          3. Store session data for subsequent /analyze calls
          4. Return structured response
        """
        # Step 1: Extract text
        if file_type == ".pdf":
            raw_text = self._extract_text_from_pdf(file_path)
        else:
            raw_text = self._extract_text_from_docx(file_path)

        if not raw_text or len(raw_text) < 50:
            raise ValueError("Could not extract readable text from resume. Check the file format.")

        log.info("Resume text extracted", session_id=session_id, length=len(raw_text))

        # Step 2: LLM extraction
        try:
            response = await self._get_chain().ainvoke({"resume_text": raw_text[:8000]})  # Truncate to token limit
            parsed = json.loads(response.content)
        except json.JSONDecodeError:
            log.error("LLM returned invalid JSON", session_id=session_id)
            raise ValueError("AI could not parse resume structure. Try a different file.")

        # Step 3: Build response
        skills = [
            ExtractedSkillItem(
                name=s.get("name", ""),
                category=s.get("category", "Other"),
                confidence=float(s.get("confidence", 0.8)),
                level=s.get("level"),
            )
            for s in parsed.get("skills", [])
            if s.get("name")
        ]

        result = ResumeAnalysisResponse(
            session_id=session_id,
            candidate_name=parsed.get("candidate_name"),
            education_level=parsed.get("education_level"),
            domain=parsed.get("domain"),
            years_of_experience=parsed.get("years_of_experience"),
            extracted_skills=skills,
            skill_count=len(skills),
            resume_summary=parsed.get("summary", "Professional with IT background."),
        )

        # Step 4: Cache session data
        self._sessions[session_id] = {
            "skills": [s.name for s in skills],
            "domain": result.domain,
            "experience": result.years_of_experience,
        }

        return result

    async def score_against_career(
        self,
        session_id: str,
        career_slug: str,
        db,
    ) -> CareerScoreResponse:
        """Score a user's resume against a specific career's required skills."""
        from sqlalchemy import text

        session = self._sessions.get(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found. Upload resume first.")

        user_skills_lower = {s.lower() for s in session["skills"]}

        # Get career required skills
        result = await db.execute(
            text("""
                SELECT c.title, c.avg_salary_min, c.avg_salary_max,
                       cs.skill_name, cs.importance
                FROM careers c
                JOIN career_skills cs ON c.id = cs.career_id
                WHERE c.slug = :slug
                ORDER BY cs.importance DESC
            """),
            {"slug": career_slug},
        )
        rows = result.mappings().all()
        if not rows:
            raise ValueError(f"Career '{career_slug}' not found")

        career_title = rows[0]["title"]
        salary_min = rows[0]["avg_salary_min"]
        salary_max = rows[0]["avg_salary_max"]

        matched, missing, partial = [], [], []
        for row in rows:
            skill = row["skill_name"]
            skill_lower = skill.lower()
            if skill_lower in user_skills_lower:
                matched.append(skill)
            elif any(word in user_skills_lower for word in skill_lower.split()):
                partial.append(skill)
            else:
                missing.append(skill)

        total = len(rows)
        score = round(((len(matched) + len(partial) * 0.5) / total) * 100, 1) if total else 0

        label = "Ready" if score >= 80 else "Almost There" if score >= 50 else "Needs Work"
        upskill_bonus = min(score + 35, 100)

        # Salary is stored as annual INR in the DB.
        # Convert to monthly for display: annual / 12, then format as LPA (lakhs per annum).
        def fmt_lpa(annual_inr: int) -> str:
            """Format annual INR as '₹X.XL/yr' (lakhs per annum)."""
            lpa = round(annual_inr / 100_000, 1)
            return f"₹{lpa}L/yr"

        return CareerScoreResponse(
            career_slug=career_slug,
            career_title=career_title,
            match_score=score,
            matched_skills=matched,
            missing_skills=missing,
            partially_matched=partial,
            estimated_salary_current=fmt_lpa(int(salary_min * score / 100)),
            estimated_salary_upskilled=f"{fmt_lpa(salary_min)}–{fmt_lpa(salary_max)}",
            readiness_label=label,
        )


# Singleton
resume_parser_service = ResumeParserService()
