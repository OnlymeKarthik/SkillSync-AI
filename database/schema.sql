-- =============================================================================
-- Vidyavani — PostgreSQL Schema
-- Requires: pgvector extension (pre-installed in pgvector/pgvector:pg16 image)
-- =============================================================================

-- Enable the pgvector extension for semantic similarity search
CREATE EXTENSION IF NOT EXISTS vector;
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SECTION 1: NSQF CURRICULUM DATA
-- =============================================================================

-- Sector Skill Councils (e.g., NASSCOM SSC for IT, HSSC for Healthcare)
CREATE TABLE nsqf_sectors (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(20)  UNIQUE NOT NULL,   -- e.g., "IT-ITES", "HEALTHCARE"
    name        TEXT         NOT NULL,            -- e.g., "IT/Information Technology"
    description TEXT,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- NSQF-certified courses (e.g., "Junior Software Developer" at Level 5)
CREATE TABLE nsqf_courses (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector_id     UUID REFERENCES nsqf_sectors(id) ON DELETE CASCADE,
    code          VARCHAR(50)  UNIQUE NOT NULL,   -- Official NSQF course code
    name          TEXT         NOT NULL,
    nsqf_level    SMALLINT     NOT NULL CHECK (nsqf_level BETWEEN 1 AND 10),
    duration_hrs  INTEGER,                         -- Total training hours
    description   TEXT,
    source_url    TEXT,                            -- Link to official NSQF document
    created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- Individual skills taught within each course (with vector embeddings)
CREATE TABLE curriculum_skills (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id   UUID     REFERENCES nsqf_courses(id) ON DELETE CASCADE,
    name        TEXT     NOT NULL,                  -- e.g., "Basic Python Programming"
    category    TEXT,                               -- e.g., "Programming", "Soft Skills"
    description TEXT,
    -- BAAI/bge-m3 produces 1024-dimensional embeddings
    embedding   VECTOR(1024),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECTION 2: JOB MARKET DATA
-- =============================================================================

-- Raw job postings scraped from Naukri, LinkedIn, NCS, SSC, UPSC etc.
CREATE TABLE job_postings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source          TEXT         NOT NULL,   -- "naukri", "linkedin", "ncs", "ssc", "upsc"
    sector_type     TEXT         NOT NULL,   -- "PRIVATE" or "GOVERNMENT"
    external_id     TEXT,                    -- Original job ID from the source platform
    title           TEXT         NOT NULL,
    company         TEXT,
    location        TEXT,
    state           TEXT,                    -- Indian state for filtering
    salary_min      INTEGER,                 -- Monthly salary in INR
    salary_max      INTEGER,
    experience_min  SMALLINT,               -- Min years of experience
    experience_max  SMALLINT,
    raw_description TEXT,                   -- Full JD text (used for NER)
    url             TEXT,
    posted_at       TIMESTAMPTZ,
    scraped_at      TIMESTAMPTZ DEFAULT NOW(),
    is_processed    BOOLEAN     DEFAULT FALSE  -- Flag: NER extraction done?
);

-- Skills extracted from job postings via spaCy + Groq NER pipeline
CREATE TABLE extracted_skills (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id          UUID     REFERENCES job_postings(id) ON DELETE CASCADE,
    name            TEXT     NOT NULL,               -- Normalized skill name
    raw_text        TEXT,                             -- Original text from JD
    confidence      FLOAT    DEFAULT 1.0,             -- NER confidence score
    -- Vector embedding for semantic similarity matching
    embedding       VECTOR(1024),
    extracted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated skill demand (computed daily via background job)
CREATE TABLE skill_demand_stats (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name      TEXT         NOT NULL,
    sector_type     TEXT         NOT NULL,   -- "PRIVATE", "GOVERNMENT", or "BOTH"
    demand_count    INTEGER      DEFAULT 0,  -- How many job postings mention this skill
    demand_percent  FLOAT,                   -- % of total postings in this sector
    period_date     DATE         NOT NULL,   -- Which day this stat covers
    updated_at      TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (skill_name, sector_type, period_date)
);

-- =============================================================================
-- SECTION 3: CAREER INTELLIGENCE
-- =============================================================================

-- Career roles with metadata (e.g., "Data Engineer", "Cloud Architect")
CREATE TABLE careers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            TEXT         UNIQUE NOT NULL,   -- e.g., "data-engineer"
    title           TEXT         NOT NULL,
    domain          TEXT         NOT NULL,           -- e.g., "Data & AI", "DevOps"
    description     TEXT,
    difficulty      TEXT         CHECK (difficulty IN ('beginner','intermediate','advanced')),
    avg_salary_min  INTEGER,                          -- Monthly INR
    avg_salary_max  INTEGER,
    growth_rate     FLOAT,                            -- Annual % growth in job postings
    -- Which NSQF levels are relevant for entry into this career
    nsqf_levels     SMALLINT[],
    embedding       VECTOR(1024),
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- Many-to-many: which skills are required for a career (with importance weight)
CREATE TABLE career_skills (
    career_id   UUID     REFERENCES careers(id) ON DELETE CASCADE,
    skill_name  TEXT     NOT NULL,
    importance  FLOAT    DEFAULT 1.0,   -- 1.0 = required, 0.5 = nice-to-have
    PRIMARY KEY (career_id, skill_name)
);

-- =============================================================================
-- SECTION 4: USER DATA
-- =============================================================================

-- User profiles (auth handled by Supabase, we store extended data here)
CREATE TABLE user_profiles (
    id              UUID PRIMARY KEY,              -- Matches Supabase auth.users.id
    full_name       TEXT,
    email           TEXT         UNIQUE NOT NULL,
    education_level TEXT,                          -- e.g., "NSQF Level 4", "B.Tech"
    domain          TEXT,                          -- User's field of study/work
    experience_yrs  SMALLINT     DEFAULT 0,
    location        TEXT,
    state           TEXT,
    -- Extracted from resume — stored as JSON array of skill names
    resume_skills   JSONB        DEFAULT '[]',
    resume_url      TEXT,                          -- Supabase Storage path
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- User's saved/favourite careers and roadmaps
CREATE TABLE user_saved_careers (
    user_id    UUID  REFERENCES user_profiles(id) ON DELETE CASCADE,
    career_id  UUID  REFERENCES careers(id) ON DELETE CASCADE,
    saved_at   TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, career_id)
);

-- Generated roadmaps persisted per user + target career
CREATE TABLE user_roadmaps (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID   REFERENCES user_profiles(id) ON DELETE CASCADE,
    career_id   UUID   REFERENCES careers(id),
    title       TEXT   NOT NULL,
    content     JSONB  NOT NULL,   -- Full roadmap as structured JSON
    track       TEXT   CHECK (track IN ('free', 'paid', 'hybrid')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECTION 5: FEEDBACK
-- =============================================================================

CREATE TABLE feedback (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID   REFERENCES user_profiles(id) ON DELETE SET NULL,
    name        TEXT,
    email       TEXT,
    category    TEXT   CHECK (category IN ('bug', 'suggestion', 'general', 'data-error')),
    message     TEXT   NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECTION 6: VECTOR INDEXES (for fast cosine similarity search)
-- =============================================================================

-- Index for matching job skills against curriculum skills
CREATE INDEX idx_curriculum_skills_embedding
    ON curriculum_skills USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Index for matching extracted job skills
CREATE INDEX idx_extracted_skills_embedding
    ON extracted_skills USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Index for career semantic search
CREATE INDEX idx_careers_embedding
    ON careers USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);

-- =============================================================================
-- SECTION 7: STANDARD INDEXES
-- =============================================================================

CREATE INDEX idx_job_postings_sector_type   ON job_postings(sector_type);
CREATE INDEX idx_job_postings_source        ON job_postings(source);
CREATE INDEX idx_job_postings_state         ON job_postings(state);
CREATE INDEX idx_job_postings_is_processed  ON job_postings(is_processed);
CREATE INDEX idx_extracted_skills_job_id    ON extracted_skills(job_id);
CREATE INDEX idx_skill_demand_period        ON skill_demand_stats(period_date);
CREATE INDEX idx_curriculum_skills_course   ON curriculum_skills(course_id);
CREATE INDEX idx_careers_domain             ON careers(domain);
CREATE INDEX idx_careers_difficulty         ON careers(difficulty);

-- =============================================================================
-- SECTION 8: HELPER FUNCTION — Cosine similarity skill gap search
-- =============================================================================

-- Given a query embedding, returns top-N closest curriculum skills.
-- Called by the /skills/match FastAPI endpoint.
CREATE OR REPLACE FUNCTION match_curriculum_skills(
    query_embedding  VECTOR(1024),
    match_threshold  FLOAT   DEFAULT 0.7,
    match_count      INTEGER DEFAULT 5
)
RETURNS TABLE (
    skill_id         UUID,
    skill_name       TEXT,
    course_name      TEXT,
    nsqf_level       SMALLINT,
    similarity_score FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        cs.id                                        AS skill_id,
        cs.name                                      AS skill_name,
        nc.name                                      AS course_name,
        nc.nsqf_level                                AS nsqf_level,
        1 - (cs.embedding <=> query_embedding)       AS similarity_score
    FROM curriculum_skills cs
    JOIN nsqf_courses nc ON cs.course_id = nc.id
    WHERE cs.embedding IS NOT NULL
      AND 1 - (cs.embedding <=> query_embedding) >= match_threshold
    ORDER BY cs.embedding <=> query_embedding   -- ASC = most similar first
    LIMIT match_count;
$$;
