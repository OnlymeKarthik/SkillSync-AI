"""
Vidyavani — Knowledge Graph API
"""

from typing import Optional
from fastapi import APIRouter, Query
import structlog

from app.core.database import db_manager

log = structlog.get_logger(__name__)
router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])


@router.get("/nodes", summary="Get skill graph nodes for visualization")
async def get_graph_nodes(
    sector: Optional[str] = Query(default=None),
    career_slug: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
):
    """
    Returns nodes and edges for D3.js force-directed graph.
    Filters by sector or career to keep the graph manageable (<= 50 nodes).
    """
    if career_slug:
        cypher = """
            MATCH (s:Skill)-[:REQUIRED_BY]->(c:Career {slug: $career_slug})
            OPTIONAL MATCH (s)-[p:PREREQUISITE_OF]->(s2:Skill)
            RETURN s.name AS id, s.name AS label, s.category AS group,
                   s.gap_score AS gap_score,
                   collect({type:'PREREQUISITE_OF', target:s2.name}) AS relationships
            LIMIT $limit
        """
        params = {"career_slug": career_slug, "limit": limit}
    else:
        cypher = """
            MATCH (s:Skill)
            OPTIONAL MATCH (s)-[r:REQUIRED_BY]->(c:Career)
            OPTIONAL MATCH (s)-[p:PREREQUISITE_OF]->(s2:Skill)
            WITH s, collect(DISTINCT {type: 'REQUIRED_BY', target: c.slug}) +
                    collect(DISTINCT {type: 'PREREQUISITE_OF', target: s2.name}) AS rels
            RETURN s.name AS id, s.name AS label, s.category AS group,
                   s.gap_score AS gap_score, rels AS relationships
            LIMIT $limit
        """
        params = {"limit": limit}

    nodes = await db_manager.neo4j_query(cypher, params)
    return {"nodes": nodes, "count": len(nodes)}


@router.get("/path", summary="Find skill path between current skills and target career")
async def get_skill_path(
    from_skills: str = Query(..., description="Comma-separated current skills"),
    to_career: str = Query(..., description="Target career slug"),
):
    """
    Uses Neo4j shortest path to find the missing skill hops
    between what the user knows and what the career requires.
    """
    skill_list = [s.strip() for s in from_skills.split(",")]
    cypher = """
        MATCH (target:Career {slug: $career})
        MATCH (target)<-[:REQUIRED_BY]-(required:Skill)
        WHERE NOT required.name IN $known_skills
        OPTIONAL MATCH path = shortestPath(
            (known:Skill)-[:PREREQUISITE_OF*1..5]->(required)
        )
        WHERE known.name IN $known_skills
        RETURN required.name AS missing_skill,
               [n IN nodes(path) | n.name] AS prerequisite_path,
               length(path) AS hops
        ORDER BY hops ASC
        LIMIT 20
    """
    result = await db_manager.neo4j_query(
        cypher, {"career": to_career, "known_skills": skill_list}
    )
    return {"missing_skills": result, "from_skills": skill_list, "to_career": to_career}
