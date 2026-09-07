"use client";

import { useState } from "react";
import {
  Briefcase, Building2, MapPin, DollarSign, Clock,
  ExternalLink, Filter, ChevronDown, TrendingUp, Shield
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import type { JobPosting, SectorFilter } from "@/lib/types";

const MOCK_JOBS: JobPosting[] = [
  { id: "1", title: "Software Engineer — Full Stack", company: "Infosys", location: "Bengaluru", state: "Karnataka", sector_type: "PRIVATE", source: "LinkedIn", salary_min: 600000, salary_max: 1200000, experience_min: 0, experience_max: 2, url: "#", posted_at: "2026-09-05" },
  { id: "2", title: "Junior Data Scientist", company: "TCS iON", location: "Hyderabad", state: "Telangana", sector_type: "PRIVATE", source: "Naukri", salary_min: 700000, salary_max: 1500000, experience_min: 1, experience_max: 3, url: "#", posted_at: "2026-09-04" },
  { id: "3", title: "Systems Analyst — IT", company: "NIC (National Informatics Centre)", location: "New Delhi", state: "Delhi", sector_type: "GOVERNMENT", source: "sarkari-result.com", salary_min: 470000, salary_max: 890000, experience_min: 0, experience_max: 3, url: "#", posted_at: "2026-09-03" },
  { id: "4", title: "Cloud DevOps Engineer", company: "Wipro", location: "Pune", state: "Maharashtra", sector_type: "PRIVATE", source: "LinkedIn", salary_min: 800000, salary_max: 1800000, experience_min: 2, experience_max: 5, url: "#", posted_at: "2026-09-06" },
  { id: "5", title: "Cybersecurity Analyst", company: "CDAC", location: "Pune", state: "Maharashtra", sector_type: "GOVERNMENT", source: "cdac.in", salary_min: 500000, salary_max: 900000, experience_min: 0, experience_max: 2, url: "#", posted_at: "2026-09-02" },
  { id: "6", title: "Frontend React Developer", company: "Razorpay", location: "Bengaluru", state: "Karnataka", sector_type: "PRIVATE", source: "LinkedIn", salary_min: 900000, salary_max: 2000000, experience_min: 1, experience_max: 4, url: "#", posted_at: "2026-09-07" },
  { id: "7", title: "Data Analyst — Govt Projects", company: "MeitY", location: "New Delhi", state: "Delhi", sector_type: "GOVERNMENT", source: "meity.gov.in", salary_min: 450000, salary_max: 800000, experience_min: 0, experience_max: 3, url: "#", posted_at: "2026-09-01" },
  { id: "8", title: "ML Engineer — Recommendation Systems", company: "Flipkart", location: "Bengaluru", state: "Karnataka", sector_type: "PRIVATE", source: "Naukri", salary_min: 1200000, salary_max: 2800000, experience_min: 2, experience_max: 6, url: "#", posted_at: "2026-09-05" },
  { id: "9", title: "Technical Officer — Software", company: "ISRO", location: "Bengaluru", state: "Karnataka", sector_type: "GOVERNMENT", source: "isro.gov.in", salary_min: 560000, salary_max: 1050000, experience_min: 0, experience_max: 2, url: "#", posted_at: "2026-09-06" },
  { id: "10", title: "Backend Engineer — Node.js", company: "Zepto", location: "Mumbai", state: "Maharashtra", sector_type: "PRIVATE", source: "LinkedIn", salary_min: 1000000, salary_max: 2200000, experience_min: 1, experience_max: 4, url: "#", posted_at: "2026-09-07" },
];

const STATES = ["All States", "Karnataka", "Telangana", "Maharashtra", "Delhi"];

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return "Not disclosed";
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)}`;
  if (max) return `Up to ₹${fmt(max)}`;
  return `₹${fmt(min!)}+`;
}

function daysAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  return diff === 0 ? "Today" : diff === 1 ? "1 day ago" : `${diff} days ago`;
}

function JobCard({ job }: { job: JobPosting }) {
  return (
    <div className="glass glass-hover rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {job.sector_type === "GOVERNMENT" ? (
              <span className="flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                <Shield className="w-2.5 h-2.5" /> Government
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium">
                <Building2 className="w-2.5 h-2.5" /> Private
              </span>
            )}
            <span className="text-xs text-gray-600">{daysAgo(job.posted_at)}</span>
          </div>
          <h3 className="text-white font-semibold text-base leading-tight">{job.title}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{job.company}</p>
        </div>
        <a
          href={job.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 rounded-xl border border-white/10 hover:border-violet-500/30 hover:text-violet-400 text-gray-500 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {job.location}
          </span>
        )}
        {(job.salary_min || job.salary_max) && (
          <span className="flex items-center gap-1 text-emerald-400">
            <DollarSign className="w-3 h-3" /> {formatSalary(job.salary_min, job.salary_max)}
          </span>
        )}
        {(job.experience_min != null) && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {job.experience_min === 0 ? "Fresher" : `${job.experience_min}–${job.experience_max}y exp`}
          </span>
        )}
      </div>

      <div className="text-xs text-gray-600 pt-1 border-t border-white/5">
        via {job.source}
      </div>
    </div>
  );
}

export default function JobsContent() {
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>("all");
  const [stateFilter, setStateFilter] = useState("All States");
  const [freshersOnly, setFreshersOnly] = useState(false);

  const filtered = MOCK_JOBS.filter(j => {
    if (sectorFilter !== "all" && j.sector_type !== sectorFilter) return false;
    if (stateFilter !== "All States" && j.state !== stateFilter) return false;
    if (freshersOnly && (j.experience_min ?? 0) > 0) return false;
    return true;
  });

  const privateCount = MOCK_JOBS.filter(j => j.sector_type === "PRIVATE").length;
  const govtCount = MOCK_JOBS.filter(j => j.sector_type === "GOVERNMENT").length;

  return (
    <div className="min-h-screen bg-[#030712] bg-grid">
      <Navbar />
      <div className="bg-glow-violet fixed inset-0 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            Job <span className="gradient-text">Board</span>
          </h1>
          <p className="text-gray-400">Live job postings aggregated from LinkedIn, Naukri, and government portals.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: MOCK_JOBS.length, icon: Briefcase, color: "violet" },
            { label: "Private Sector", value: privateCount, icon: Building2, color: "violet" },
            { label: "Government", value: govtCount, icon: Shield, color: "blue" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-2 ${color === "blue" ? "text-blue-400" : "text-violet-400"}`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          {/* Sector filter */}
          <div className="flex gap-2">
            {([["all", "All Jobs"], ["PRIVATE", "Private"], ["GOVERNMENT", "Government"]] as [SectorFilter, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSectorFilter(val)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  sectorFilter === val
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* State filter */}
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-gray-300 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
          >
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Freshers toggle */}
          <button
            onClick={() => setFreshersOnly(!freshersOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${
              freshersOnly ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Freshers only
          </button>

          <span className="text-sm text-gray-600 ml-auto">{filtered.length} jobs</span>
        </div>

        {/* Job grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No jobs match your filters. Try adjusting them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </main>
    </div>
  );
}
