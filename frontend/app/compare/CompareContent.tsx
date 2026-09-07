"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, ArrowLeftRight, TrendingUp, DollarSign, Zap, BookOpen, Briefcase, Check, Minus, Scale } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import type { Career } from "@/lib/types";

const CAREERS: Career[] = [
  { id: "1", slug: "full-stack-developer", title: "Full Stack Developer", domain: "Software Development", description: "Build end-to-end web applications.", difficulty: "intermediate", avg_salary_min: 600000, avg_salary_max: 1800000, growth_rate: 22, nsqf_levels: [5, 6, 7] },
  { id: "2", slug: "data-scientist", title: "Data Scientist", domain: "Data Science", description: "Analyse data and build ML models.", difficulty: "advanced", avg_salary_min: 800000, avg_salary_max: 2500000, growth_rate: 35, nsqf_levels: [6, 7] },
  { id: "3", slug: "devops-engineer", title: "DevOps Engineer", domain: "Cloud & DevOps", description: "CI/CD, Docker, Kubernetes.", difficulty: "intermediate", avg_salary_min: 700000, avg_salary_max: 2000000, growth_rate: 28, nsqf_levels: [5, 6] },
  { id: "4", slug: "cybersecurity-analyst", title: "Cybersecurity Analyst", domain: "Cybersecurity", description: "Protect systems from threats.", difficulty: "intermediate", avg_salary_min: 600000, avg_salary_max: 1800000, growth_rate: 30, nsqf_levels: [5, 6] },
  { id: "5", slug: "ml-engineer", title: "ML Engineer", domain: "AI/ML", description: "Deploy ML models in production.", difficulty: "advanced", avg_salary_min: 1000000, avg_salary_max: 3000000, growth_rate: 40, nsqf_levels: [7] },
  { id: "6", slug: "frontend-developer", title: "Frontend Developer", domain: "Software Development", description: "Create stunning user interfaces.", difficulty: "beginner", avg_salary_min: 400000, avg_salary_max: 1400000, growth_rate: 18, nsqf_levels: [4, 5] },
  { id: "7", slug: "cloud-architect", title: "Cloud Architect", domain: "Cloud & DevOps", description: "Design cloud infrastructure.", difficulty: "advanced", avg_salary_min: 1500000, avg_salary_max: 4000000, growth_rate: 32, nsqf_levels: [7] },
  { id: "8", slug: "data-analyst", title: "Data Analyst", domain: "Data Science", description: "Business insights from raw data.", difficulty: "beginner", avg_salary_min: 400000, avg_salary_max: 1200000, growth_rate: 20, nsqf_levels: [4, 5] },
];

const CAREER_SKILLS: Record<string, string[]> = {
  "full-stack-developer": ["React", "Node.js", "PostgreSQL", "Docker", "TypeScript", "REST APIs"],
  "data-scientist": ["Python", "Pandas", "Scikit-learn", "TensorFlow", "SQL", "Statistics"],
  "devops-engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform"],
  "cybersecurity-analyst": ["Network Security", "SIEM", "Penetration Testing", "Cryptography", "Incident Response"],
  "ml-engineer": ["Python", "MLOps", "TensorFlow", "Kubeflow", "Feature Engineering", "Model Serving"],
  "frontend-developer": ["React", "TypeScript", "CSS", "Figma", "Next.js", "Accessibility"],
  "cloud-architect": ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Cost Optimisation"],
  "data-analyst": ["SQL", "Python", "Power BI", "Excel", "Statistics", "Data Storytelling"],
};

const GOVT_JOB_FRIENDLY: Record<string, boolean> = {
  "cybersecurity-analyst": true,
  "data-analyst": true,
  "cloud-architect": false,
  "devops-engineer": false,
  "full-stack-developer": true,
  "data-scientist": true,
  "ml-engineer": false,
  "frontend-developer": true,
};

function formatSalary(min: number, max: number) {
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`;
  return `₹${fmt(min)} – ₹${fmt(max)}`;
}

function CompareCell({ value, best, worst, type }: { value: number | string | boolean; best?: boolean; worst?: boolean; type: "number" | "salary" | "bool" | "text" | "difficulty" }) {
  if (type === "bool") {
    return (
      <div className={`flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold ${value ? "text-emerald-400" : "text-gray-500"}`}>
        {value ? <Check className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
        <span>{value ? "Supported" : "Limited"}</span>
      </div>
    );
  }
  return (
    <div className={`text-center font-bold text-xs sm:text-sm ${best ? "text-emerald-400" : worst ? "text-red-400" : "text-white"}`}>
      {String(value)}
    </div>
  );
}

const COLUMN_ACCENTS = ["border-t-violet-500", "border-t-blue-500", "border-t-emerald-500"];

export default function CompareContent() {
  const [selected, setSelected] = useState<Career[]>([CAREERS[0], CAREERS[1]]);
  const [search, setSearch] = useState("");

  const available = CAREERS.filter(c =>
    !selected.find(s => s.id === c.id) &&
    (search === "" || c.title.toLowerCase().includes(search.toLowerCase()))
  );

  const addCareer = (c: Career) => {
    if (selected.length < 3) setSelected(prev => [...prev, c]);
  };
  const removeCareer = (id: string) => setSelected(prev => prev.filter(c => c.id !== id));

  const growths = selected.map(c => c.growth_rate);
  const maxGrowth = growths.length > 0 ? Math.max(...growths) : 0;
  const minGrowth = growths.length > 0 ? Math.min(...growths) : 0;
  const maxSalary = selected.length > 0 ? Math.max(...selected.map(c => c.avg_salary_max)) : 0;
  const minSalary = selected.length > 0 ? Math.min(...selected.map(c => c.avg_salary_max)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Standard Page Header */}
      <PageHeader
        badge={{
          icon: Scale,
          text: "Decision Matrix",
          variant: "violet",
        }}
        title={
          <>
            Compare <span className="gradient-text">Careers</span>
          </>
        }
        description="Side-by-side benchmark comparison of up to 3 career pathways across entry salaries, growth rates, NSQF qualifications, and hiring demand."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selector panel */}
        <div className="lg:col-span-1">
          <div className="glass-elevated rounded-2xl p-4 sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Select Careers
              </p>
              <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-bold">
                {selected.length}/3
              </span>
            </div>
            <input
              id="compare-search"
              type="text"
              placeholder="Search careers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field mb-3"
            />
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {available.map(c => (
                <button
                  key={c.id}
                  onClick={() => addCareer(c)}
                  disabled={selected.length >= 3}
                  className="w-full text-left p-3 rounded-xl border border-white/8 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-violet-600/30 flex items-center justify-center transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{c.title}</p>
                      <p className="text-[11px] text-gray-500 truncate">{c.domain}</p>
                    </div>
                  </div>
                </button>
              ))}
              {available.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">All available careers selected</p>
              )}
            </div>
          </div>
        </div>

        {/* Comparison area */}
        <div className="lg:col-span-3">
          {selected.length === 0 ? (
            <div className="glass-elevated rounded-2xl p-16 text-center">
              <ArrowLeftRight className="w-12 h-12 text-violet-400/40 mx-auto mb-4" />
              <p className="text-gray-200 text-lg font-bold mb-2">Select careers to compare</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Add 2 or 3 career profiles from the left panel to see their full side-by-side metric matrix.
              </p>
            </div>
          ) : (
            <div>
              {/* Career headers */}
              <div
                className="grid gap-4 mb-6"
                style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}
              >
                {selected.map((c, i) => (
                  <div
                    key={c.id}
                    className={`glass-elevated rounded-2xl p-4 border-t-2 ${COLUMN_ACCENTS[i]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-bold text-sm sm:text-base">{c.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">{c.domain}</p>
                      </div>
                      <button
                        onClick={() => removeCareer(c.id)}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              {[
                {
                  label: "Salary Range",
                  icon: DollarSign,
                  render: (c: Career) => (
                    <div
                      className={`text-center text-xs sm:text-sm font-bold ${
                        c.avg_salary_max === maxSalary
                          ? "text-emerald-400"
                          : c.avg_salary_max === minSalary && selected.length > 1
                          ? "text-amber-400"
                          : "text-white"
                      }`}
                    >
                      {formatSalary(c.avg_salary_min, c.avg_salary_max)}
                    </div>
                  ),
                },
                {
                  label: "Growth Trajectory",
                  icon: TrendingUp,
                  render: (c: Career) => (
                    <div className="text-center">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          c.growth_rate === maxGrowth
                            ? "text-emerald-400"
                            : c.growth_rate === minGrowth && selected.length > 1
                            ? "text-gray-300"
                            : "text-white"
                        }`}
                      >
                        +{c.growth_rate}%
                      </span>
                      <div className="mt-1.5 bg-white/5 rounded-full h-1.5 mx-2 sm:mx-6 overflow-hidden">
                        <div
                          className="bg-violet-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(c.growth_rate / 45) * 100}%` }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  label: "Entry Difficulty",
                  icon: Zap,
                  render: (c: Career) => (
                    <div className="text-center">
                      <span
                        className={`text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                          c.difficulty === "beginner"
                            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                            : c.difficulty === "intermediate"
                            ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                            : "text-red-400 bg-red-400/10 border-red-400/20"
                        }`}
                      >
                        {c.difficulty}
                      </span>
                    </div>
                  ),
                },
                {
                  label: "Government Portals Presence",
                  icon: Briefcase,
                  render: (c: Career) => (
                    <CompareCell value={GOVT_JOB_FRIENDLY[c.slug] ?? false} type="bool" />
                  ),
                },
                {
                  label: "NSQF Alignment Levels",
                  icon: BookOpen,
                  render: (c: Career) => (
                    <div className="flex gap-1 justify-center flex-wrap">
                      {c.nsqf_levels.map(l => (
                        <span
                          key={l}
                          className="text-[11px] bg-blue-500/10 border border-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-medium"
                        >
                          L{l}
                        </span>
                      ))}
                    </div>
                  ),
                },
                {
                  label: "Key Required Skills",
                  icon: Zap,
                  render: (c: Career) => (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {(CAREER_SKILLS[c.slug] ?? []).slice(0, 4).map(s => (
                        <span key={s} className="skill-badge text-[10px] sm:text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  ),
                },
              ].map(({ label, icon: Icon, render }, rowIdx) => (
                <div key={label} className={`glass rounded-xl mb-3 overflow-hidden ${rowIdx % 2 === 1 ? "bg-white/[0.01]" : ""}`}>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
                    <Icon className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      {label}
                    </span>
                  </div>
                  <div
                    className="grid gap-4 px-4 py-3.5 items-center"
                    style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}
                  >
                    {selected.map(c => (
                      <div key={c.id}>{render(c)}</div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Bottom Roadmaps CTA Links */}
              <div className="mt-6 flex gap-3 flex-wrap">
                {selected.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/roadmap?career=${c.slug}&title=${encodeURIComponent(c.title)}`}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-white shadow-sm ${
                      i === 0
                        ? "bg-violet-600/30 border border-violet-500/50 hover:bg-violet-600/50"
                        : i === 1
                        ? "bg-blue-600/30 border border-blue-500/50 hover:bg-blue-600/50"
                        : "bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/50"
                    }`}
                  >
                    <span>View {c.title} Roadmap</span>
                    <span>→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
