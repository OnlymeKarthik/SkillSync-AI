"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/useApi";
import { jobsApi } from "@/lib/api";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { CardSkeleton } from "@/components/ui/Loaders";
import type { SectorFilter } from "@/lib/types";
import {
  Briefcase,
  MapPin,
  Building2,
  IndianRupee,
  Clock,
  ExternalLink,
  Filter,
} from "lucide-react";

const SECTORS: { label: string; value: SectorFilter }[] = [
  { label: "All", value: "all" },
  { label: "Private", value: "PRIVATE" },
  { label: "Government", value: "GOVERNMENT" },
];

const STATES = [
  "All States",
  "Karnataka",
  "Maharashtra",
  "Delhi",
  "Telangana",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Haryana",
];

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)}/mo`;
  if (min) return `₹${fmt(min)}+/mo`;
  return null;
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? "s" : ""} ago`;
}

export default function JobsPage() {
  const [sector, setSector] = useState<SectorFilter>("all");
  const [state, setState] = useState("");

  const { data, loading, error, refetch } = useApi(
    () =>
      jobsApi.list({
        sector_type: sector,
        state: state || undefined,
        page_size: 50,
      }),
    [sector, state]
  );

  const jobs = data?.jobs ?? [];

  return (
    <div className="section-padding">
      <div className="container-page">
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Job <span className="gradient-text">Board</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Browse scraped job postings from Naukri, LinkedIn, NCS, and
            government portals — filter by sector and state.
          </p>
        </div>

        {/* Filters */}
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.875rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-muted)",
            }}
          >
            <Filter size={15} />
            <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              Filters
            </span>
          </div>

          {/* Sector pills */}
          <div style={{ display: "flex", gap: "0.375rem" }}>
            {SECTORS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSector(s.value)}
                style={{
                  padding: "0.35rem 0.875rem",
                  borderRadius: 100,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  transition: "all 0.15s",
                  background:
                    sector === s.value
                      ? "rgba(13,148,136,0.2)"
                      : "transparent",
                  borderColor:
                    sector === s.value
                      ? "rgba(13,148,136,0.4)"
                      : "var(--border)",
                  color:
                    sector === s.value ? "#5eead4" : "var(--text-muted)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* State filter */}
          <select
            className="select-base"
            value={state}
            onChange={(e) =>
              setState(e.target.value === "All States" ? "" : e.target.value)
            }
            style={{ width: "auto" }}
          >
            {STATES.map((s) => (
              <option key={s} value={s === "All States" ? "" : s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Count */}
        {!loading && !error && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            {jobs.length} job posting{jobs.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Job list */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "1rem",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Try adjusting your sector or state filter."
            icon={<Briefcase size={24} />}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "1rem",
            }}
          >
            {jobs.map((job) => {
              const salary = formatSalary(job.salary_min, job.salary_max);
              const posted = timeAgo(job.posted_at);
              return (
                <div
                  key={job.id}
                  className="glass-card"
                  style={{ padding: "1.25rem" }}
                >
                  {/* Sector + Source */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span
                      className={`badge ${job.sector_type === "PRIVATE" ? "badge-indigo" : "badge-green"}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {job.sector_type === "PRIVATE" ? "Private" : "Government"}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {job.source}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "0.975rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {job.title}
                  </h3>

                  {/* Company */}
                  {job.company && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Building2 size={12} />
                      {job.company}
                    </div>
                  )}

                  {/* Location */}
                  {job.location && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <MapPin size={11} />
                      {job.location}{job.state && `, ${job.state}`}
                    </div>
                  )}

                  {/* Salary + Experience */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.875rem",
                      flexWrap: "wrap",
                      marginBottom: "1rem",
                    }}
                  >
                    {salary && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.8rem",
                          color: "#34d399",
                          fontWeight: 500,
                        }}
                      >
                        <IndianRupee size={12} />
                        {salary}
                      </div>
                    )}
                    {(job.experience_min != null || job.experience_max != null) && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Clock size={11} />
                        {job.experience_min ?? 0}–{job.experience_max ?? "?"} yrs
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {posted}
                    </span>
                    {job.url ? (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.35rem 0.75rem",
                        }}
                      >
                        Apply
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        No link
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
