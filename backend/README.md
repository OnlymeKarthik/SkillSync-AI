# Vidyavani — Backend API

> FastAPI-powered backend for the Vidyavani career intelligence platform.
> Built for Smart India Hackathon 2026 | Team: Fantastic Six

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (Python 3.12) |
| Agent Orchestration | LangGraph |
| LLM Primary | Groq — Llama 3.3 70B |
| LLM Fallback | Ollama — Llama 3.2 3B (offline) |
| Embeddings | BAAI/bge-m3 (1024-dim) |
| NER | spaCy + Groq |
| Graph DB | Neo4j 5 |
| Vector Search | pgvector on PostgreSQL 16 |
| Cache / Queue | Redis + ARQ |
| Resume Parsing | PyMuPDF + python-docx |
| Web Scraping | Crawl4AI |

---

## Setup

### 1. Prerequisites
- Python 3.12+
- Docker Desktop (for PostgreSQL + Neo4j + Redis)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 2. Start Infrastructure
```bash
# From the project root (sih2026/)
docker-compose up -d
```
This starts:
- **PostgreSQL + pgvector** on `:5432`
- **Neo4j** browser UI on `:7474` · bolt on `:7687`
- **Redis** on `:6379`
- **pgAdmin** UI on `:5050`

### 3. Python Environment
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

### 4. Environment Variables
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Then open `.env` and fill in at minimum:
```env
GROQ_API_KEY=your_key_here
NEO4J_PASSWORD=vidyavani_neo4j   # matches docker-compose.yml
```

### 5. Run the Server
```bash
uvicorn app.main:app --reload --port 8000
```

---

## API Docs

Once running, open:
- **Swagger UI** → [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc** → [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health check** → [http://localhost:8000/health](http://localhost:8000/health)

---

## API Endpoints

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/resume/upload` | Upload PDF/DOCX → AI skill extraction |
| `GET`  | `/api/v1/resume/analyze/{session_id}` | Career match score |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/skills/match` | Cosine similarity skill match (pgvector) |
| `POST` | `/api/v1/skills/match-batch` | Batch skill matching |
| `GET`  | `/api/v1/skills/gap-summary` | Top skill gaps |

### Careers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v1/careers/` | List & filter careers |
| `GET`  | `/api/v1/careers/{slug}` | Career details + required skills |
| `GET`  | `/api/v1/careers/compare` | Side-by-side comparison |
| `POST` | `/api/v1/careers/recommend` | AI career recommendations |

### Roadmap
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/roadmap/generate` | Streaming AI roadmap (SSE) |
| `GET`  | `/api/v1/roadmap/{id}` | Retrieve saved roadmap |
| `GET`  | `/api/v1/roadmap/user/{user_id}` | User's saved roadmaps |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v1/dashboard/gap-analysis` | Chart data (Private vs Govt) |
| `GET`  | `/api/v1/dashboard/stats` | KPI headline numbers |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v1/jobs/` | Job board with filters |

### Knowledge Graph
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v1/graph/nodes` | Nodes + edges for D3.js |
| `GET`  | `/api/v1/graph/path` | Skill path to target career |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/chat/stream` | Streaming career advisor (SSE) |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/feedback/` | Submit user feedback |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI entry point
│   ├── core/
│   │   ├── config.py            # Settings (pydantic-settings)
│   │   └── database.py          # Async DB connections
│   ├── agents/
│   │   ├── roadmap_agent.py     # LangGraph roadmap generation
│   │   └── career_agent.py      # Career advisor chatbot
│   ├── services/
│   │   ├── embedding.py         # BAAI/bge-m3 embeddings
│   │   └── resume_parser.py     # PDF/DOCX → skill extraction
│   └── api/v1/
│       ├── skills.py            # ⭐ Core pgvector skill match
│       ├── resume.py            # Resume upload & analysis
│       ├── careers.py           # Career discovery & compare
│       ├── roadmap.py           # Streaming roadmap generator
│       ├── dashboard.py         # Gap analysis chart data
│       ├── jobs.py              # Job board
│       └── chat_graph_feedback.py  # Chat + Graph + Feedback
├── .env.example                 # Environment template
└── requirements.txt             # All Python dependencies
```

---

## LLM Fallback Chain

```
Groq API (Llama 3.3 70B) — fast, free tier
    ↓ if timeout / unavailable
Gemini API (gemini-1.5-flash)
    ↓ if unavailable
Ollama (Llama 3.2 3B) — fully offline, runs on laptop
```

To use offline mode, install Ollama and pull the model:
```bash
# Install from https://ollama.com
ollama pull llama3.2:3b
```

---

## Demo Day Tips

| Risk | How We Handle It |
|------|-----------------|
| Groq API slow | Ollama local fallback auto-activates |
| No internet | Full offline: Ollama + local Neo4j + cached jobs |
| DB cold start | Pre-warm with `docker-compose up -d` 15 mins before |
| Large graph freeze | `/graph/nodes?limit=50` caps rendered nodes |
