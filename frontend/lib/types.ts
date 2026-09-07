/**
 * Vidyavani — Shared TypeScript Types
 * Used across all components and API calls.
 */

// =============================================================================
// API Response Types
// =============================================================================

export interface DashboardStats {
  total_jobs_scraped: number;
  total_private_jobs: number;
  total_govt_jobs: number;
  total_curriculum_skills: number;
  total_skill_gaps: number;
  avg_gap_coverage_percent: number;
  last_updated: string;
}

export interface SkillGapChartItem {
  skill: string;
  "Private Sector": number;
  "Government": number;
}

export interface GapAnalysisResponse {
  chart_data: SkillGapChartItem[];
  period: string;
  categories: string[];
}

export interface CurriculumMatch {
  skill_id: string;
  skill_name: string;
  course_name: string;
  nsqf_level: number;
  similarity_score: number;
  is_strong_match: boolean;
}

export interface SkillMatchResponse {
  queried_skill: string;
  matches: CurriculumMatch[];
  is_curriculum_gap: boolean;
  gap_severity: "none" | "low" | "medium" | "high";
}

export interface ExtractedSkill {
  name: string;
  category: string;
  confidence: number;
  level: "beginner" | "intermediate" | "advanced" | null;
}

export interface ResumeAnalysis {
  session_id: string;
  candidate_name: string | null;
  education_level: string | null;
  domain: string | null;
  years_of_experience: number | null;
  extracted_skills: ExtractedSkill[];
  skill_count: number;
  resume_summary: string;
}

export interface CareerScore {
  career_slug: string;
  career_title: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  partially_matched: string[];
  estimated_salary_current: string;
  estimated_salary_upskilled: string;
  readiness_label: "Ready" | "Almost There" | "Needs Work";
}

export interface Career {
  id: string;
  slug: string;
  title: string;
  domain: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  avg_salary_min: number;
  avg_salary_max: number;
  growth_rate: number;
  nsqf_levels: number[];
  match_score?: number;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  state: string | null;
  sector_type: "PRIVATE" | "GOVERNMENT";
  source: string;
  salary_min: number | null;
  salary_max: number | null;
  experience_min: number | null;
  experience_max: number | null;
  url: string | null;
  posted_at: string | null;
  required_skills?: string[];
  nsqf_level?: number;
  description?: string;
}

// =============================================================================
// Knowledge Graph Types (for D3.js visualization)
// =============================================================================

export interface GraphNode {
  id: string;
  label: string;
  group: string;       // Category — used for coloring
  gap_score: number;   // 0–1, used for node size
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: "PREREQUISITE_OF" | "REQUIRED_BY" | "TAUGHT_BY";
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// =============================================================================
// Roadmap Types
// =============================================================================

export interface RoadmapResource {
  name: string;
  url: string;
  type: "free" | "paid";
  platform: string;
  duration_hrs: number;
}

export interface RoadmapStage {
  stage: number;
  title: string;
  duration_weeks: number;
  skills: string[];
  description: string;
  resources: RoadmapResource[];
  milestone: string;
  is_decision_point: false;
}

export interface RoadmapDecision {
  stage: number;
  is_decision_point: true;
  question: string;
  options: Array<{ label: string; next_skills: string[] }>;
}

export type RoadmapItem = RoadmapStage | RoadmapDecision;

// =============================================================================
// UI State Types
// =============================================================================

export type SectorFilter = "all" | "PRIVATE" | "GOVERNMENT";
export type TrackPreference = "free" | "paid" | "hybrid";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
