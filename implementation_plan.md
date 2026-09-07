# Vidyavani — Final Implementation Plan
### Smart India Hackathon 2026 | Team: Fantastic Six

---

## 🎯 The Motive

India produces **1.5 crore skilled graduates every year** through NSQF-certified courses.
Yet **47% of them remain unemployed within 6 months** of completing their course.

**The root cause is not lack of education — it is a curriculum that doesn't keep pace with industry.**

> A student finishes an NSQF Level 5 IT course in 2025.
> The curriculum was designed in 2021.
> The job market has moved to GenAI, Cloud-Native, and DevOps.
> The student doesn't know what they're missing.
> The employer can't find the talent they need.
> **Both lose. The economy loses.**

**Vidyavani exists to fix this — in real time.**

---

## 🔍 What The System Does

### For Students & Mid-Career Unemployed
```
You tell us:   "I completed NSQF Level 4 IT/ITES course"
We tell you:   "Here is exactly what the job market needs that your course didn't teach"
We show you:   "Here is a step-by-step learning path to close that gap"
We connect you: "Here are real jobs hiring right now for your target role"
```

### For Government & NSQF Bodies
```
We show:  A national-level dashboard of which curricula are most outdated
We prove: Which specific skills are in 70%+ of job postings but 0% of curricula
We enable: Data-driven curriculum update decisions backed by live industry evidence
```

### The System — Under The Hood
```
STEP 1 → INGEST
  Crawl4AI bot scrapes Naukri, LinkedIn, Indeed daily
  Stores raw job descriptions in Supabase

STEP 2 → EXTRACT
  spaCy + Groq LLM reads each JD
  Extracts only the skill entities ("React.js", "Docker", "Prompt Engineering")

STEP 3 → EMBED
  BAAI/bge-m3 converts every skill into a 1024-dimension vector
  Captures meaning, not just keywords ("ML" ≈ "Machine Learning" ≈ "AI/ML")

STEP 4 → BUILD THE KNOWLEDGE GRAPH
  Neo4j stores skills, courses, jobs, sectors as connected nodes
  Relationships: requires → teaches → leads_to → is_gap_for
  Microsoft GraphRAG builds community clusters of related skills

STEP 5 → FIND THE GAP
  Vector similarity: job skill vectors vs curriculum skill vectors
  Graph traversal: "NSQF Level 4 teaches Node A, job needs Node Z — 4 hops missing"
  Output: Ranked list of skill gaps with severity scores

STEP 6 → SHOW & ACT
  Dashboard: Charts showing top demanded vs covered skills
  Chat: AI agent answers "what should I learn next?" using the graph
  Jobs: Real postings matched to the user's target upskilled profile
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LAYER                                   │
│                                                                      │
│  🎓 Student          🔄 Mid-Career Unemployed      🏛️ Govt / NSQF  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      FRONTEND (Next.js 15)                           │
│                                                                      │
│  📊 Gap Dashboard   🕸️ Knowledge Graph   🤖 AI Chat   💼 Jobs      │
│  [Tremor Charts]    [D3.js + React]      [Vercel AI]  [Supabase RT]│
└──────────────────────────────┬──────────────────────────────────────┘
                               │ REST + Streaming
┌──────────────────────────────▼──────────────────────────────────────┐
│                     BACKEND (FastAPI Python 3.12)                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  LangGraph Supervisor Agent                   │   │
│  └──────┬──────────────┬──────────────┬────────────────────────┘   │
│         │              │              │                              │
│  ┌──────▼──┐   ┌───────▼──┐   ┌──────▼──────┐                     │
│  │ Scraper │   │   Gap     │   │   Career    │                     │
│  │  Agent  │   │  Analyst  │   │   Advisor   │                     │
│  │Crawl4AI │   │  Agent    │   │    Agent    │                     │
│  └──────┬──┘   └───────┬──┘   └──────┬──────┘                     │
│         │              │              │                              │
│  ┌──────▼──┐   ┌───────▼──┐   ┌──────▼──────┐                     │
│  │ spaCy + │   │  bge-m3  │   │ LlamaIndex  │                     │
│  │  Groq   │   │Embeddings│   │ (PDF RAG)   │                     │
│  │  NER    │   │          │   │             │                     │
│  └─────────┘   └──────────┘   └─────────────┘                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                         DATA LAYER                                   │
│                                                                      │
│  🕸️ Neo4j              📐 pgvector          ⚡ Redis               │
│  Knowledge Graph        Vector Similarity    Cache + Job Queue       │
│  Skills─Jobs─Courses    Semantic Search      Background Tasks        │
│                                                                      │
│  ☁️ Supabase                                                        │
│  PostgreSQL + Auth + Realtime + File Storage (NSQF PDFs)            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 The 5 Core Features (MVP)

### Feature 1 — 📊 Skill Gap Dashboard
**What:** Visual bar charts comparing top demanded skills vs curriculum coverage  
**Data:** Real NSQF data from NASSCOM SSC PDFs + cached Naukri job data  
**Tech:** Tremor BarChart + FastAPI `/gap-analysis` endpoint + pgvector cosine search  

### Feature 2 — 🕸️ Knowledge Graph Explorer
**What:** Interactive visual map of skills, their relationships, and gaps  
**Data:** Neo4j graph populated from NSQF curricula + job postings  
**Tech:** D3.js force-directed graph + React Force Graph + Neo4j Cypher queries  
**Wow factor:** User clicks a skill node → sees prerequisites, related jobs, gap severity  

### Feature 3 — 🤖 GraphRAG Career Advisor Chat
**What:** AI chat that answers "what should I learn to become a Data Engineer?"  
**How it works:** LangGraph agent → queries Neo4j knowledge graph → Groq LLM narrates  
**Offline fallback:** Ollama (Llama 3.2 3B) if internet is down at demo  
**Example conversation:**  
```
User: "I know Python and SQL. I want to be a Data Engineer."
AI:   "You're 40% there. The graph shows you need:
       1. Apache Spark (used in 78% of Data Engineer JDs)
       2. dbt (used in 61% of JDs)
       3. Airflow (used in 55% of JDs)
       Here are 3 free courses and 12 live job openings."
```

### Feature 4 — 📄 NSQF PDF Auto-Parser
**What:** Upload any NSQF curriculum PDF → AI extracts all skills automatically  
**Tech:** LlamaIndex + bge-m3 embeddings + PyMuPDF  
**Why it matters:** Zero manual data entry. Govt can upload new curriculum → system updates instantly  

### Feature 5 — 💼 Live Job Board
**What:** Real job postings filtered by the user's target role + location  
**Data:** Pre-scraped via Crawl4AI, stored in Supabase, updates via Realtime  
**Demo safety:** Data is pre-cached — no live scraping risk during presentation  

---

## 🔧 Tech Stack (Final & Locked)

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, Tailwind CSS v4, shadcn/ui, Tremor, D3.js, Framer Motion, Vercel AI SDK |
| **Backend** | FastAPI (Python 3.12), LangGraph, ARQ task queue |
| **LLM Primary** | Groq API — Llama 3.3 70B |
| **LLM Fallback** | Ollama — Llama 3.2 3B (runs locally, no internet) |
| **Embeddings** | BAAI/bge-m3 (1024-dim, multilingual) |
| **GraphRAG** | Microsoft GraphRAG |
| **NER** | spaCy + Groq hybrid |
| **RAG** | LlamaIndex |
| **Scraping** | Crawl4AI |
| **Graph DB** | Neo4j (local Docker) |
| **Vector DB** | pgvector on PostgreSQL |
| **Cache/Queue** | Redis |
| **BaaS** | Supabase (Auth + Realtime + Storage) |
| **Dev Infra** | Docker Compose |
| **Package Mgmt** | pnpm (JS) + uv (Python) |

---

## 📁 Folder Structure

```
sih2026/
├── frontend/                     # Next.js 15
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing + role selector
│   │   ├── dashboard/page.tsx    # Skill gap charts
│   │   ├── graph/page.tsx        # Knowledge graph explorer
│   │   ├── chat/page.tsx         # AI career advisor
│   │   ├── jobs/page.tsx         # Job board
│   │   └── admin/page.tsx        # Govt panel
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── SkillGapChart.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   └── SectorSelector.tsx
│   │   ├── graph/
│   │   │   └── KnowledgeGraphViewer.tsx
│   │   ├── chat/
│   │   │   └── CareerChatbot.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   └── lib/
│       ├── api.ts                # Typed API client
│       └── types.ts              # Shared TypeScript types
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py         # Settings (pydantic-settings)
│   │   │   └── database.py       # Async DB connections
│   │   ├── agents/
│   │   │   ├── supervisor.py     # LangGraph supervisor
│   │   │   ├── scraper_agent.py  # Crawl4AI agent
│   │   │   ├── gap_agent.py      # Gap analysis agent
│   │   │   └── career_agent.py   # Career advisor agent
│   │   ├── services/
│   │   │   ├── embedding.py      # bge-m3 service
│   │   │   ├── nlp.py            # spaCy + Groq NER
│   │   │   ├── graph_rag.py      # Neo4j + GraphRAG
│   │   │   └── pdf_parser.py     # LlamaIndex PDF RAG
│   │   ├── models/               # SQLAlchemy ORM
│   │   ├── schemas/              # Pydantic v2 schemas
│   │   └── api/v1/
│   │       ├── skills.py         # /skills/match endpoint
│   │       ├── dashboard.py      # /dashboard/gap-analysis
│   │       ├── graph.py          # /graph/nodes + /graph/path
│   │       ├── chat.py           # /chat/stream (SSE)
│   │       └── jobs.py           # /jobs/ listing
│   └── requirements.txt
│
├── database/
│   ├── schema.sql                # PostgreSQL + pgvector schema
│   └── seed_data.sql             # Real NSQF IT/ITES data
│
├── data/
│   └── nsqf_pdfs/               # Raw NSQF curriculum PDFs
│
└── docker-compose.yml            # Neo4j + PostgreSQL + Redis
```

---

## 🗺️ Build Order (What We Build First → Last)

```
Week 1 — Foundation
  Day 1: Docker setup → Neo4j + PostgreSQL + Redis running
  Day 2: NSQF real data ingestion (PDF parser + Neo4j population)
  Day 3: FastAPI skeleton + all endpoints returning mock data
  Day 4: Embedding service (bge-m3) + pgvector cosine search working
  Day 5: LangGraph agents wired up (scraper + gap analyst)

Week 2 — Intelligence
  Day 6: GraphRAG pipeline on Neo4j knowledge graph
  Day 7: Career advisor chat (streaming via Groq + Ollama fallback)
  Day 8: Frontend dashboard + Tremor charts connected to real API
  Day 9: Knowledge graph D3.js visualization
  Day 10: Job board + Supabase realtime

Week 3 — Polish & Demo Prep
  Day 11: Pre-cache all scraping data
  Day 12: Offline fallback testing (Ollama + cached data)
  Day 13: UI animations + Framer Motion polish
  Day 14: End-to-end demo rehearsal + load testing
```

---

## ✅ Demo Day Checklist (Risk Mitigation)

| Risk | Mitigation |
|------|-----------|
| Neo4j cold start slow | Pre-warm 15 mins before, graph tab kept open |
| Scraper blocked | All data pre-cached, fake progress bar for effect |
| Groq API timeout | Ollama local fallback, auto-switches in <2s |
| Graph viz freezes | Max 50 nodes rendered, filter by sector |
| No internet at venue | Full offline mode: Ollama + local Neo4j + cached data |

---

## 💡 The Unique Selling Point

> **Other skill-gap tools use keyword matching.**
> Vidyavani uses a **Knowledge Graph + GraphRAG** —
> it understands that "you know Python" means you're
> already 40% of the way to "Data Engineering" because
> it can traverse the graph of skill relationships.
>
> **That is the difference between a search engine and an AI.**

---

*Ready to build. Awaiting your approval.* 🚀
