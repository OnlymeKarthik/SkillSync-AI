"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Wand2, Play, ChevronDown, ChevronRight, BookOpen,
  Clock, Star, ExternalLink, GitBranch, Zap, Globe
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface Resource {
  name: string;
  url: string;
  type: "free" | "paid";
  platform: string;
  duration_hrs: number;
}

interface Stage {
  stage: number;
  title: string;
  duration_weeks: number;
  skills: string[];
  description: string;
  resources: Resource[];
  milestone: string;
  is_decision_point: false;
}

interface DecisionPoint {
  stage: number;
  is_decision_point: true;
  question: string;
  options: Array<{ label: string; next_skills: string[] }>;
}

type RoadmapItem = Stage | DecisionPoint;

const TRACK_COLORS = {
  free: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  paid: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const PLATFORM_ICONS: Record<string, string> = {
  SWAYAM: "🇮🇳",
  NPTEL: "🎓",
  YouTube: "▶️",
  Coursera: "🌐",
  Udemy: "💡",
  freeCodeCamp: "🔥",
  edX: "📚",
  "LeetCode": "💻",
};

const DEMO_ROADMAP: RoadmapItem[] = [
  {
    stage: 1,
    title: "Foundation",
    duration_weeks: 4,
    skills: ["Python Basics", "Git & GitHub", "Linux Command Line", "VS Code"],
    description: "Build a solid programming foundation. Master Python syntax, version control, and the developer environment. These skills underpin every career in tech.",
    resources: [
      { name: "Python for Everybody", url: "https://swayam.gov.in", type: "free", platform: "SWAYAM", duration_hrs: 40 },
      { name: "Git & GitHub Crash Course", url: "https://youtube.com", type: "free", platform: "YouTube", duration_hrs: 5 },
      { name: "The Complete Python Bootcamp", url: "https://udemy.com", type: "paid", platform: "Udemy", duration_hrs: 22 },
    ],
    milestone: "Build a Python CLI tool and push it to GitHub",
    is_decision_point: false,
  },
  {
    stage: 2,
    is_decision_point: true,
    question: "What's your primary goal?",
    options: [
      { label: "Web Development (Full Stack)", next_skills: ["React", "Node.js", "PostgreSQL"] },
      { label: "Data & AI (ML/DS)", next_skills: ["Pandas", "NumPy", "Scikit-learn"] },
    ],
  },
  {
    stage: 3,
    title: "Core Skills",
    duration_weeks: 8,
    skills: ["React.js", "Node.js", "REST APIs", "PostgreSQL", "Docker Basics"],
    description: "Learn the core technologies of your chosen path. Build real projects and a portfolio that demonstrates practical capability to employers.",
    resources: [
      { name: "Full Stack Open", url: "https://fullstackopen.com", type: "free", platform: "freeCodeCamp", duration_hrs: 60 },
      { name: "NPTEL: Web Technologies", url: "https://nptel.ac.in", type: "free", platform: "NPTEL", duration_hrs: 30 },
      { name: "The Complete Web Developer", url: "https://udemy.com", type: "paid", platform: "Udemy", duration_hrs: 54 },
    ],
    milestone: "Deploy a full-stack CRUD application with auth",
    is_decision_point: false,
  },
  {
    stage: 4,
    title: "Advanced & Specialisation",
    duration_weeks: 6,
    skills: ["System Design", "Cloud (AWS/GCP)", "CI/CD", "Performance Tuning"],
    description: "Go beyond basics. Learn how senior engineers think — scalability, system design, and production-grade deployment. This stage separates you from juniors.",
    resources: [
      { name: "System Design Primer", url: "https://github.com", type: "free", platform: "YouTube", duration_hrs: 20 },
      { name: "AWS Cloud Practitioner", url: "https://aws.amazon.com", type: "paid", platform: "Coursera", duration_hrs: 15 },
      { name: "DevOps Essentials — NPTEL", url: "https://nptel.ac.in", type: "free", platform: "NPTEL", duration_hrs: 25 },
    ],
    milestone: "Deploy app to AWS with CI/CD pipeline and monitoring",
    is_decision_point: false,
  },
  {
    stage: 5,
    title: "Job-Ready",
    duration_weeks: 3,
    skills: ["Portfolio Polish", "Interview Prep", "Resume Optimisation", "LeetCode 75"],
    description: "Prepare for interviews and land your first role. Focus on your portfolio, DSA practice, and mock interviews. Most candidates skip this — don't.",
    resources: [
      { name: "LeetCode 75 Study Plan", url: "https://leetcode.com", type: "free", platform: "LeetCode", duration_hrs: 30 },
      { name: "Resume Building Workshop", url: "https://swayam.gov.in", type: "free", platform: "SWAYAM", duration_hrs: 5 },
    ],
    milestone: "Apply to 50 jobs with a polished portfolio and 3 mock interviews done",
    is_decision_point: false,
  },
];

function StageCard({ item, index }: { item: RoadmapItem; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  if (item.is_decision_point) {
    return (
      <div className="relative flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center z-10">
            <GitBranch className="w-4 h-4 text-amber-400" />
          </div>
          <div className="w-0.5 flex-1 bg-gradient-to-b from-amber-500/30 to-transparent mt-2" />
        </div>
        <div className="flex-1 pb-8">
          <div className="glass border border-amber-500/20 rounded-2xl p-5">
            <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-2">Decision Point</p>
            <h3 className="text-white font-semibold text-lg mb-4">{item.question}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.options.map((opt, i) => (
                <button key={i} className="text-left p-4 rounded-xl border border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10 transition-all group">
                  <p className="text-white font-medium text-sm mb-2 group-hover:text-violet-300">{opt.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.next_skills.map(s => (
                      <span key={s} className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stage = item as Stage;
  const freeResources = stage.resources.filter(r => r.type === "free");
  const paidResources = stage.resources.filter(r => r.type === "paid");

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center z-10 text-sm font-bold text-violet-300">
          {stage.stage}
        </div>
        {index < DEMO_ROADMAP.length - 1 && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-violet-500/30 to-violet-500/10 mt-2" />
        )}
      </div>

      <div className="flex-1 pb-8">
        <div
          className="glass glass-hover border border-white/8 rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between p-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-semibold">{stage.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {stage.duration_weeks} weeks
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stage.skills.map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-3 ${expanded ? "rotate-180" : ""}`} />
          </div>

          {expanded && (
            <div className="border-t border-white/5 p-5 space-y-5">
              <p className="text-sm text-gray-400 leading-relaxed">{stage.description}</p>

              {/* Resources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {freeResources.length > 0 && (
                  <div>
                    <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider mb-2">Free Track</p>
                    <div className="space-y-2">
                      {freeResources.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-400/5 border border-emerald-400/10 hover:border-emerald-400/30 transition-all group"
                          onClick={e => e.stopPropagation()}>
                          <span className="text-base">{PLATFORM_ICONS[r.platform] ?? "📌"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{r.name}</p>
                            <p className="text-xs text-gray-500">{r.platform} · {r.duration_hrs}h</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-emerald-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {paidResources.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-2">Paid Track</p>
                    <div className="space-y-2">
                      {paidResources.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/10 hover:border-amber-400/30 transition-all group"
                          onClick={e => e.stopPropagation()}>
                          <span className="text-base">{PLATFORM_ICONS[r.platform] ?? "📌"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{r.name}</p>
                            <p className="text-xs text-gray-500">{r.platform} · {r.duration_hrs}h</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-amber-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Milestone */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Star className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-violet-400 font-medium mb-0.5">Stage Milestone</p>
                  <p className="text-xs text-gray-300">{stage.milestone}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoadmapInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [career, setCareer] = useState(searchParams.get("career") || "");
  const [careerTitle, setCareerTitle] = useState(searchParams.get("title") || "");
  const [input, setInput] = useState(career);
  const [roadmap, setRoadmap] = useState<RoadmapItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [track, setTrack] = useState<"free" | "paid" | "hybrid">("hybrid");

  useEffect(() => {
    if (career) generateRoadmap(career);
  }, []);

  const generateRoadmap = async (slug?: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate AI generation
    setRoadmap(DEMO_ROADMAP);
    setLoading(false);
  };

  const handleGenerate = () => {
    if (!input.trim()) return;
    setCareer(input.trim());
    generateRoadmap(input.trim());
  };

  const totalWeeks = DEMO_ROADMAP
    .filter(item => !item.is_decision_point)
    .reduce((acc, item) => acc + (item as Stage).duration_weeks, 0);

  const totalHours = DEMO_ROADMAP
    .filter(item => !item.is_decision_point)
    .flatMap(item => (item as Stage).resources)
    .filter(r => track === "hybrid" || r.type === track)
    .reduce((acc, r) => acc + r.duration_hrs, 0);

  return (
    <div className="min-h-screen bg-[#030712] bg-grid">
      <Navbar />
      <div className="bg-glow-violet fixed inset-0 pointer-events-none" />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            AI <span className="gradient-text">Roadmap</span> Generator
          </h1>
          <p className="text-gray-400">Personalised multi-stage learning paths with free and paid resource tracks.</p>
        </div>

        {/* Generator Input */}
        <div className="glass border border-white/10 rounded-2xl p-5 mb-8">
          <p className="text-sm text-gray-400 mb-3">Enter your target career or skill</p>
          <div className="flex gap-3">
            <input
              id="roadmap-career-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              placeholder="e.g., Full Stack Developer, Data Scientist, DevOps Engineer..."
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
            />
            <button
              id="generate-roadmap"
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 px-5 py-3 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* Track selector */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-gray-500">Resource track:</span>
            {(["free", "paid", "hybrid"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTrack(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                  track === t
                    ? t === "free" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : t === "paid" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-violet-500/20 border-violet-500/40 text-violet-300"
                    : "border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                {t === "free" ? "Free only" : t === "paid" ? "Paid only" : "Hybrid"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Roadmap */}
        {!loading && roadmap && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Duration", value: `${totalWeeks} weeks`, icon: Clock },
                { label: "Learning Hours", value: `~${totalHours}h`, icon: BookOpen },
                { label: "Stages", value: `${roadmap.filter(r => !r.is_decision_point).length}`, icon: Zap },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass rounded-xl p-4 text-center">
                  <Icon className="w-4 h-4 text-violet-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div>
              {roadmap.map((item, i) => (
                <StageCard key={i} item={item} index={i} />
              ))}
            </div>

            {/* CTA */}
            <div className="mt-4 p-5 glass border border-violet-500/20 rounded-2xl text-center">
              <p className="text-white font-semibold mb-1">Ready to start your journey?</p>
              <p className="text-gray-400 text-sm mb-4">Chat with Vidyavani AI for personalised guidance on this roadmap.</p>
              <a href="/chat" className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-400 text-white rounded-xl text-sm font-medium transition-all">
                <Wand2 className="w-4 h-4" /> Talk to AI Advisor
              </a>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !roadmap && (
          <div className="text-center py-20">
            <Wand2 className="w-12 h-12 text-violet-400/30 mx-auto mb-4" />
            <p className="text-gray-500">Enter a career above to generate your personalised roadmap.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RoadmapContent() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>}>
      <RoadmapInner />
    </Suspense>
  );
}
