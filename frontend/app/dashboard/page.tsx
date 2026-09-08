"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/useApi";
import { dashboardApi, skillsApi } from "@/lib/api";
import { StatCard } from "@/components/charts/StatCard";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { StatCardSkeleton, Skeleton } from "@/components/ui/Loaders";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SectorFilter } from "@/lib/types";
import {
  Briefcase,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

const SECTORS: { label: string; value: SectorFilter }[] = [
  { label: "All Sectors", value: "all" },
  { label: "Private", value: "PRIVATE" },
  { label: "Government", value: "GOVERNMENT" },
];

export default function DashboardPage() {
  const [sector, setSector] = useState<SectorFilter>("all");

  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useApi(() => dashboardApi.getStats(), []);

  const {
    data: gapData,
    loading: gapLoading,
    error: gapError,
    refetch: refetchGap,
  } = useApi(() => dashboardApi.getGapAnalysis(sector, 15), [sector]);

  const {
    data: gapSummary,
    loading: summaryLoading,
  } = useApi(() => skillsApi.gapSummary("all", 15), []);

  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Skill Gap{" "}
            <span className="gradient-text">Analytics Dashboard</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Real-time comparison of industry skill demand vs. NSQF curriculum
            coverage
          </p>
        </div>

        {/* KPI Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2.5rem",
          }}
        >
          {statsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : statsError ? (
            <div style={{ gridColumn: "1/-1" }}>
              <ErrorState message={statsError} onRetry={refetchStats} />
            </div>
          ) : stats ? (
            <>
              <StatCard
                label="Total Jobs Indexed"
                value={stats.total_jobs_scraped.toLocaleString()}
                subtitle={`${stats.total_private_jobs} private · ${stats.total_govt_jobs} govt`}
                icon={<Briefcase size={18} />}
                color="indigo"
              />
              <StatCard
                label="Private Sector Jobs"
                value={stats.total_private_jobs.toLocaleString()}
                subtitle="From Naukri, LinkedIn"
                icon={<TrendingUp size={18} />}
                color="blue"
              />
              <StatCard
                label="Government Jobs"
                value={stats.total_govt_jobs.toLocaleString()}
                subtitle="From NCS, SSC portals"
                icon={<Briefcase size={18} />}
                color="green"
              />
              <StatCard
                label="NSQF Curriculum Skills"
                value={stats.total_curriculum_skills.toLocaleString()}
                subtitle="Across all courses & sectors"
                icon={<BookOpen size={18} />}
                color="amber"
              />
              <StatCard
                label="Identified Skill Gaps"
                value={stats.total_skill_gaps.toLocaleString()}
                subtitle="High-demand, low-coverage"
                icon={<AlertTriangle size={18} />}
                color="red"
              />
            </>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* ── Skill Demand Chart ── */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Skill Demand by Sector
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Top skills demanded in job postings (last 30 days)
                </p>
              </div>

              {/* Sector filter pills */}
              <div style={{ display: "flex", gap: "0.375rem" }}>
                {SECTORS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSector(s.value)}
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: 100,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1px solid",
                      transition: "all 0.15s",
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
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {gapLoading ? (
              <div style={{ height: 340 }}>
                <Skeleton height="100%" borderRadius={10} />
              </div>
            ) : gapError ? (
              <ErrorState message={gapError} onRetry={refetchGap} />
            ) : !gapData || gapData.chart_data.length === 0 ? (
              <EmptyState
                title="No recent chart data"
                description="The gap analysis chart requires job postings from the last 30 days. Data from initial seed is older than 30 days."
                icon={<AlertTriangle size={24} />}
              />
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={gapData.chart_data}
                  margin={{ top: 5, right: 10, left: -10, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="skill"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#1a2236",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#f1f5f9", fontWeight: 600 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  />
                  <Bar
                    dataKey="Private Sector"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Government"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Skill Gap Summary ── */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  marginBottom: "0.25rem",
                }}
              >
                Top Skill Gaps
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                High-demand skills with curriculum coverage gaps
              </p>
            </div>

            {summaryLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} height={52} borderRadius={8} />
                ))}
              </div>
            ) : gapSummary && gapSummary.gaps.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {gapSummary.gaps.map((gap, idx) => (
                  <div
                    key={`${gap.skill_name}-${gap.sector_type}-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.625rem 0.75rem",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        width: 22,
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                          marginBottom: "0.2rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {gap.skill_name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(gap.peak_demand_percent, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            flexShrink: 0,
                          }}
                        >
                          {gap.peak_demand_percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        gap.sector_type === "PRIVATE"
                          ? "badge-indigo"
                          : "badge-green"
                      }`}
                    >
                      {gap.sector_type === "PRIVATE" ? "Pvt" : "Govt"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No gap data"
                description="Skill gap data will appear after job postings are scraped."
              />
            )}
          </div>
        </div>

        {/* Info notice */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "0.875rem 1.125rem",
            borderRadius: 10,
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.82rem",
            color: "#93c5fd",
          }}
        >
          <RefreshCw size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Note:</strong> The skill demand chart shows data from the last 30 days. Current seeded data is from the initial database load. The Skill Gaps panel below uses all-time data and shows current results.
          </span>
        </div>
      </div>
    </div>
  );
}
