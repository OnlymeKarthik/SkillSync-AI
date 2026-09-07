# Vidyavani 🎓

> **Real-time AI career intelligence** — bridges the gap between NSQF academia and industry demand using Knowledge Graphs + GraphRAG.

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange?style=for-the-badge&logo=government)](https://sih.gov.in)
[![Next.js 15](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Neo4j](https://img.shields.io/badge/Neo4j-5.18-008CC1?style=for-the-badge&logo=neo4j)](https://neo4j.com)
[![PostgreSQL + pgvector](https://img.shields.io/badge/pgvector-0.7-336791?style=for-the-badge&logo=postgresql)](https://github.com/pgvector/pgvector)

**Team Fantastic Six** · Smart India Hackathon 2026

---

## 🎯 The Problem

India produces **1.5 crore skilled graduates every year** through NSQF-certified courses. Yet **47% of them remain unemployed within 6 months** because curricula lag behind rapidly evolving industry needs.

> A student finishes an NSQF Level 5 IT course in 2025. The curriculum was designed in 2021. The job market has moved to GenAI, Cloud-Native, and DevOps. **The student doesn't know what they're missing. The employer can't find the talent they need. Both lose.**

**Vidyavani exists to fix this — in real time.**

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📄 **AI Resume Analyzer** | Upload your resume → spaCy + LLM extracts skills and maps them to NSQF competencies |
| 🔍 **Skill Gap Detection** | pgvector cosine similarity compares your skills against live job market demand |
| 🗺️ **Personalized Roadmaps** | Streaming AI-generated learning paths to close your specific gaps (SSE) |
| 🌐 **Knowledge Graph** | Neo4j-powered interactive graph — skills, courses, careers, and their relationships (D3.js visualization) |
| 💬 **AI Career Advisor** | Streaming chat powered by LangGraph multi-agent orchestration (Groq / Gemini / Ollama fallback) |
| 📊 **Gap Analysis Dashboard** | Recharts-powered analytics — see where your curriculum falls short vs. industry |
| 🏢 **Job Board** | Government + private job listings with skill-based matching |
| ⚖️ **Career Comparison** | Side-by-side comparison of career paths with growth trajectories |
| 🤖 **GraphRAG Intelligence** | Microsoft GraphRAG community detection for discovering hidden skill clusters |

---

## 🏗️ Architecture

<p align="center">
  <img src="architecture_diagram.png" alt="Vidyavani End-to-End System Architecture" width="100%" />
</p>

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                    │
│   React 19 · TailwindCSS 4 · Framer Motion · Recharts · D3.js  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST + SSE
┌───────────────────────────▼─────────────────────────────────────┐
│                     Backend (FastAPI + LangGraph)                │
│      spaCy NER · BAAI/bge-m3 Embeddings · Crawl4AI Scraper     │
│      Groq LLM  ·  Gemini Fallback  ·  Ollama Offline           │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
┌──────▼──────┐   ┌───────▼───────┐   ┌──────▼──────┐
│ PostgreSQL  │   │    Neo4j 5    │   │   Redis 7   │
│ + pgvector  │   │  Knowledge   │   │  Cache +    │
│  (Vectors)  │   │    Graph     │   │  Task Queue │
└─────────────┘   └──────────────┘   └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose** (for databases)
- **Python 3.12+** (backend)
- **Node.js 20+** (frontend)

### 1. Clone & Start Infrastructure

```bash
git clone https://github.com/your-org/vidyavani.git
cd vidyavani

# Start PostgreSQL + pgvector, Neo4j, Redis, pgAdmin
docker-compose up -d
```

| Service | URL | Credentials |
|---------|-----|-------------|
| Neo4j Browser | http://localhost:7474 | `neo4j` / `vidyavani_neo4j` |
| pgAdmin | http://localhost:5050 | `admin@vidyavani.ai` / `admin` |
| PostgreSQL | `localhost:5432` | `vidyavani` / `vidyavani_secret` |
| Redis | `localhost:6379` | — |

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate         # macOS/Linux
# .venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Configure environment
cp .env.example .env
# Edit .env → add your GROQ_API_KEY (free at console.groq.com)

# Start the API server
uvicorn app.main:app --reload --port 8000
```

📖 API docs available at **http://localhost:8000/docs**

### 3. Frontend Setup (new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local

# Start dev server
npm run dev
```

🌐 App available at **http://localhost:3000**

---

## 📡 API Reference

All endpoints are mounted under `/api/v1/`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/resume/upload` | Upload resume → AI skill extraction |
| `GET` | `/resume/analyze/{session_id}` | Get career match score for a session |
| `POST` | `/skills/match` | pgvector cosine similarity skill matching |
| `POST` | `/roadmap/generate` | Streaming AI learning roadmap (SSE) |
| `GET` | `/dashboard/gap-analysis` | Chart data for gap analysis dashboard |
| `GET` | `/jobs/?type=govt\|private\|all` | Job listings with skill-based filtering |
| `GET` | `/graph/nodes` | Knowledge graph data for D3.js visualization |
| `POST` | `/chat/stream` | Streaming AI career advisor chat (SSE) |
| `GET` | `/careers/compare` | Side-by-side career path comparison |
| `POST` | `/feedback` | Submit user feedback |
| `GET` | `/health` | Service health check with dependency status |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework with App Router |
| React 19 | UI library |
| TailwindCSS 4 | Utility-first styling |
| Framer Motion | Animations & transitions |
| Recharts | Dashboard charts & analytics |
| D3.js + react-force-graph-2d | Interactive knowledge graph |
| Zustand | Lightweight state management |
| Vercel AI SDK | Streaming AI chat integration |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | Async Python API framework |
| LangGraph + LangChain | Multi-agent LLM orchestration |
| Groq / Gemini / Ollama | LLM providers (cascading fallback) |
| spaCy | Named Entity Recognition (skill extraction) |
| BAAI/bge-m3 | 1024-dim multilingual embeddings |
| Crawl4AI | AI-native web scraping (job portals) |
| Microsoft GraphRAG | Community detection on knowledge graph |
| PyMuPDF + python-docx | Resume parsing (PDF & DOCX) |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| PostgreSQL 16 + pgvector | Structured data + vector similarity search |
| Neo4j 5 (Community) | Knowledge graph (skills → courses → jobs → sectors) |
| Redis 7 | API caching + ARQ background task queue |
| Docker Compose | Local development orchestration |
| Supabase | Auth + file storage |

---

## 📁 Project Structure

```
vidyavani/
├── frontend/                    # Next.js 16 application
│   ├── app/                     # App Router pages
│   │   ├── chat/                # AI career advisor
│   │   ├── compare/             # Career comparison
│   │   ├── dashboard/           # Gap analysis dashboard
│   │   ├── discover/            # Skill discovery
│   │   ├── jobs/                # Job board
│   │   ├── onboarding/          # User onboarding flow
│   │   ├── roadmap/             # Personalized learning roadmap
│   │   └── page.tsx             # Landing page
│   ├── components/              # Reusable UI components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   └── layout/              # Navbar, layout components
│   └── lib/                     # Utilities & API client
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/v1/              # API route handlers
│   │   │   ├── resume.py        # Resume upload & analysis
│   │   │   ├── skills.py        # Skill matching (pgvector)
│   │   │   ├── careers.py       # Career paths & comparison
│   │   │   ├── roadmap.py       # AI roadmap generation (SSE)
│   │   │   ├── dashboard.py     # Analytics & gap data
│   │   │   ├── graph.py         # Knowledge graph queries
│   │   │   ├── chat.py          # AI chat streaming (SSE)
│   │   │   ├── jobs.py          # Job listings
│   │   │   └── feedback.py      # User feedback
│   │   ├── agents/              # LangGraph agent definitions
│   │   ├── core/                # Config, database, settings
│   │   ├── schemas/             # Pydantic request/response models
│   │   └── services/            # Business logic & external services
│   └── requirements.txt
│
├── database/                    # Database initialization
│   ├── schema.sql               # PostgreSQL schema + pgvector setup
│   └── seed_data.sql            # Initial seed data (NSQF courses, skills)
│
├── docker-compose.yml           # Development infrastructure
└── README.md
```

---

## 🔧 Environment Variables

The backend requires a `.env` file. Copy from the template and fill in your keys:

```bash
cp backend/.env.example backend/.env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | Free at [console.groq.com](https://console.groq.com) |
| `GEMINI_API_KEY` | Optional | Fallback LLM — [aistudio.google.com](https://aistudio.google.com) |
| `NEO4J_PASSWORD` | ✅ | Default: `vidyavani_neo4j` (matches docker-compose) |
| `SUPABASE_URL` | Optional | For auth & storage features |
| `SUPABASE_ANON_KEY` | Optional | For auth & storage features |

See [`backend/.env.example`](backend/.env.example) for the full list.

---

## 🧪 Running Tests

```bash
cd backend
source .venv/bin/activate

# Run all tests
pytest

# Run with verbose output
pytest -v
```

---

## 👥 Team

**Team Fantastic Six** — Smart India Hackathon 2026

---

## 📜 License

This project was built for **Smart India Hackathon 2026**. All rights reserved by Team Fantastic Six.
