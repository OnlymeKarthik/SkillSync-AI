/**
 * Vidyavani — TypeScript Types
 * Single source of truth for all API response shapes.
 */

// =============================================================================
// Dashboard
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
  Government: number;
}

export interface GapAnalysisResponse {
  chart_data: SkillGapChartItem[];
  period: string;
  categories: string[];
  sector_filter: string;
}

// =============================================================================
// Skill Gap Summary (from /skills/gap-summary)
// =============================================================================

export interface SkillGapSummaryItem {
  skill_name: string;
  total_demand: number;
  peak_demand_percent: number;
  sector_type: string;
}

export interface SkillGapSummaryResponse {
  sector_type: string;
  period: string;
  gaps: SkillGapSummaryItem[];
}

// =============================================================================
// Skills Match
// =============================================================================

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

// =============================================================================
// Resume
// =============================================================================

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

// =============================================================================
// Careers
// =============================================================================

export interface Career {
  id: string;
  slug: string;
  title: string;
  domain: string;
  description?: string | null;
  difficulty?: "beginner" | "intermediate" | "advanced" | null;
  avg_salary_min?: number | null;
  avg_salary_max?: number | null;
  growth_rate?: number | null;
  nsqf_levels?: number[] | null;
  match_score?: number;
  top_skills?: string[] | null;
  required_skills?: Array<{ skill: string; importance: number }> | null;
  embedding?: null;
  created_at?: string;
}

export interface CareerRecommendation extends Career {
  skill_similarity: number;
  match_score: number;
}

// =============================================================================
// Jobs
// =============================================================================

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
}

// =============================================================================
// Knowledge Graph
// =============================================================================

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  gap_score: number;
  relationships?: Array<{ type: string; target: string }>;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  count: number;
}

// =============================================================================
// Roadmap
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

export interface RoadmapGenerateRequest {
  target_career_slug: string;
  current_skills: string[];
  track_preference: "free" | "paid" | "hybrid";
  timeline_weeks: number;
  experience_level: "beginner" | "intermediate" | "advanced";
  user_id?: string;
}

// =============================================================================
// Chat
// =============================================================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  current_skills?: string[];
}

// =============================================================================
// Feedback
// =============================================================================

export interface FeedbackRequest {
  name?: string;
  email?: string;
  category: "bug" | "suggestion" | "general" | "data-error";
  message: string;
}

// =============================================================================
// Filter Types
// =============================================================================

export type SectorFilter = "all" | "PRIVATE" | "GOVERNMENT";
export type TrackPreference = "free" | "paid" | "hybrid";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// =============================================================================
// API state
// =============================================================================

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
