"""
Vidyavani — Application Settings
=====================================
All configuration is loaded from environment variables via pydantic-settings.
Values come from your .env file (copy from .env.example).
"""

from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Strongly-typed settings object. All fields are validated on startup.
    Missing required fields will cause an immediate error with a clear message.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",            # Ignore env vars not defined here
    )

    # --- Application ---
    APP_ENV: str = "development"
    APP_NAME: str = "Vidyavani"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # --- API Server ---
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # --- PostgreSQL ---
    DATABASE_URL: str = "postgresql+asyncpg://vidyavani:vidyavani_secret@localhost:5432/vidyavani_db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # --- Neo4j ---
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "vidyavani_neo4j"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- LLM: Groq (Primary) ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_MAX_TOKENS: int = 4096

    # --- LLM: Gemini (Fallback 1) ---
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # --- LLM: Ollama (Fallback 2 — fully offline) ---
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"

    # --- Embeddings ---
    EMBEDDING_MODEL: str = "BAAI/bge-m3"
    EMBEDDING_DIMENSION: int = 1024
    EMBEDDING_DEVICE: str = "cpu"

    # --- Supabase ---
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # --- File Storage ---
    RESUME_UPLOAD_DIR: str = "./uploads/resumes"
    NSQF_PDF_DIR: str = "./data/nsqf_pdfs"
    MAX_FILE_SIZE_MB: int = 10

    # --- CORS ---
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # --- Background Jobs ---
    ARQ_MAX_JOBS: int = 10
    SCRAPE_INTERVAL_HOURS: int = 24

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        """Handle comma-separated string or JSON array for ALLOWED_ORIGINS."""
        if isinstance(v, str):
            # If it looks like JSON, parse it; otherwise split by comma
            if v.startswith("["):
                import json
                return json.loads(v)
            return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


# =============================================================================
# Singleton settings instance
# Using lru_cache so .env is only read once per process.
# Import and use: from app.core.config import settings
# =============================================================================

@lru_cache
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
