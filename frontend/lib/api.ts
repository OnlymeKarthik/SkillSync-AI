/**
 * Vidyavani — Typed API Client
 * All API calls to the FastAPI backend go through here.
 * Base URL configured via environment variable.
 */

import type {
  DashboardStats,
  GapAnalysisResponse,
  SkillMatchResponse,
  ResumeAnalysis,
  CareerScore,
  Career,
  JobPosting,
  GraphNode,
  SectorFilter,
  TrackPreference,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `API error: ${res.status}`);
  }
  return res.json();
}

// =============================================================================
// Dashboard
// =============================================================================

export const api = {
  dashboard: {
    getStats: () => apiFetch<DashboardStats>("/dashboard/stats"),

    getGapAnalysis: (sector: SectorFilter = "all", limit = 10) =>
      apiFetch<GapAnalysisResponse>(
        `/dashboard/gap-analysis?sector=${sector}&limit=${limit}`
      ),
  },

  // =============================================================================
  // Skills
  // =============================================================================

  skills: {
    match: (skill: string, threshold = 0.7, topK = 5) =>
      apiFetch<SkillMatchResponse>("/skills/match", {
        method: "POST",
        body: JSON.stringify({ skill, match_threshold: threshold, top_k: topK }),
      }),
  },

  // =============================================================================
  // Resume
  // =============================================================================

  resume: {
    upload: async (file: File, targetCareer?: string): Promise<ResumeAnalysis> => {
      const formData = new FormData();
      formData.append("file", file);
      if (targetCareer) formData.append("target_career", targetCareer);

      const res = await fetch(`${BASE_URL}/resume/upload`, {
        method: "POST",
        body: formData, // No Content-Type header — let browser set multipart boundary
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "Resume upload failed");
      }
      return res.json();
    },

    scoreAgainstCareer: (sessionId: string, careerSlug: string) =>
      apiFetch<CareerScore>(
        `/resume/analyze/${sessionId}?career_slug=${careerSlug}`
      ),
  },

  // =============================================================================
  // Careers
  // =============================================================================

  careers: {
    list: (params?: {
      domain?: string;
      difficulty?: string;
      salary_min?: number;
      page?: number;
    }) => {
      const query = new URLSearchParams(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return apiFetch<{ careers: Career[]; page: number }>(
        `/careers/${query ? `?${query}` : ""}`
      );
    },

    getBySlug: (slug: string) => apiFetch<Career>(`/careers/${slug}`),

    compare: (slugs: string[]) =>
      apiFetch<{ careers: Career[] }>(
        `/careers/compare?slugs=${slugs.join(",")}`
      ),

    recommend: (skills: string[], educationLevel?: string, interests?: string[]) =>
      apiFetch<{ recommendations: Career[] }>("/careers/recommend", {
        method: "POST",
        body: JSON.stringify({
          current_skills: skills,
          education_level: educationLevel,
          interests: interests ?? [],
        }),
      }),
  },

  // =============================================================================
  // Jobs
  // =============================================================================

  jobs: {
    list: (params?: {
      sector_type?: SectorFilter;
      state?: string;
      page?: number;
    }) => {
      const query = new URLSearchParams(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined && v !== "all")
          .map(([k, v]) => [k, String(v)])
      ).toString();
      return apiFetch<{ jobs: JobPosting[]; page: number }>(
        `/jobs/${query ? `?${query}` : ""}`
      );
    },
  },

  // =============================================================================
  // Knowledge Graph
  // =============================================================================

  graph: {
    getNodes: (careerSlug?: string, limit = 50) =>
      apiFetch<{ nodes: GraphNode[]; count: number }>(
        `/graph/nodes?${careerSlug ? `career_slug=${careerSlug}&` : ""}limit=${limit}`
      ),

    getPath: (fromSkills: string[], toCareer: string) =>
      apiFetch<{ missing_skills: any[]; from_skills: string[]; to_career: string }>(
        `/graph/path?from_skills=${fromSkills.join(",")}&to_career=${toCareer}`
      ),
  },

  // =============================================================================
  // Feedback
  // =============================================================================

  feedback: {
    submit: (data: {
      name?: string;
      email?: string;
      category: string;
      message: string;
    }) =>
      apiFetch("/feedback/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
