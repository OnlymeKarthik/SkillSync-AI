"use client";

import { useState } from "react";
import { Briefcase, Building2, MapPin, IndianRupee, ExternalLink, Shield, TrendingUp } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import type { JobPosting, SectorFilter } from "@/lib/types";

const MOCK_JOBS: JobPosting[] = [
  {
    id: "1", title: "Junior Python Developer", company: "TCS iON", sector_type: "PRIVATE",
    location: "Bengaluru, Karnataka", state: "Karnataka", salary_min: 400000, salary_max: 700000,
    experience_min: 0, experience_max: 2, required_skills: ["Python", "FastAPI", "SQL", "Git"],
    nsqf_level: 5, source: "naukri", url: "https://naukri.com",
    posted_at: "2026-03-01", description: "Looking for enthusiastic freshers or junior developers with strong Python fundamentals."
  },
  {
    id: "2", title: "Data Analyst Trainee", company: "Infosys", sector_type: "PRIVATE",
    location: "Pune, Maharashtra", state: "Maharashtra", salary_min: 350000, salary_max: 600000,
    experience_min: 0, experience_max: 1, required_skills: ["Python", "Pandas", "SQL", "Power BI"],
    nsqf_level: 5, source: "linkedin", url: "https://linkedin.com",
    posted_at: "2026-03-02", description: "Entry-level data analyst role. Great learning environment with mentorship."
  },
  {
    id: "3", title: "Information Security Assistant", company: "NIC (National Informatics Centre)", sector_type: "GOVERNMENT",
    location: "New Delhi", state: "Delhi", salary_min: 500000, salary_max: 800000,
    experience_min: 1, experience_max: 3, required_skills: ["Network Security", "Linux", "SIEM", "Python"],
    nsqf_level: 6, source: "ncs", url: "https://ncs.gov.in",
    posted_at: "2026-02-28", description: "Government role in national cyber infrastructure. Excellent benefits and stability."
  },
  {
    id: "4", title: "Cloud DevOps Associate", company: "Wipro", sector_type: "PRIVATE",
    location: "Hyderabad, Telangana", state: "Telangana", salary_min: 600000, salary_max: 1000000,
    experience_min: 1, experience_max: 3, required_skills: ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD"],
    nsqf_level: 6, source: "naukri", url: "https://naukri.com",
    posted_at: "2026-03-03", description: "Help manage cloud infrastructure and deployment pipelines for global clients."
  },
  {
    id: "5", title: "Assistant Programmer", company: "CDAC (Centre for Development of Advanced Computing)", sector_type: "GOVERNMENT",
    location: "Pune, Maharashtra", state: "Maharashtra", salary_min: 450000, salary_max: 750000,
    experience_min: 0, experience_max: 2, required_skills: ["C++", "Python", "Linux", "Data Structures"],
    nsqf_level: 5, source: "upsc", url: "https://cdac.in",
    posted_at: "2026-03-01", description: "Work on indigenous HPC systems and national mission software projects."
  },
  {
    id: "6", title: "Full Stack Engineer (MERN)", company: "Swiggy", sector_type: "PRIVATE",
    location: "Bengaluru, Karnataka", state: "Karnataka", salary_min: 900000, salary_max: 1600000,
    experience_min: 2, experience_max: 4, required_skills: ["React", "Node.js", "MongoDB", "TypeScript", "Redis"],
    nsqf_level: 6, source: "linkedin", url: "https://linkedin.com",
    posted_at: "2026-03-04", description: "Build scalable customer-facing microservices in a high-growth tech product company."
  },
];

const STATES = ["All States", "Karnataka", "Maharashtra", "Delhi", "Telangana", "Tamil Nadu", "Uttar Pradesh"];

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Not disclosed";
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)}`;
  if (min) return `From ₹${fmt(min)}`;
  return `Up to ₹${fmt(max!)}`;
}

function JobCard({ job }: { job: JobPosting }) {
  const isGovt = job.sector_type === "GOVERNMENT";

  return (
    <div className="glass glass-hover rounded-2xl p-6 flex flex-col justify-between transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                isGovt
                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  : "text-violet-400 bg-violet-400/10 border-violet-400/20"
              }`}>
                {isGovt ? <Shield className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                {isGovt ? "Government" : "Private Sector"}
              </span>
              {job.nsqf_level && (
                <span className="text-[11px] bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-medium">
                  NSQF L{job.nsqf_level}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{job.company}</p>
          </div>
        </div>

        {job.description && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 my-3">
            {job.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-violet-300 font-semibold">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>{formatSalary(job.salary_min, job.salary_max)}</span>
          </div>
        </div>

        {/* Skills */}
        {job.required_skills && job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.required_skills.map((s: string) => (
              <span key={s} className="skill-badge text-[10px] sm:text-xs">{s}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.06]">
        <span className="text-[11px] text-gray-500 capitalize">
          Via {job.source}
        </span>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs px-3.5 py-1.5"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Standard Page Header */}
      <PageHeader
        badge={{
          icon: Briefcase,
          text: "Live Aggregation",
          variant: "violet",
        }}
        title={
          <>
            Smart <span className="gradient-text">Job Board</span>
          </>
        }
        description="Live job postings aggregated via Crawl4AI from LinkedIn, Naukri, and central/state government employment portals with NSQF skill matching."
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Openings", value: MOCK_JOBS.length, icon: Briefcase, color: "text-violet-400", bg: "bg-violet-600/10 border-violet-500/20", accent: "accent-left-violet" },
          { label: "Private Sector", value: privateCount, icon: Building2, color: "text-violet-300", bg: "bg-violet-600/10 border-violet-500/20", accent: "accent-left-violet" },
          { label: "Government / PSU", value: govtCount, icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", accent: "accent-left-emerald" },
        ].map(({ label, value, icon: Icon, color, bg, accent }) => (
          <div key={label} className={`glass-elevated rounded-2xl p-5 flex items-center gap-4 ${accent}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center justify-between glass-elevated p-3.5 rounded-2xl">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Sector filter */}
          <div className="flex gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/5">
            {([["all", "All Vacancies"], ["PRIVATE", "Private"], ["GOVERNMENT", "Government"]] as [SectorFilter, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSectorFilter(val)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sectorFilter === val
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
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
            className="bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-1.5 text-gray-200 text-xs font-medium focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer"
          >
            {STATES.map(s => <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>)}
          </select>

          {/* Freshers toggle */}
          <button
            onClick={() => setFreshersOnly(!freshersOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              freshersOnly
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white bg-white/[0.02]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Freshers only (0-1 yrs)</span>
          </button>
        </div>

        <span className="text-xs text-gray-400 font-semibold px-2">
          {filtered.length} postings found
        </span>
      </div>

      {/* Job Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 glass-elevated rounded-2xl p-8">
          <Briefcase className="w-12 h-12 text-violet-400/40 mx-auto mb-4" />
          <p className="text-gray-200 text-base font-semibold">No job vacancies match your selected filters.</p>
          <p className="text-gray-500 text-xs mt-1">Try resetting the state or sector filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
