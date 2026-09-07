"""Vidyavani — API v1 router package"""
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

__all__ = [
    "resume", "skills", "careers", "roadmap",
    "dashboard", "graph", "chat", "jobs", "feedback",
]
