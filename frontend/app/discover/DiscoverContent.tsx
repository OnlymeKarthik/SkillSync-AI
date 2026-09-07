"use client";

import { useState, useEffect } from "react";
import { Search, Filter, TrendingUp, Briefcase, Star, ChevronRight, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import type { Career, DifficultyLevel } from "@/lib/types";

const DOMAINS = ["All", "Software Development", "Data Science", "Cloud & DevOps", "Cybersecurity", "AI/ML", "Full Stack", "Mobile Dev"];
const DIFFICULTIES: DifficultyLevel[] = ["beginner", "intermediate", "advanced"];
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

const MOCK_CAREERS: Career[] = [
  { id: "1", slug: "full-stack-developer", title: "Full Stack Developer", domain: "Software Development", description: "Build end-to-end web applications using modern frameworks like React, Next.js, and Node.js.", difficulty: "intermediate", avg_salary_min: 600000, avg_salary_max: 1800000, growth_rate: 22, nsqf_levels: [5, 6, 7] },
  { id: "2", slug: "data-scientist", title: "Data Scientist", domain: "Data Science", description: "Analyse large datasets, build ML models, and derive actionable business insights.", difficulty: "advanced", avg_salary_min: 800000, avg_salary_max: 2500000, growth_rate: 35, nsqf_levels: [6, 7] },
  { id: "3", slug: "devops-engineer", title: "DevOps Engineer", domain: "Cloud & DevOps", description: "Bridge development and operations with CI/CD pipelines, Docker, Kubernetes, and cloud infrastructure.", difficulty: "intermediate", avg_salary_min: 700000, avg_salary_max: 2000000, growth_rate: 28, nsqf_levels: [5, 6] },
  { id: "4", slug: "cybersecurity-analyst", title: "Cybersecurity Analyst", domain: "Cybersecurity", description: "Protect systems and networks from threats. Work with SIEM tools, threat hunting, and incident response.", difficulty: "intermediate", avg_salary_min: 600000, avg_salary_max: 1800000, growth_rate: 30, nsqf_levels: [5, 6] },
  { id: "5", slug: "ml-engineer", title: "ML Engineer", domain: "AI/ML", description: "Deploy and productionise machine learning models. Work with MLOps, model serving, and feature engineering.", difficulty: "advanced", avg_salary_min: 1000000, avg_salary_max: 3000000, growth_rate: 40, nsqf_levels: [7] },
  { id: "6", slug: "frontend-developer", title: "Frontend Developer", domain: "Software Development", description: "Create stunning, performant user interfaces with React, TypeScript, and modern CSS.", difficulty: "beginner", avg_salary_min: 400000, avg_salary_max: 1400000, growth_rate: 18, nsqf_levels: [4, 5] },
  { id: "7", slug: "cloud-architect", title: "Cloud Architect", domain: "Cloud & DevOps", description: "Design and oversee cloud infrastructure strategies on AWS, Azure, or GCP.", difficulty: "advanced", avg_salary_min: 1500000, avg_salary_max: 4000000, growth_rate: 32, nsqf_levels: [7] },
  { id: "8", slug: "data-analyst", title: "Data Analyst", domain: "Data Science", description: "Transform raw data into business insights using SQL, Python, and BI tools like Power BI.", difficulty: "beginner", avg_salary_min: 400000, avg_salary_max: 1200000, growth_rate: 20, nsqf_levels: [4, 5] },
];

function formatSalary(min: number, max: number): string {
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`;
  return `₹${fmt(min)} – ₹${fmt(max)}`;
}

function CareerCard({ career, onViewRoadmap }: { career: Career; onViewRoadmap: (c: Career) => void }) {
  return (
    <div className="glass glass-hover rounded-2xl p-6 flex flex-col gap-4 cursor-pointer group" onClick={() => onViewRoadmap(career)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[career.difficulty]}`}>
              {career.difficulty}
            </span>
            <span className="text-xs text-gray-500">{career.domain}</span>
          </div>
          <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">{career.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium whitespace-nowrap">
          <TrendingUp className="w-3.5 h-3.5" />
          {career.growth_rate}%
        </div>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{career.description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Avg Salary</p>
          <p className="text-sm font-semibold text-violet-300">{formatSalary(career.avg_salary_min, career.avg_salary_max)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">NSQF Levels</p>
          <div className="flex gap-1 justify-end">
            {career.nsqf_levels.map(l => (
              <span key={l} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">L{l}</span>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors ml-4">
          Roadmap <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DiscoverContent() {
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyLevel[]>([]);
  const [minGrowth, setMinGrowth] = useState(0);
  const [careers] = useState<Career[]>(MOCK_CAREERS);
  const [showFilters, setShowFilters] = useState(false);

  const toggleDifficulty = (d: DifficultyLevel) => {
    setSelectedDifficulties(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const filtered = careers.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.domain.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedDomain !== "All" && c.domain !== selectedDomain) return false;
    if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(c.difficulty)) return false;
    if (c.growth_rate < minGrowth) return false;
    return true;
  });

  const handleViewRoadmap = (career: Career) => {
    window.location.href = `/roadmap?career=${career.slug}&title=${encodeURIComponent(career.title)}`;
  };

  return (
    <div className="min-h-screen bg-[#030712] bg-grid">
      <Navbar />
      <div className="bg-glow-violet fixed inset-0 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            Discover <span className="gradient-text">Careers</span>
          </h1>
          <p className="text-gray-400 text-lg">Browse {careers.length} career paths aligned with NSQF framework and India's job market.</p>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              id="career-search"
              type="text"
              placeholder="Search careers, domains..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
            />
          </div>
          <button
            id="toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${showFilters ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "bg-white/[0.04] border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-violet-300"}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {selectedDifficulties.length + (minGrowth > 0 ? 1 : 0) > 0 && (
              <span className="bg-violet-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedDifficulties.length + (minGrowth > 0 ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass rounded-2xl p-5 mb-6 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Difficulty</p>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => toggleDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedDifficulties.includes(d)
                        ? DIFFICULTY_COLORS[d]
                        : "border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Min Growth Rate: {minGrowth}%</p>
              <input
                type="range" min={0} max={40} step={5} value={minGrowth}
                onChange={e => setMinGrowth(Number(e.target.value))}
                className="w-40 accent-violet-500"
              />
            </div>
          </div>
        )}

        {/* Domain Pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {DOMAINS.map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selectedDomain === domain
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 mb-5 text-sm text-gray-500">
          <Briefcase className="w-4 h-4" />
          <span>{filtered.length} career{filtered.length !== 1 ? "s" : ""} found</span>
          {(search || selectedDomain !== "All" || selectedDifficulties.length > 0 || minGrowth > 0) && (
            <button
              onClick={() => { setSearch(""); setSelectedDomain("All"); setSelectedDifficulties([]); setMinGrowth(0); }}
              className="ml-2 flex items-center gap-1 text-violet-400 hover:text-violet-300"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {/* Career Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No careers match your filters.</p>
            <p className="text-gray-600 text-sm mt-2">Try broadening your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(career => (
              <CareerCard key={career.id} career={career} onViewRoadmap={handleViewRoadmap} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
