"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/hooks/useApi";
import { careersApi } from "@/lib/api";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { CardSkeleton } from "@/components/ui/Loaders";
import {
  TrendingUp,
  ArrowRight,
  Filter,
  IndianRupee,
  BarChart2,
} from "lucide-react";
import type { DifficultyLevel } from "@/lib/types";

const DOMAINS = [
  "All",
  "Data & AI",
  "Cloud & DevOps",
  "Software Development",
  "Security",
  "Management",
  "Design",
  "Government & PSU",
];

const DIFFICULTIES: { label: string; value: DifficultyLevel | "" }[] = [
  { label: "All Levels", value: "" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const difficultyColor = {
  beginner: "badge-green",
  intermediate: "badge-amber",
  advanced: "badge-red",
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Not specified";
  const fmt = (n: number) =>
    n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)}/mo`;
  if (min) return `₹${fmt(min)}+/mo`;
  if (max) return `Up to ₹${fmt(max)}/mo`;
  return "";
}

export default function CareersPage() {
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel | "">("");

  const { data, loading, error, refetch } = useApi(
    () =>
      careersApi.list({
        domain: domain || undefined,
        difficulty: difficulty || undefined,
        page_size: 50,
      }),
    [domain, difficulty]
  );

  const careers = data?.careers ?? [];

  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Career <span className="gradient-text">Explorer</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Browse tech careers with salary data, growth rates, and NSQF
            levels. Click any career to see required skills and generate a
            roadmap.
          </p>
        </div>

        {/* Filters */}
        <div
          className="glass-card"
          style={{
            padding: "1.125rem 1.25rem",
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => setDomain(d === "All" ? "" : d)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: 100,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  transition: "all 0.15s",
                  background:
                    (domain === "" && d === "All") || domain === d
                      ? "rgba(13,148,136,0.2)"
                      : "transparent",
                  borderColor:
                    (domain === "" && d === "All") || domain === d
                      ? "rgba(13,148,136,0.4)"
                      : "var(--border)",
                  color:
                    (domain === "" && d === "All") || domain === d
                      ? "#5eead4"
                      : "var(--text-muted)",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          <select
            className="select-base"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as DifficultyLevel | "")
            }
            style={{ width: "auto" }}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            Showing {careers.length} career
            {careers.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Careers grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : careers.length === 0 ? (
          <EmptyState
            title="No careers found"
            description="Try adjusting your domain or difficulty filter."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {careers.map((career) => (
              <Link
                key={career.id}
                href={`/careers/${career.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="glass-card"
                  style={{
                    padding: "1.5rem",
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-3px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 28px rgba(0,0,0,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {/* Domain + Difficulty */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.875rem",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="badge badge-indigo"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {career.domain}
                    </span>
                    {career.difficulty && (
                      <span
                        className={`badge ${difficultyColor[career.difficulty]}`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {career.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {career.title}
                  </h2>

                  {/* Salary */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.875rem",
                    }}
                  >
                    <IndianRupee size={13} />
                    {formatSalary(career.avg_salary_min, career.avg_salary_max)}
                  </div>

                  {/* Growth + NSQF */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                      marginBottom: "1rem",
                    }}
                  >
                    {career.growth_rate != null && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.78rem",
                          color: "#34d399",
                        }}
                      >
                        <TrendingUp size={12} />
                        {career.growth_rate}% growth
                      </div>
                    )}
                    {career.nsqf_levels && career.nsqf_levels.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        <BarChart2 size={12} />
                        NSQF L{career.nsqf_levels.join(", ")}
                      </div>
                    )}
                  </div>

                  {/* View CTA */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#2dd4bf",
                    }}
                  >
                    View details
                    <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Compare link */}
        {!loading && careers.length > 1 && (
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/careers/compare" className="btn-secondary">
              Compare Careers Side by Side
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
