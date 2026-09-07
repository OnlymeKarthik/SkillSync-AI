"""
Vidyavani — FastAPI Application Entry Point
==============================================
This is the root of the backend application.

- Configures CORS for the Next.js frontend
- Registers all API routers under /api/v1/
- Manages application lifespan (startup: DB connections, model loading)
- Provides a health check at GET /health

Run with:
    uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import db_manager
from app.api.v1 import (
    resume,
    skills,
    careers,
    roadmap,
    dashboard,
    graph,
    chat,
    jobs,
    feedback,
)

# Structured logger — outputs JSON in production, pretty in development
log = structlog.get_logger(__name__)


# =============================================================================
# Lifespan: runs startup/shutdown logic around the app's lifecycle
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Startup: Initialize all connections and load the embedding model.
    Each connection is non-fatal — the server boots even if Docker services
    (Neo4j, Redis, PostgreSQL) are not running yet. Affected endpoints will
    return 503; the rest of the API (AI chat, roadmap, careers) stays up.
    Shutdown: Gracefully close all connections.
    """
    log.info("Vidyavani starting up...", env=settings.APP_ENV)

    # 1. Connect to PostgreSQL
    try:
        await db_manager.connect_postgres()
        log.info("PostgreSQL connected")
    except Exception as e:
        log.warning("PostgreSQL unavailable — start Docker to enable DB features", error=str(e))

    # 2. Connect to Neo4j
    try:
        await db_manager.connect_neo4j()
        log.info("Neo4j connected")
    except Exception as e:
        log.warning("Neo4j unavailable — start Docker to enable graph features", error=str(e))

    # 3. Connect to Redis
    try:
        await db_manager.connect_redis()
        log.info("Redis connected")
    except Exception as e:
        log.warning("Redis unavailable — caching disabled", error=str(e))

    # 4. Pre-load BAAI/bge-m3 embedding model (optional — skip if torch not installed)
    try:
        from app.services.embedding import embedding_service
        await embedding_service.initialize()
        log.info("Embedding model loaded", model=settings.EMBEDDING_MODEL)
    except Exception as e:
        log.warning("Embedding model not loaded — install sentence-transformers", error=str(e))

    log.info("Vidyavani API ready. Docs at http://localhost:8000/docs")

    yield  # <- App is running here

    # --- Shutdown ---
    log.info("Vidyavani shutting down...")
    await db_manager.disconnect_all()
    log.info("All connections closed")


# =============================================================================
# FastAPI Application Instance
# =============================================================================

app = FastAPI(
    title="Vidyavani API",
    description=(
        "AI-powered career intelligence platform. "
        "Bridges the gap between NSQF curricula and real industry demand."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",           # Swagger UI — great for hackathon demos
    redoc_url="/redoc",
    lifespan=lifespan,
)


# =============================================================================
# Middleware
# =============================================================================

# CORS — allow the Next.js frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip — compress large responses (e.g., knowledge graph data)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# =============================================================================
# Routers — all mounted under /api/v1/
# =============================================================================

API_PREFIX = "/api/v1"

app.include_router(resume.router,    prefix=API_PREFIX, tags=["Resume"])
app.include_router(skills.router,    prefix=API_PREFIX, tags=["Skills"])
app.include_router(careers.router,   prefix=API_PREFIX, tags=["Careers"])
app.include_router(roadmap.router,   prefix=API_PREFIX, tags=["Roadmap"])
app.include_router(dashboard.router, prefix=API_PREFIX, tags=["Dashboard"])
app.include_router(graph.router,     prefix=API_PREFIX, tags=["Knowledge Graph"])
app.include_router(chat.router,      prefix=API_PREFIX, tags=["Chat"])
app.include_router(jobs.router,      prefix=API_PREFIX, tags=["Jobs"])
app.include_router(feedback.router,  prefix=API_PREFIX, tags=["Feedback"])


# =============================================================================
# Health Check
# =============================================================================

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Quick liveness check. Returns status of all connected services.
    Used by Docker health checks and monitoring.
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "services": await db_manager.health_status(),
    }


@app.get("/", tags=["Root"])
async def root():
    """Redirect hint for users who hit the root URL."""
    return {
        "message": "Welcome to Vidyavani API",
        "docs": "/docs",
        "health": "/health",
    }
