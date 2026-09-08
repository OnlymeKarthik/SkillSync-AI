/**
 * Vidyavani — API Client
 * All backend calls go through this layer.
 * Base URL: NEXT_PUBLIC_API_URL (default: http://localhost:8000/api/v1)
 */

import type {
  DashboardStats,
  GapAnalysisResponse,
  SkillGapSummaryResponse,
  SkillMatchResponse,
  ResumeAnalysis,
  CareerScore,
  Career,
  CareerRecommendation,
  JobPosting,
  GraphData,
  FeedbackRequest,
  RoadmapGenerateRequest,
  SectorFilter,
} from "./types";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError("Network error — is the backend running?", 0);
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(detail, res.status, detail);
  }

  return res.json() as Promise<T>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () => apiFetch<DashboardStats>("/dashboard/stats"),

  getGapAnalysis: (sector: SectorFilter = "all", limit = 15) =>
    apiFetch<GapAnalysisResponse>(
      `/dashboard/gap-analysis?sector=${sector}&limit=${limit}`
    ),
};

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skillsApi = {
  match: (skill: string, threshold = 0.65, topK = 5) =>
    apiFetch<SkillMatchResponse>("/skills/match", {
      method: "POST",
      body: JSON.stringify({ skill, match_threshold: threshold, top_k: topK }),
    }),

  gapSummary: (sectorType: SectorFilter = "all", limit = 15) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (sectorType !== "all") params.set("sector_type", sectorType);
    return apiFetch<SkillGapSummaryResponse>(`/skills/gap-summary?${params}`);
  },
};

// ─── Careers ──────────────────────────────────────────────────────────────────

export const careersApi = {
  list: (params?: {
    domain?: string;
    difficulty?: string;
    salary_min?: number;
    growth_rate_min?: number;
    page?: number;
    page_size?: number;
  }) => {
    const query = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined && v !== "")
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

  recommend: (
    skills: string[],
    educationLevel?: string,
    interests?: string[]
  ) =>
    apiFetch<{ recommendations: CareerRecommendation[] }>("/careers/recommend", {
      method: "POST",
      body: JSON.stringify({
        current_skills: skills,
        education_level: educationLevel,
        interests: interests ?? [],
      }),
    }),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: (params?: {
    sector_type?: SectorFilter;
    state?: string;
    domain?: string;
    salary_min?: number;
    page?: number;
    page_size?: number;
  }) => {
    const query = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined && v !== "" && v !== "all")
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return apiFetch<{ jobs: JobPosting[]; page: number }>(
      `/jobs/${query ? `?${query}` : ""}`
    );
  },
};

// ─── Resume ───────────────────────────────────────────────────────────────────

export const resumeApi = {
  upload: async (file: File, targetCareer?: string): Promise<ResumeAnalysis> => {
    const formData = new FormData();
    formData.append("file", file);
    if (targetCareer) formData.append("target_career", targetCareer);

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/resume/upload`, {
        method: "POST",
        body: formData,
      });
    } catch {
      throw new ApiError("Network error — is the backend running?", 0);
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        detail = body.detail ?? detail;
      } catch {
        // ignore
      }
      throw new ApiError(detail, res.status);
    }
    return res.json();
  },

  scoreAgainstCareer: (sessionId: string, careerSlug: string) =>
    apiFetch<CareerScore>(
      `/resume/analyze/${sessionId}?career_slug=${careerSlug}`
    ),
};

// ─── Graph ────────────────────────────────────────────────────────────────────

export const graphApi = {
  getNodes: (careerSlug?: string, limit = 60) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (careerSlug) params.set("career_slug", careerSlug);
    return apiFetch<GraphData>(`/graph/nodes?${params}`);
  },

  getPath: (fromSkills: string[], toCareer: string) =>
    apiFetch<{ missing_skills: unknown[]; from_skills: string[]; to_career: string }>(
      `/graph/path?from_skills=${fromSkills.join(",")}&to_career=${toCareer}`
    ),
};

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const feedbackApi = {
  submit: (data: FeedbackRequest) =>
    apiFetch<{ status: string; message: string }>("/feedback/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Streaming helpers ────────────────────────────────────────────────────────

/**
 * Stream SSE from the chat endpoint.
 * Each SSE data line contains: {"token": "...", "done": false} or {"token": "", "done": true}
 */
export async function* streamChat(
  message: string,
  history: Array<{ role: string; content: string }>,
  currentSkills: string[] = []
): AsyncGenerator<string, void, unknown> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        current_skills: currentSkills,
      }),
    });
  } catch {
    throw new ApiError("Network error — is the backend running?", 0);
  }

  if (!res.ok || !res.body) {
    throw new ApiError(`Chat stream error: HTTP ${res.status}`, res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const payload = line.slice(6).trim();
        if (!payload) continue;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.done) return;
          if (parsed.token) yield parsed.token;
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

/**
 * Stream SSE from the roadmap endpoint.
 * Accumulates chunks, then yields the final parsed stages array.
 */
export async function* streamRoadmap(
  request: RoadmapGenerateRequest
): AsyncGenerator<{ chunk?: string; done?: boolean; stages?: unknown[]; error?: string }, void, unknown> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiError("Network error — is the backend running?", 0);
  }

  if (!res.ok || !res.body) {
    throw new ApiError(`Roadmap stream error: HTTP ${res.status}`, res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const payload = line.slice(6).trim();
        if (!payload) continue;
        try {
          const parsed = JSON.parse(payload);
          yield parsed;
          if (parsed.done) return;
        } catch {
          // skip
        }
      }
    }
  }
}
