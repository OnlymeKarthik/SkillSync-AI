#!/usr/bin/env python3
"""
Vidyavani — Neo4j Knowledge Graph Seeder
========================================
Populates the Neo4j graph database with:
  1. Career nodes (12 careers matching the PostgreSQL database)
  2. Skill nodes (with categories and industry gap_scores)
  3. (Skill)-[:REQUIRED_BY]->(Career) relationships
  4. (Skill)-[:PREREQUISITE_OF]->(Skill) knowledge graph hierarchy

Usage:
    python scripts/seed_neo4j.py
    python scripts/seed_neo4j.py --clear  # Clears existing graph before seeding
"""

import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv
from neo4j import GraphDatabase

# Load backend/.env
backend_dir = Path(__file__).resolve().parent.parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "vidyavani_neo4j")

# =============================================================================
# DATA DEFINITIONS
# =============================================================================

CAREERS = [
    {
        "slug": "data-engineer",
        "title": "Data Engineer",
        "domain": "Data & AI",
        "difficulty": "intermediate",
        "growth_rate": 34.5,
    },
    {
        "slug": "ml-engineer",
        "title": "Machine Learning Engineer",
        "domain": "Data & AI",
        "difficulty": "advanced",
        "growth_rate": 42.0,
    },
    {
        "slug": "cloud-architect",
        "title": "Cloud Solutions Architect",
        "domain": "Cloud & DevOps",
        "difficulty": "advanced",
        "growth_rate": 38.2,
    },
    {
        "slug": "devops-engineer",
        "title": "DevOps Engineer",
        "domain": "Cloud & DevOps",
        "difficulty": "intermediate",
        "growth_rate": 35.8,
    },
    {
        "slug": "fullstack-developer",
        "title": "Full Stack Developer",
        "domain": "Software Development",
        "difficulty": "intermediate",
        "growth_rate": 28.0,
    },
    {
        "slug": "cybersecurity-analyst",
        "title": "Cybersecurity Analyst",
        "domain": "Security",
        "difficulty": "intermediate",
        "growth_rate": 31.5,
    },
    {
        "slug": "data-scientist",
        "title": "Data Scientist",
        "domain": "Data & AI",
        "difficulty": "advanced",
        "growth_rate": 40.1,
    },
    {
        "slug": "product-manager",
        "title": "Technical Product Manager",
        "domain": "Management",
        "difficulty": "advanced",
        "growth_rate": 25.0,
    },
    {
        "slug": "ux-designer",
        "title": "UX/UI Designer",
        "domain": "Design",
        "difficulty": "beginner",
        "growth_rate": 22.5,
    },
    {
        "slug": "backend-developer",
        "title": "Backend Developer",
        "domain": "Software Development",
        "difficulty": "intermediate",
        "growth_rate": 27.0,
    },
    {
        "slug": "govt-data-analyst",
        "title": "Govt Data Analyst (NIC)",
        "domain": "Government & PSU",
        "difficulty": "intermediate",
        "growth_rate": 18.0,
    },
    {
        "slug": "it-officer-banking",
        "title": "IT Officer (Banking Sector)",
        "domain": "Government & PSU",
        "difficulty": "intermediate",
        "growth_rate": 20.0,
    },
]

SKILLS = [
    # Data & AI
    {"name": "Python", "category": "Data & AI", "gap_score": 0.85},
    {"name": "SQL", "category": "Data & AI", "gap_score": 0.80},
    {"name": "Apache Spark", "category": "Data & AI", "gap_score": 0.75},
    {"name": "Apache Kafka", "category": "Data & AI", "gap_score": 0.72},
    {"name": "dbt", "category": "Data & AI", "gap_score": 0.68},
    {"name": "Apache Airflow", "category": "Data & AI", "gap_score": 0.70},
    {"name": "PyTorch", "category": "Data & AI", "gap_score": 0.82},
    {"name": "TensorFlow", "category": "Data & AI", "gap_score": 0.74},
    {"name": "MLflow", "category": "Data & AI", "gap_score": 0.65},
    {"name": "LLM Fine-tuning", "category": "Data & AI", "gap_score": 0.90},
    {"name": "Vector Databases", "category": "Data & AI", "gap_score": 0.88},
    {"name": "Pandas and NumPy", "category": "Data & AI", "gap_score": 0.60},
    {"name": "Statistical Analysis", "category": "Data & AI", "gap_score": 0.62},
    {"name": "Data Cleaning and Preprocessing", "category": "Data & AI", "gap_score": 0.58},
    {"name": "Scikit-Learn", "category": "Data & AI", "gap_score": 0.66},
    {"name": "Data Warehousing", "category": "Data & AI", "gap_score": 0.71},

    # Cloud & DevOps
    {"name": "Docker", "category": "Cloud & DevOps", "gap_score": 0.78},
    {"name": "Kubernetes", "category": "Cloud & DevOps", "gap_score": 0.84},
    {"name": "Terraform", "category": "Cloud & DevOps", "gap_score": 0.76},
    {"name": "AWS Solutions Architect", "category": "Cloud & DevOps", "gap_score": 0.82},
    {"name": "AWS/GCP/Azure", "category": "Cloud & DevOps", "gap_score": 0.80},
    {"name": "Linux Command Line", "category": "Cloud & DevOps", "gap_score": 0.65},
    {"name": "CI/CD Pipelines", "category": "Cloud & DevOps", "gap_score": 0.73},
    {"name": "Networking Fundamentals", "category": "Cloud & DevOps", "gap_score": 0.60},
    {"name": "Prometheus & Grafana", "category": "Cloud & DevOps", "gap_score": 0.64},

    # Software Development
    {"name": "React.js", "category": "Software Development", "gap_score": 0.75},
    {"name": "Node.js", "category": "Software Development", "gap_score": 0.72},
    {"name": "TypeScript", "category": "Software Development", "gap_score": 0.78},
    {"name": "PostgreSQL", "category": "Software Development", "gap_score": 0.70},
    {"name": "REST APIs", "category": "Software Development", "gap_score": 0.68},
    {"name": "Git", "category": "Software Development", "gap_score": 0.55},
    {"name": "Next.js", "category": "Software Development", "gap_score": 0.74},
    {"name": "GraphQL", "category": "Software Development", "gap_score": 0.62},
    {"name": "Redis Caching", "category": "Software Development", "gap_score": 0.66},
    {"name": "FastAPI", "category": "Software Development", "gap_score": 0.71},
    {"name": "Microservices", "category": "Software Development", "gap_score": 0.79},
    {"name": "HTML5 & CSS3", "category": "Software Development", "gap_score": 0.45},
    {"name": "JavaScript Basics", "category": "Software Development", "gap_score": 0.50},

    # Security
    {"name": "Cybersecurity Fundamentals", "category": "Security", "gap_score": 0.72},
    {"name": "Ethical Hacking", "category": "Security", "gap_score": 0.77},
    {"name": "SIEM Tools", "category": "Security", "gap_score": 0.69},
    {"name": "Incident Response", "category": "Security", "gap_score": 0.65},
    {"name": "Penetration Testing", "category": "Security", "gap_score": 0.74},
    {"name": "Network Security", "category": "Security", "gap_score": 0.68},

    # Management & Product
    {"name": "Agile and Scrum", "category": "Management", "gap_score": 0.58},
    {"name": "Product Strategy", "category": "Management", "gap_score": 0.67},
    {"name": "Roadmapping", "category": "Management", "gap_score": 0.60},
    {"name": "User Research", "category": "Management", "gap_score": 0.56},
    {"name": "Metrics & KPIs", "category": "Management", "gap_score": 0.62},

    # Design
    {"name": "UI/UX Design", "category": "Design", "gap_score": 0.62},
    {"name": "Figma", "category": "Design", "gap_score": 0.68},
    {"name": "Wireframing & Prototyping", "category": "Design", "gap_score": 0.55},
    {"name": "Design Systems", "category": "Design", "gap_score": 0.64},

    # Government & PSU
    {"name": "E-Governance Standards", "category": "Government & PSU", "gap_score": 0.52},
    {"name": "NIC Data Compliance", "category": "Government & PSU", "gap_score": 0.50},
    {"name": "Banking IT Systems", "category": "Government & PSU", "gap_score": 0.58},
    {"name": "Public Sector Auditing", "category": "Government & PSU", "gap_score": 0.48},
    {"name": "Power BI & Dashboards", "category": "Government & PSU", "gap_score": 0.64},
]

# (Skill name) -> REQUIRED_BY -> (Career slug) with importance
CAREER_SKILLS = [
    # Data Engineer
    ("Apache Spark", "data-engineer", 1.0),
    ("Apache Kafka", "data-engineer", 0.9),
    ("dbt", "data-engineer", 0.9),
    ("Apache Airflow", "data-engineer", 0.85),
    ("Python", "data-engineer", 1.0),
    ("SQL", "data-engineer", 1.0),
    ("AWS/GCP/Azure", "data-engineer", 0.8),
    ("Docker", "data-engineer", 0.75),
    ("Data Warehousing", "data-engineer", 0.88),

    # ML Engineer
    ("PyTorch", "ml-engineer", 1.0),
    ("TensorFlow", "ml-engineer", 0.9),
    ("MLflow", "ml-engineer", 0.85),
    ("Kubernetes", "ml-engineer", 0.8),
    ("Python", "ml-engineer", 1.0),
    ("LLM Fine-tuning", "ml-engineer", 0.75),
    ("Vector Databases", "ml-engineer", 0.7),
    ("Docker", "ml-engineer", 0.8),

    # Cloud Architect
    ("AWS Solutions Architect", "cloud-architect", 1.0),
    ("Terraform", "cloud-architect", 1.0),
    ("Kubernetes", "cloud-architect", 0.95),
    ("Networking Fundamentals", "cloud-architect", 0.9),
    ("Docker", "cloud-architect", 0.85),
    ("Microservices", "cloud-architect", 0.85),

    # DevOps Engineer
    ("Docker", "devops-engineer", 1.0),
    ("Kubernetes", "devops-engineer", 0.95),
    ("CI/CD Pipelines", "devops-engineer", 1.0),
    ("Terraform", "devops-engineer", 0.9),
    ("Linux Command Line", "devops-engineer", 0.95),
    ("Prometheus & Grafana", "devops-engineer", 0.8),
    ("Git", "devops-engineer", 0.9),

    # Full Stack Developer
    ("React.js", "fullstack-developer", 1.0),
    ("Node.js", "fullstack-developer", 0.95),
    ("TypeScript", "fullstack-developer", 0.9),
    ("PostgreSQL", "fullstack-developer", 0.85),
    ("REST APIs", "fullstack-developer", 1.0),
    ("Git", "fullstack-developer", 1.0),
    ("Next.js", "fullstack-developer", 0.85),

    # Cybersecurity Analyst
    ("Cybersecurity Fundamentals", "cybersecurity-analyst", 1.0),
    ("Ethical Hacking", "cybersecurity-analyst", 0.9),
    ("SIEM Tools", "cybersecurity-analyst", 0.85),
    ("Incident Response", "cybersecurity-analyst", 0.9),
    ("Penetration Testing", "cybersecurity-analyst", 0.8),
    ("Network Security", "cybersecurity-analyst", 0.95),
    ("Linux Command Line", "cybersecurity-analyst", 0.75),

    # Data Scientist
    ("Python", "data-scientist", 1.0),
    ("Statistical Analysis", "data-scientist", 0.95),
    ("Pandas and NumPy", "data-scientist", 0.95),
    ("Scikit-Learn", "data-scientist", 0.9),
    ("SQL", "data-scientist", 0.85),
    ("PyTorch", "data-scientist", 0.8),
    ("Data Cleaning and Preprocessing", "data-scientist", 0.9),

    # Technical Product Manager
    ("Product Strategy", "product-manager", 1.0),
    ("Agile and Scrum", "product-manager", 0.95),
    ("Roadmapping", "product-manager", 0.9),
    ("Metrics & KPIs", "product-manager", 0.85),
    ("User Research", "product-manager", 0.8),
    ("REST APIs", "product-manager", 0.6),

    # UX/UI Designer
    ("UI/UX Design", "ux-designer", 1.0),
    ("Figma", "ux-designer", 1.0),
    ("Wireframing & Prototyping", "ux-designer", 0.95),
    ("Design Systems", "ux-designer", 0.85),
    ("User Research", "ux-designer", 0.85),
    ("HTML5 & CSS3", "ux-designer", 0.6),

    # Backend Developer
    ("Node.js", "backend-developer", 0.9),
    ("FastAPI", "backend-developer", 0.9),
    ("PostgreSQL", "backend-developer", 0.95),
    ("REST APIs", "backend-developer", 1.0),
    ("Redis Caching", "backend-developer", 0.8),
    ("Microservices", "backend-developer", 0.85),
    ("Docker", "backend-developer", 0.8),
    ("Git", "backend-developer", 0.9),

    # Govt Data Analyst (NIC)
    ("SQL", "govt-data-analyst", 1.0),
    ("Python", "govt-data-analyst", 0.85),
    ("Power BI & Dashboards", "govt-data-analyst", 0.9),
    ("E-Governance Standards", "govt-data-analyst", 0.95),
    ("NIC Data Compliance", "govt-data-analyst", 1.0),
    ("Data Cleaning and Preprocessing", "govt-data-analyst", 0.85),

    # IT Officer (Banking Sector)
    ("Banking IT Systems", "it-officer-banking", 1.0),
    ("SQL", "it-officer-banking", 0.95),
    ("Network Security", "it-officer-banking", 0.9),
    ("PostgreSQL", "it-officer-banking", 0.85),
    ("Public Sector Auditing", "it-officer-banking", 0.8),
    ("Cybersecurity Fundamentals", "it-officer-banking", 0.85),
]

# (From Skill) -> PREREQUISITE_OF -> (To Skill)
PREREQUISITES = [
    # Programming foundations -> advanced tools
    ("JavaScript Basics", "TypeScript"),
    ("JavaScript Basics", "Node.js"),
    ("HTML5 & CSS3", "React.js"),
    ("React.js", "Next.js"),
    ("Node.js", "REST APIs"),
    ("Node.js", "Microservices"),
    ("REST APIs", "FastAPI"),
    ("REST APIs", "GraphQL"),
    ("Git", "CI/CD Pipelines"),
    ("Linux Command Line", "Docker"),
    ("Docker", "Kubernetes"),
    ("Docker", "CI/CD Pipelines"),
    ("Kubernetes", "AWS Solutions Architect"),
    ("Terraform", "AWS Solutions Architect"),
    ("Networking Fundamentals", "AWS Solutions Architect"),
    ("Networking Fundamentals", "Network Security"),
    ("Network Security", "Cybersecurity Fundamentals"),
    ("Cybersecurity Fundamentals", "Ethical Hacking"),
    ("Cybersecurity Fundamentals", "SIEM Tools"),
    ("Ethical Hacking", "Penetration Testing"),
    ("Incident Response", "SIEM Tools"),

    # Data & AI prerequisites
    ("SQL", "Data Warehousing"),
    ("SQL", "dbt"),
    ("Python", "Pandas and NumPy"),
    ("Python", "Scikit-Learn"),
    ("Pandas and NumPy", "Statistical Analysis"),
    ("Pandas and NumPy", "Data Cleaning and Preprocessing"),
    ("Statistical Analysis", "Scikit-Learn"),
    ("Scikit-Learn", "PyTorch"),
    ("Scikit-Learn", "TensorFlow"),
    ("PyTorch", "LLM Fine-tuning"),
    ("PyTorch", "MLflow"),
    ("TensorFlow", "MLflow"),
    ("Python", "Apache Spark"),
    ("Apache Spark", "Apache Kafka"),
    ("Apache Spark", "Apache Airflow"),
    ("Data Cleaning and Preprocessing", "Power BI & Dashboards"),
    ("LLM Fine-tuning", "Vector Databases"),

    # Design prerequisites
    ("UI/UX Design", "Figma"),
    ("Figma", "Wireframing & Prototyping"),
    ("Wireframing & Prototyping", "Design Systems"),
    ("User Research", "UI/UX Design"),

    # Management prerequisites
    ("Agile and Scrum", "Product Strategy"),
    ("Product Strategy", "Roadmapping"),
    ("Metrics & KPIs", "Product Strategy"),

    # Government prerequisites
    ("SQL", "NIC Data Compliance"),
    ("E-Governance Standards", "NIC Data Compliance"),
    ("Cybersecurity Fundamentals", "Banking IT Systems"),
]


def seed():
    parser = argparse.ArgumentParser(description="Seed Neo4j with Vidyavani Career and Skill Knowledge Graph")
    parser.add_argument("--clear", action="store_true", help="Delete all nodes and edges before seeding")
    args = parser.parse_args()

    print("=" * 60)
    print(" Vidyavani — Neo4j Knowledge Graph Seeder")
    print("=" * 60)
    print(f" Connecting to: {NEO4J_URI} as {NEO4J_USER}")

    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        driver.verify_connectivity()
        print(" Connected to Neo4j successfully!")
    except Exception as e:
        print(f" Failed to connect to Neo4j: {e}", file=sys.stderr)
        sys.exit(1)

    with driver.session() as session:
        # Clear graph if requested
        if args.clear:
            print("\n Clearing existing graph data...")
            session.run("MATCH (n) DETACH DELETE n")
            print(" All nodes and relationships deleted.")

        # Create constraints / indexes
        print("\n Creating constraints...")
        try:
            session.run("CREATE CONSTRAINT career_slug_unique IF NOT EXISTS FOR (c:Career) REQUIRE c.slug IS UNIQUE")
            session.run("CREATE CONSTRAINT skill_name_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE")
            print(" Constraints created / verified.")
        except Exception as e:
            print(f" Note on constraints: {e}")

        # Seed Career nodes
        print(f"\n Seeding {len(CAREERS)} Career nodes...")
        for career in CAREERS:
            session.run(
                """
                MERGE (c:Career {slug: $slug})
                SET c.title = $title,
                    c.domain = $domain,
                    c.difficulty = $difficulty,
                    c.growth_rate = $growth_rate
                """,
                career,
            )
        print(f" Successfully seeded {len(CAREERS)} Career nodes.")

        # Seed Skill nodes
        print(f"\n Seeding {len(SKILLS)} Skill nodes...")
        for skill in SKILLS:
            session.run(
                """
                MERGE (s:Skill {name: $name})
                SET s.category = $category,
                    s.gap_score = $gap_score
                """,
                skill,
            )
        print(f" Successfully seeded {len(SKILLS)} Skill nodes.")

        # Seed REQUIRED_BY relationships: (Skill)-[:REQUIRED_BY]->(Career)
        print(f"\n Creating {len(CAREER_SKILLS)} REQUIRED_BY relationships...")
        req_count = 0
        for skill_name, career_slug, importance in CAREER_SKILLS:
            session.run(
                """
                MATCH (s:Skill {name: $skill_name})
                MATCH (c:Career {slug: $career_slug})
                MERGE (s)-[r:REQUIRED_BY]->(c)
                SET r.importance = $importance
                RETURN count(r) as count
                """,
                {"skill_name": skill_name, "career_slug": career_slug, "importance": importance},
            )
            req_count += 1
        print(f" Successfully created {req_count} (Skill)-[:REQUIRED_BY]->(Career) relationships.")

        # Seed PREREQUISITE_OF relationships: (s1)-[:PREREQUISITE_OF]->(s2)
        print(f"\n Creating {len(PREREQUISITES)} PREREQUISITE_OF relationships...")
        prereq_count = 0
        for from_skill, to_skill in PREREQUISITES:
            session.run(
                """
                MATCH (s1:Skill {name: $from_skill})
                MATCH (s2:Skill {name: $to_skill})
                MERGE (s1)-[r:PREREQUISITE_OF]->(s2)
                RETURN count(r) as count
                """,
                {"from_skill": from_skill, "to_skill": to_skill},
            )
            prereq_count += 1
        print(f" Successfully created {prereq_count} (Skill)-[:PREREQUISITE_OF]->(Skill) relationships.")

        # Verify graph statistics
        print("\n" + "=" * 60)
        print(" Verification & Summary")
        print("=" * 60)
        c_count = session.run("MATCH (c:Career) RETURN count(c) AS c").single()["c"]
        s_count = session.run("MATCH (s:Skill) RETURN count(s) AS s").single()["s"]
        r_count = session.run("MATCH ()-[r:REQUIRED_BY]->() RETURN count(r) AS r").single()["r"]
        p_count = session.run("MATCH ()-[p:PREREQUISITE_OF]->() RETURN count(p) AS p").single()["p"]

        print(f" Total Career Nodes:          {c_count}")
        print(f" Total Skill Nodes:           {s_count}")
        print(f" Total REQUIRED_BY edges:     {r_count}")
        print(f" Total PREREQUISITE_OF edges: {p_count}")
        print(f" Total Graph Nodes:           {c_count + s_count}")
        print(f" Total Graph Edges:           {r_count + p_count}")
        print("=" * 60)
        print(" Neo4j Graph Seeding Complete! The /graph page will now render correctly.")
        print("=" * 60)

    driver.close()


if __name__ == "__main__":
    seed()
