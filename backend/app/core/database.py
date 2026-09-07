"""
Vidyavani — Database Connection Manager
==========================================
Manages async connections to:
  - PostgreSQL (via asyncpg + SQLAlchemy 2.0)
  - Neo4j     (via official neo4j async driver)
  - Redis     (via redis-py async)

Usage:
    from app.core.database import db_manager, get_db

    # In FastAPI dependency injection:
    async def my_endpoint(db: AsyncSession = Depends(get_db)):
        ...

    # Neo4j sessions:
    async with db_manager.neo4j_session() as session:
        result = await session.run("MATCH (n:Skill) RETURN n LIMIT 10")
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import redis.asyncio as aioredis
import structlog
from neo4j import AsyncGraphDatabase, AsyncDriver
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

log = structlog.get_logger(__name__)


# =============================================================================
# SQLAlchemy — PostgreSQL
# =============================================================================

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


class DatabaseManager:
    """
    Centralized manager for all database connections.
    Initialized once at application startup via the lifespan handler in main.py.
    """

    def __init__(self):
        self._pg_engine: AsyncEngine | None = None
        self._pg_session_factory: async_sessionmaker | None = None
        self._neo4j_driver: AsyncDriver | None = None
        self._redis: aioredis.Redis | None = None

    # -------------------------------------------------------------------------
    # PostgreSQL
    # -------------------------------------------------------------------------

    async def connect_postgres(self) -> None:
        """Create the async SQLAlchemy engine and session factory."""
        self._pg_engine = create_async_engine(
            settings.DATABASE_URL,
            pool_size=settings.DATABASE_POOL_SIZE,
            max_overflow=settings.DATABASE_MAX_OVERFLOW,
            pool_pre_ping=True,          # Validate connections before use
            echo=settings.DEBUG,         # Log SQL queries in development
        )
        self._pg_session_factory = async_sessionmaker(
            bind=self._pg_engine,
            class_=AsyncSession,
            expire_on_commit=False,      # Avoid lazy-loading issues with async
            autocommit=False,
            autoflush=False,
        )

    @asynccontextmanager
    async def postgres_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Context manager yielding a PostgreSQL async session."""
        if self._pg_session_factory is None:
            raise RuntimeError("PostgreSQL not connected. Call connect_postgres() first.")
        async with self._pg_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    # -------------------------------------------------------------------------
    # Neo4j
    # -------------------------------------------------------------------------

    async def connect_neo4j(self) -> None:
        """Create the Neo4j async driver."""
        self._neo4j_driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            max_connection_pool_size=50,
        )
        # Verify connectivity
        await self._neo4j_driver.verify_connectivity()

    @asynccontextmanager
    async def neo4j_session(self) -> AsyncGenerator:
        """Context manager yielding a Neo4j async session."""
        if self._neo4j_driver is None:
            raise RuntimeError("Neo4j not connected. Call connect_neo4j() first.")
        async with self._neo4j_driver.session() as session:
            yield session

    async def neo4j_query(self, cypher: str, params: dict = None) -> list:
        """
        Convenience method: run a Cypher query and return all records as dicts.

        Example:
            results = await db_manager.neo4j_query(
                "MATCH (s:Skill)-[:REQUIRED_BY]->(c:Career {slug: $slug}) RETURN s",
                {"slug": "data-engineer"}
            )
        """
        async with self.neo4j_session() as session:
            result = await session.run(cypher, params or {})
            records = await result.data()
            return records

    # -------------------------------------------------------------------------
    # Redis
    # -------------------------------------------------------------------------

    async def connect_redis(self) -> None:
        """Create the Redis async connection pool."""
        self._redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
        # Verify connectivity
        await self._redis.ping()

    @property
    def redis(self) -> aioredis.Redis:
        """Access the Redis client directly (for cache operations)."""
        if self._redis is None:
            raise RuntimeError("Redis not connected. Call connect_redis() first.")
        return self._redis

    # -------------------------------------------------------------------------
    # Health check
    # -------------------------------------------------------------------------

    async def health_status(self) -> dict:
        """Returns connection status of all services (used by /health endpoint)."""
        status = {}

        # PostgreSQL
        try:
            async with self.postgres_session() as session:
                await session.execute(__import__("sqlalchemy").text("SELECT 1"))
            status["postgresql"] = "healthy"
        except Exception as e:
            status["postgresql"] = f"unhealthy: {str(e)}"

        # Neo4j
        try:
            await self.neo4j_query("RETURN 1 AS ping")
            status["neo4j"] = "healthy"
        except Exception as e:
            status["neo4j"] = f"unhealthy: {str(e)}"

        # Redis
        try:
            await self._redis.ping()
            status["redis"] = "healthy"
        except Exception as e:
            status["redis"] = f"unhealthy: {str(e)}"

        return status

    # -------------------------------------------------------------------------
    # Disconnect
    # -------------------------------------------------------------------------

    async def disconnect_all(self) -> None:
        """Gracefully close all database connections on shutdown."""
        if self._pg_engine:
            await self._pg_engine.dispose()
        if self._neo4j_driver:
            await self._neo4j_driver.close()
        if self._redis:
            await self._redis.aclose()


# =============================================================================
# Singleton instance — import this everywhere
# =============================================================================

db_manager = DatabaseManager()


# =============================================================================
# FastAPI dependency — inject a PostgreSQL session into route handlers
# =============================================================================

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for injecting a database session.

    Usage in a route:
        from app.core.database import get_db
        from fastapi import Depends
        from sqlalchemy.ext.asyncio import AsyncSession

        @router.get("/example")
        async def my_route(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(MyModel))
            ...
    """
    async with db_manager.postgres_session() as session:
        yield session
