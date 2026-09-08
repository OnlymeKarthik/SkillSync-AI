"""
Vidyavani — LangGraph Roadmap Agent
=======================================
Generates personalized multi-stage learning roadmaps by:
  1. Querying Neo4j to find the skill gap path to target career
  2. Constructing a LangGraph workflow
  3. Streaming the roadmap via Groq LLM (with Gemini + Ollama fallbacks)

The roadmap includes:
  - Multiple stages (e.g., Foundation → Core → Advanced → Specialization)
  - Decision breakpoints (branch based on user preferences)
  - Free track (SWAYAM, NPTEL, YouTube) and Paid track (Coursera, Udemy)
  - Estimated time per stage
"""

import json
from typing import AsyncGenerator, List, Optional

import structlog
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.core.database import db_manager

log = structlog.get_logger(__name__)


ROADMAP_SYSTEM_PROMPT = """You are Vidyavani's career roadmap expert, specializing in the Indian job market and NSQF framework.

Generate a personalized learning roadmap for someone who wants to become a {target_career}.
Their current skills: {current_skills}
Skills they need to acquire (identified from the knowledge graph): {missing_skills}
Track preference: {track} (free = SWAYAM/NPTEL/YouTube only, paid = Coursera/Udemy, hybrid = mix)
Timeline: {timeline_weeks} weeks
Experience level: {experience_level}

Output a JSON array of roadmap stages. Each stage must follow this exact schema:
{{
  "stage": 1,
  "title": "Stage title",
  "duration_weeks": 2,
  "skills": ["skill1", "skill2"],
  "description": "What the learner will be able to do after this stage",
  "resources": [
    {{"name": "Resource name", "url": "url", "type": "free|paid", "platform": "SWAYAM|NPTEL|YouTube|Coursera|Udemy|Other", "duration_hrs": 10}}
  ],
  "milestone": "What to build/achieve as proof of completion",
  "is_decision_point": false
}}

If there's a natural decision point (e.g., choose AWS vs GCP), output a decision stage:
{{
  "stage": 3,
  "is_decision_point": true,
  "question": "Do you prefer cloud infrastructure or ML pipelines?",
  "options": [
    {{"label": "Cloud Infrastructure", "next_skills": ["AWS", "Terraform"]}},
    {{"label": "ML Pipelines", "next_skills": ["MLflow", "Kubeflow"]}}
  ]
}}

Return ONLY a valid JSON array. No markdown, no explanation."""


class RoadmapAgent:
    """LangGraph-powered roadmap generation agent."""

    def __init__(self):
        # Lazy-initialized to avoid crashing at import time when GROQ_API_KEY
        # is blank/placeholder. The client is created on first actual use.
        self._groq: ChatGroq | None = None

    def _get_groq(self) -> ChatGroq:
        """Return the Groq client, creating it on first call."""
        if self._groq is None:
            if not settings.GROQ_API_KEY or settings.GROQ_API_KEY.startswith("your_"):
                raise RuntimeError(
                    "GROQ_API_KEY is not set. Add a valid key to backend/.env "
                    "(get one free at console.groq.com)."
                )
            self._groq = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model=settings.GROQ_MODEL,
                temperature=0.3,
                max_tokens=settings.GROQ_MAX_TOKENS,
                streaming=True,
            )
        return self._groq

    async def _get_missing_skills(
        self, target_career: str, current_skills: List[str]
    ) -> List[str]:
        """Query Neo4j to find skills required by the career that the user lacks."""
        try:
            cypher = """
                MATCH (c:Career {slug: $career})<-[:REQUIRED_BY]-(s:Skill)
                WHERE NOT s.name IN $known_skills
                RETURN s.name AS skill, s.gap_score AS gap_score
                ORDER BY gap_score DESC
                LIMIT 15
            """
            results = await db_manager.neo4j_query(
                cypher,
                {"career": target_career, "known_skills": current_skills},
            )
            return [r["skill"] for r in results]
        except Exception as e:
            log.warning("Neo4j query failed, using fallback skills", error=str(e))
            # Fallback: return common skills if Neo4j is unavailable
            return ["Docker", "Kubernetes", "Python Advanced", "SQL Advanced", "Cloud Fundamentals"]

    async def generate_stream(
        self,
        target_career: str,
        current_skills: List[str],
        track: str,
        timeline_weeks: int,
        experience_level: str,
        user_id: Optional[str],
        db,
    ) -> AsyncGenerator[str, None]:
        """
        Streams roadmap generation chunks via SSE.
        Each chunk is a JSON string representing one roadmap stage.
        """
        # Step 1: Get missing skills from knowledge graph
        missing_skills = await self._get_missing_skills(target_career, current_skills)
        log.info(
            "Roadmap generation started",
            career=target_career,
            missing_count=len(missing_skills),
        )

        # Step 2: Build prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", ROADMAP_SYSTEM_PROMPT),
        ])
        chain = prompt | self._get_groq()

        # Step 3: Stream from Groq
        full_response = ""
        try:
            async for chunk in chain.astream({
                "target_career": target_career,
                "current_skills": ", ".join(current_skills) if current_skills else "None specified",
                "missing_skills": ", ".join(missing_skills),
                "track": track,
                "timeline_weeks": timeline_weeks,
                "experience_level": experience_level,
            }):
                if hasattr(chunk, "content") and chunk.content:
                    full_response += chunk.content
                    # Stream partial chunks for real-time UI feel
                    yield json.dumps({"chunk": chunk.content, "done": False})

        except Exception as e:
            log.error("Groq streaming failed, trying Ollama fallback", error=str(e))
            # Ollama fallback
            yield json.dumps({"chunk": "Switching to offline mode...\n", "done": False})
            async for token in self._ollama_fallback(
                target_career, missing_skills, track, timeline_weeks
            ):
                full_response += token
                yield json.dumps({"chunk": token, "done": False})

        # Step 4: Parse and save if user is logged in
        try:
            stages = json.loads(full_response)
            if user_id and db:
                roadmap_id = await self._save_roadmap(user_id, target_career, stages, track, db)
            else:
                roadmap_id = None

            yield json.dumps({
                "done": True,
                "roadmap_id": roadmap_id,
                "stages": stages,
                "missing_skills_count": len(missing_skills),
            })
        except json.JSONDecodeError:
            yield json.dumps({"done": True, "error": "Could not parse roadmap structure"})

    async def _ollama_fallback(
        self, career: str, missing_skills: List[str], track: str, weeks: int
    ) -> AsyncGenerator[str, None]:
        """
        Fallback to local Ollama (Llama 3.2 3B) when Groq is unavailable.
        Smaller model = shorter but still useful output.
        """
        import httpx
        prompt = (
            f"Generate a {weeks}-week learning roadmap to become a {career}. "
            f"Skills to learn: {', '.join(missing_skills[:5])}. "
            f"Track: {track}. Return as JSON array of stages."
        )
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": True},
                timeout=60,
            ) as response:
                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        yield data.get("response", "")

    async def _save_roadmap(
        self, user_id: str, career_slug: str, stages: list, track: str, db
    ) -> str:
        """Persist generated roadmap to PostgreSQL and return the new roadmap UUID."""
        from sqlalchemy import text
        result = await db.execute(
            text("""
                INSERT INTO user_roadmaps (user_id, career_id, title, content, track)
                SELECT :user_id, c.id, :title, :content ::jsonb, :track
                FROM careers c WHERE c.slug = :slug
                RETURNING id
            """),
            {
                "user_id": user_id,
                "slug": career_slug,
                "title": f"Roadmap to {career_slug.replace('-', ' ').title()}",
                "content": json.dumps(stages),
                "track": track,
            },
        )
        row = result.fetchone()
        return str(row[0]) if row else None


# Singleton
roadmap_agent = RoadmapAgent()
