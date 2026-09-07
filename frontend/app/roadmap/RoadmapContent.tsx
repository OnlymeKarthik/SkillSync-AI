"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wand2, Play, ChevronDown, ChevronRight, BookOpen,
  Clock, Star, ExternalLink, GitBranch, Zap, Globe, Map
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

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
    title: "Core Competencies",
    duration_weeks: 6,
    skills: ["Data Structures & Algorithms", "SQL & Databases", "REST APIs", "FastAPI / Flask"],
    description: "Learn to design APIs, query relational databases, and write efficient algorithms. This stage bridges basic coding to production-ready engineering.",
    resources: [
      { name: "Database Management Systems", url: "https://nptel.ac.in", type: "free", platform: "NPTEL", duration_hrs: 30 },
      { name: "FastAPI Full Course", url: "https://youtube.com", type: "free", platform: "YouTube", duration_hrs: 6 },
      { name: "Master the Coding Interview", url: "https://udemy.com", type: "paid", platform: "Udemy", duration_hrs: 20 },
    ],
    milestone: "Build a CRUD REST API backed by PostgreSQL and deploy it",
    is_decision_point: false,
  },
  {
    stage: 3,
    is_decision_point: true,
    question: "Choose your specialization path:",
    options: [
      {
        label: "AI / ML Track",
        next_skills: ["NumPy", "Pandas", "Scikit-Learn", "PyTorch", "Hugging Face"],
      },
      {
        label: "Full Stack Track",
        next_skills: ["React / Next.js", "TypeScript", "TailwindCSS", "Node.js"],
      },
      {
        label: "DevOps & Cloud Track",
        next_skills: ["Docker", "Kubernetes", "AWS / GCP", "Terraform", "CI/CD"],
      },
    ],
  },
  {
    stage: 4,
    title: "Advanced Specialization",
    duration_weeks: 8,
    skills: ["Docker & Containerization", "Cloud Deployment (AWS/GCP)", "System Design", "Testing & CI/CD"],
    description: "Package your applications into Docker containers, deploy to cloud providers, and understand microservice architectures and scalability patterns.",
    resources: [
      { name: "Cloud Computing Fundamentals", url: "https://nptel.ac.in", type: "free", platform: "NPTEL", duration_hrs: 25 },
      { name: "Docker & Kubernetes Complete Guide", url: "https://udemy.com", type: "paid", platform: "Udemy", duration_hrs: 22 },
      { name: "System Design Primer", url: "https://github.com", type: "free", platform: "YouTube", duration_hrs: 10 },
    ],
    milestone: "Deploy a containerized full-stack application with automated CI/CD pipeline",
    is_decision_point: false,
  },
  {
    stage: 5,
    title: "Job-Ready & Portfolio",
    duration_weeks: 4,
    skills: ["Portfolio Project", "Resume Optimization", "Mock Interviews", "Open Source Contribution"],
    description: "Consolidate your learning into 2 capstone portfolio projects. Polish your GitHub profile, optimize your resume for ATS systems, and prepare for technical interviews.",
    resources: [
      { name: "Open Source Contribution Guide", url: "https://freecodecamp.org", type: "free", platform: "freeCodeCamp", duration_hrs: 8 },
      { name: "Tech Interview Handbook", url: "https://techinterviewhandbook.org", type: "free", platform: "LeetCode", duration_hrs: 20 },
    ],
    milestone: "2 production-quality projects live on GitHub + verified NSQF competency badge",
    is_decision_point: false,
  },
];

function StageCard({ item, index }: { item: RoadmapItem; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [selectedOption, setSelectedOption] = useState(0);

  if (item.is_decision_point) {
    return (
      <div className="flex gap-4 my-6">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-violet-600/20 border-2 border-violet-500/50 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-4 h-4 text-violet-300" />
          </div>
          <div className="w-0.5 flex-1 bg-gradient-to-b from-violet-500/50 to-white/10 my-1" />
        </div>
        <div className="flex-1 glass border border-violet-500/20 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Branch Point</span>
          </div>
          <h4 className="text-base font-bold text-white mb-4">{item.question}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {item.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedOption(i)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedOption === i
                    ? "bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-600/20"
                    : "bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
                }`}
              >
                <p className="font-semibold text-sm mb-1.5">{opt.label}</p>
                <div className="flex flex-wrap gap-1">
                  {opt.next_skills.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                      {s}
                    </span>
                  ))}
                  {opt.next_skills.length > 3 && (
                    <span className="text-[10px] text-gray-500">+{opt.next_skills.length - 3}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stage = item as Stage;
  const freeResources = stage.resources.filter(r => r.type === "free");
  const paidResources = stage.resources.filter(r => r.type === "paid");

  return (
    <div className="flex gap-4">
      {/* Node indicator */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md shadow-violet-600/30">
          {stage.stage}
        </div>
        <div className="w-0.5 flex-1 bg-white/10 my-1" />
      </div>

      <div className="flex-1 pb-8">
        <div
          className="glass glass-hover border border-white/[0.08] rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between p-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5">
                <h3 className="text-white font-bold text-base sm:text-lg">{stage.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-white/5 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3" />
                  <span>{stage.duration_weeks} weeks</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {stage.skills.map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-3 ${expanded ? "rotate-180" : ""}`} />
          </div>

          {expanded && (
            <div className="border-t border-white/5 p-5 space-y-5 bg-white/[0.01]">
              <p className="text-sm text-gray-300 leading-relaxed">{stage.description}</p>

              {/* Resources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {freeResources.length > 0 && (
                  <div>
                    <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>●</span> Free Learning Track
                    </p>
                    <div className="space-y-2">
                      {freeResources.map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/15 hover:border-emerald-400/35 transition-all group"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="text-base">{PLATFORM_ICONS[r.platform] ?? "📌"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium truncate">{r.name}</p>
                            <p className="text-[11px] text-gray-400">{r.platform} · {r.duration_hrs}h</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {paidResources.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>●</span> Paid Track (Certifications)
                    </p>
                    <div className="space-y-2">
                      {paidResources.map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-400/5 border border-amber-400/15 hover:border-amber-400/35 transition-all group"
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="text-base">{PLATFORM_ICONS[r.platform] ?? "📌"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium truncate">{r.name}</p>
                            <p className="text-[11px] text-gray-400">{r.platform} · {r.duration_hrs}h</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-amber-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Milestone */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/25">
                <Star className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-violet-300 font-bold mb-0.5">Stage Milestone</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{stage.milestone}</p>
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
  const [career, setCareer] = useState(searchParams.get("career") || "");
  const [input, setInput] = useState(career || "Full Stack Developer");
  const [roadmap, setRoadmap] = useState<RoadmapItem[] | null>(DEMO_ROADMAP);
  const [loading, setLoading] = useState(false);
  const [track, setTrack] = useState<"free" | "paid" | "hybrid">("hybrid");

  useEffect(() => {
    if (career) {
      setInput(career);
      generateRoadmap(career);
    }
  }, [career]);

  const generateRoadmap = async (slug?: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Standard Page Header */}
      <PageHeader
        badge={{
          icon: Map,
          text: "Personalized Progression",
          variant: "violet",
        }}
        title={
          <>
            AI <span className="gradient-text">Roadmap</span> Generator
          </>
        }
        description="Multi-stage personalized learning pathways curated with free SWAYAM/NPTEL courses, industry certificates, and milestone projects."
      />

      {/* Generator Input Card */}
      <div className="glass border border-white/10 rounded-2xl p-5 mb-8">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2.5">
          Enter Your Target Career Or Skill
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="roadmap-career-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
            placeholder="e.g., Full Stack Developer, Data Scientist, DevOps Engineer, Cloud Architect..."
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 text-sm transition-all"
          />
          <button
            id="generate-roadmap"
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-violet-600/20 shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span>{loading ? "Generating..." : "Generate Roadmap"}</span>
          </button>
        </div>

        {/* Track selector */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <span className="text-xs text-gray-400 font-medium">Curriculum Track:</span>
          {(["free", "paid", "hybrid"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTrack(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${
                track === t
                  ? t === "free"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : t === "paid"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
              }`}
            >
              {t === "free" ? "Free SWAYAM/NPTEL" : t === "paid" ? "Paid Certifications" : "Hybrid Track"}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse border border-white/5">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/10 rounded w-full mb-2" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Roadmap Content */}
      {!loading && roadmap && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Duration", value: `${totalWeeks} weeks`, icon: Clock },
              { label: "Learning Hours", value: `~${totalHours}h`, icon: BookOpen },
              { label: "Stages", value: `${roadmap.filter(r => !r.is_decision_point).length}`, icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center border border-white/[0.07]">
                <Icon className="w-5 h-5 text-violet-400 mx-auto mb-1.5" />
                <p className="text-xl sm:text-2xl font-bold text-white mb-0.5">{value}</p>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="mb-8">
            {roadmap.map((item, i) => (
              <StageCard key={i} item={item} index={i} />
            ))}
          </div>

          {/* CTA Box */}
          <div className="p-6 glass border border-violet-500/25 rounded-2xl text-center">
            <h3 className="text-white font-bold text-base sm:text-lg mb-1">
              Have questions about this roadmap?
            </h3>
            <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
              Our LangGraph AI career advisor can analyze your specific resume and adjust these milestones in real-time.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/25"
            >
              <Wand2 className="w-4 h-4" />
              <span>Talk to AI Career Advisor</span>
            </Link>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !roadmap && (
        <div className="text-center py-20 glass rounded-2xl border border-white/10 p-8">
          <Wand2 className="w-12 h-12 text-violet-400/40 mx-auto mb-4" />
          <p className="text-gray-300 font-semibold">Enter a career role above to generate your roadmap.</p>
        </div>
      )}
    </div>
  );
}

export default function RoadmapContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      }
    >
      <RoadmapInner />
    </Suspense>
  );
}
