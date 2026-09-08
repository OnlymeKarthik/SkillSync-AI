"use client";

import { useState } from "react";
import { skillsApi } from "@/lib/api";
import { useApi } from "@/lib/hooks/useApi";
import { Spinner } from "@/components/ui/Loaders";
import { ErrorState, EmptyState } from "@/components/ui/States";
import type { SectorFilter } from "@/lib/types";
import {
  Zap,
  Search,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BookOpen,
} from "lucide-react";

const SECTORS: { label: string; value: SectorFilter }[] = [
  { label: "All Sectors", value: "all" },
  { label: "Private", value: "PRIVATE" },
  { label: "Government", value: "GOVERNMENT" },
];

export default function DiscoverPage() {
  const [sector, setSector] = useState<SectorFilter>("all");
  const [searchSkill, setSearchSkill] = useState("");
  const [matchQuery, setMatchQuery] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<Awaited<ReturnType<typeof skillsApi.match>> | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const { data: gapSummary, loading: gapLoading, error: gapError } = useApi(
    () => skillsApi.gapSummary(sector, 20),
    [sector]
  );

  const doSearch = async () => {
    if (!searchSkill.trim()) return;
    setMatchLoading(true);
    setMatchError(null);
    setMatchResult(null);
    setMatchQuery(searchSkill.trim());
    try {
      const result = await skillsApi.match(searchSkill.trim(), 0.60, 8);
      setMatchResult(result);
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setMatchLoading(false);
    }
  };

  const gapSeverityColor = {
    none: "badge-green",
    low: "badge-blue",
    medium: "badge-amber",
    high: "badge-red",
  };

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
            Skill <span className="gradient-text">Discovery</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Search any skill to see how well it&apos;s covered by NSQF curricula,
            or explore top skill gaps in the market.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* ── Skill Search ── */}
          <div>
            <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Search size={16} style={{ color: "#6366f1" }} />
                Curriculum Coverage Search
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Enter a skill to find matching NSQF curriculum skills using AI
                vector similarity.
              </p>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <input
                  className="input-base"
                  placeholder="e.g. Machine Learning, Docker, SQL..."
                  value={searchSkill}
                  onChange={(e) => setSearchSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-primary"
                  onClick={doSearch}
                  disabled={!searchSkill.trim() || matchLoading}
                  style={{ flexShrink: 0 }}
                >
                  {matchLoading ? <Spinner size={16} /> : <Search size={16} />}
                  Search
                </button>
              </div>
            </div>

            {/* Match Results */}
            {matchLoading && (
              <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
                <Spinner size={28} />
                <p style={{ marginTop: "0.875rem", color: "var(--text-secondary)" }}>
                  Running vector similarity search...
                </p>
              </div>
            )}

            {matchError && <ErrorState message={matchError} onRetry={doSearch} />}

            {matchResult && (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>
                    Results for &quot;{matchQuery}&quot;
                  </h3>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span
                      className={`badge ${gapSeverityColor[matchResult.gap_severity]}`}
                    >
                      {matchResult.is_curriculum_gap ? (
                        <AlertTriangle size={10} />
                      ) : (
                        <CheckCircle size={10} />
                      )}
                      {matchResult.is_curriculum_gap
                        ? `Gap: ${matchResult.gap_severity}`
                        : "Curriculum covered"}
                    </span>
                  </div>
                </div>

                {matchResult.is_curriculum_gap && (
                  <div
                    style={{
                      padding: "0.875rem",
                      borderRadius: 8,
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      marginBottom: "1.25rem",
                      fontSize: "0.85rem",
                      color: "#f87171",
                    }}
                  >
                    <strong>Curriculum Gap Detected</strong> — This skill is not
                    well-covered by current NSQF curricula. It represents an
                    area where upskilling is needed.
                  </div>
                )}

                {matchResult.matches.length === 0 ? (
                  <EmptyState
                    title="No curriculum matches found"
                    description="This skill has no close matches in the NSQF curriculum database — confirming a significant gap."
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {matchResult.matches.map((match) => (
                      <div
                        key={match.skill_id}
                        style={{
                          padding: "0.875rem",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.375rem" }}>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.2rem" }}>
                              {match.skill_name}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {match.course_name} · NSQF Level {match.nsqf_level}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                            <span
                              className={`badge ${match.is_strong_match ? "badge-green" : "badge-amber"}`}
                              style={{ fontSize: "0.7rem" }}
                            >
                              {(match.similarity_score * 100).toFixed(0)}% match
                            </span>
                          </div>
                        </div>
                        <div className="progress-bar" style={{ marginTop: "0.5rem" }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${match.similarity_score * 100}%`,
                              background: match.is_strong_match
                                ? "linear-gradient(90deg, #10b981, #34d399)"
                                : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Gap Summary Sidebar ── */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <TrendingUp size={16} style={{ color: "#ef4444" }} />
                Top Skill Gaps
              </h2>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                {SECTORS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSector(s.value)}
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: 6,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1px solid",
                      background:
                        sector === s.value
                          ? "rgba(99,102,241,0.2)"
                          : "transparent",
                      borderColor:
                        sector === s.value
                          ? "rgba(99,102,241,0.4)"
                          : "var(--border)",
                      color:
                        sector === s.value ? "#a5b4fc" : "var(--text-muted)",
                      transition: "all 0.15s",
                    }}
                  >
                    {s.label === "All Sectors" ? "All" : s.label}
                  </button>
                ))}
              </div>
            </div>

            {gapLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <Spinner size={24} />
              </div>
            ) : gapError ? (
              <ErrorState message={gapError} />
            ) : !gapSummary || gapSummary.gaps.length === 0 ? (
              <EmptyState
                title="No gap data"
                description="Skill gap data not available."
                icon={<BookOpen size={24} />}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {gapSummary.gaps.map((gap, idx) => (
                  <button
                    key={`${gap.skill_name}-${idx}`}
                    onClick={() => {
                      setSearchSkill(gap.skill_name);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.625rem 0.75rem",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.35)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        width: 20,
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {gap.skill_name}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${Math.min(gap.peak_demand_percent, 100)}%` }} />
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", flexShrink: 0 }}>
                          {gap.peak_demand_percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${gap.sector_type === "PRIVATE" ? "badge-indigo" : "badge-green"}`} style={{ fontSize: "0.65rem", flexShrink: 0 }}>
                      {gap.sector_type === "PRIVATE" ? "Pvt" : "Govt"}
                    </span>
                    <Zap size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
