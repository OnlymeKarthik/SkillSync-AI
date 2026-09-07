"""
Vidyavani — BAAI/bge-m3 Embedding Service
=============================================
Generates 1024-dimensional multilingual vector embeddings for:
  - Job skills extracted from postings
  - Curriculum skills from NSQF courses
  - Career titles and descriptions
  - Resume skills

Model: BAAI/bge-m3
  - State-of-the-art multilingual model
  - Supports 100+ languages including Hindi
  - 1024-dim output — perfect for pgvector cosine search
  - Runs on CPU (no GPU needed for hackathon)

Usage:
    from app.services.embedding import embedding_service

    vector = await embedding_service.embed("React.js development")
    vectors = await embedding_service.embed_batch(["Python", "Docker", "AWS"])
"""

import asyncio
from functools import lru_cache
from typing import List

import structlog
import torch
from sentence_transformers import SentenceTransformer

from app.core.config import settings

log = structlog.get_logger(__name__)


class EmbeddingService:
    """
    Singleton service wrapping BAAI/bge-m3.

    The model is loaded once at startup (in lifespan) and reused for all requests.
    embed() is async-friendly — it runs the CPU-bound encode() in a thread pool
    so it doesn't block the FastAPI event loop.
    """

    def __init__(self):
        self._model: SentenceTransformer | None = None
        self._device: str = settings.EMBEDDING_DEVICE

    async def initialize(self) -> None:
        """
        Load the model into memory.
        Called once at application startup via main.py lifespan.
        First run will download the model (~2.2GB) — subsequent starts use cache.
        """
        log.info("Loading embedding model...", model=settings.EMBEDDING_MODEL)
        # Run in thread pool — model loading is CPU-bound and blocking
        loop = asyncio.get_event_loop()
        self._model = await loop.run_in_executor(
            None,
            lambda: SentenceTransformer(
                settings.EMBEDDING_MODEL,
                device=self._device,
            ),
        )
        log.info(
            "Embedding model ready",
            model=settings.EMBEDDING_MODEL,
            dimension=settings.EMBEDDING_DIMENSION,
            device=self._device,
        )

    async def embed(self, text: str) -> List[float]:
        """
        Embed a single text string.

        Returns a 1024-dimensional float list compatible with pgvector.

        Args:
            text: The skill name, job title, or description to embed.

        Returns:
            List[float] of length 1024.

        Example:
            vec = await embedding_service.embed("Machine Learning Engineer")
        """
        if self._model is None:
            raise RuntimeError("Embedding service not initialized. Call initialize() first.")

        # Normalize text — strip whitespace, lowercase
        text = text.strip().lower()
        if not text:
            raise ValueError("Cannot embed empty text.")

        loop = asyncio.get_event_loop()
        embedding = await loop.run_in_executor(
            None,
            lambda: self._model.encode(
                text,
                normalize_embeddings=True,   # L2 normalize — required for cosine similarity
                show_progress_bar=False,
            ),
        )
        return embedding.tolist()

    async def embed_batch(
        self,
        texts: List[str],
        batch_size: int = 32,
    ) -> List[List[float]]:
        """
        Embed a list of texts efficiently in batches.

        Args:
            texts: List of skill names or descriptions.
            batch_size: How many texts to encode at once (tune based on RAM).

        Returns:
            List of 1024-dim float lists, in the same order as input.

        Example:
            skills = ["Python", "Docker", "Kubernetes", "React.js"]
            vectors = await embedding_service.embed_batch(skills)
        """
        if self._model is None:
            raise RuntimeError("Embedding service not initialized.")

        # Normalize all texts
        texts = [t.strip().lower() for t in texts if t.strip()]

        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            None,
            lambda: self._model.encode(
                texts,
                batch_size=batch_size,
                normalize_embeddings=True,
                show_progress_bar=len(texts) > 10,  # Show progress for large batches
                convert_to_numpy=True,
            ),
        )
        return embeddings.tolist()

    def is_ready(self) -> bool:
        """Check if the model has been loaded."""
        return self._model is not None


# =============================================================================
# Singleton instance — import this in all services and routes
# =============================================================================

embedding_service = EmbeddingService()
