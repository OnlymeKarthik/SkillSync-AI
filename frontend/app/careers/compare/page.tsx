"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { careersApi } from "@/lib/api";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { Spinner } from "@/components/ui/Loaders";
import type { Career } from "@/lib/types";
import { X, Plus, BarChart2, TrendingUp, IndianRupee } from "lucide-react";
import Link from "next/link";

const ALL_SLUGS = [
  "ml-engineer",
  "data-scientist",
  "data-engineer",
  "cloud-architect",
  "devops-engineer",
  "fullstack-developer",
  "backend-developer",
  "cybersecurity-analyst",
  "product-manager",
  "ux-designer",
  "it-officer-banking",
  "govt-data-analyst",
];

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "—";
  const fmt = (n: number) =>
    n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${fmt(min)}–${fmt(max)}`;
  if (min) return `₹${fmt(min)}+`;
  return "—";
}

const diffBadge: Record<string, string> = {
  beginner: "badge-green",
  intermediate: "badge-amber",
  advanced: "badge-red",
};

function ComparePageContent() {
  const searchParams = useSearchParams();
  const initialSlugs = searchParams.get("slugs")?.split(",").filter(Boolean) ?? [];
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    initialSlugs.slice(0, 4)
  );
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSlugs.length === 0) {
      setCareers([]);
      return;
    }
    setLoading(true);
    setError(null);
    careersApi
      .compare(selectedSlugs)
      .then((res) => setCareers(res.careers))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedSlugs]);

  const addSlug = (slug: string) => {
    if (selectedSlugs.includes(slug) || selectedSlugs.length >= 4) return;
    setSelectedSlugs([...selectedSlugs, slug]);
  };

  const removeSlug = (slug: string) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  const availableSlugs = ALL_SLUGS.filter((s) => !selectedSlugs.includes(s));

  const compareRows = [
    {
      label: "Difficulty",
      render: (c: Career) =>
        c.difficulty ? (
          <span className={`badge ${diffBadge[c.difficulty]}`}>
            {c.difficulty}
          </span>
        ) : (
          "—"
        ),
    },
    {
      label: "Domain",
      render: (c: Career) => (
        <span className="badge badge-indigo">{c.domain}</span>
      ),
    },
    {
      label: "Salary Range",
      render: (c: Career) => formatSalary(c.avg_salary_min, c.avg_salary_max),
    },
    {
      label: "Annual Growth",
      render: (c: Career) =>
        c.growth_rate != null ? (
          <span style={{ color: "#34d399", fontWeight: 600 }}>
            {c.growth_rate}%
          </span>
        ) : (
          "—"
        ),
    },
    {
      label: "NSQF Levels",
      render: (c: Career) =>
        c.nsqf_levels?.length ? `Level ${c.nsqf_levels.join(", ")}` : "—",
    },
    {
      label: "Top Skills",
      render: (c: Career) => {
        const skills = (c.top_skills ?? []).filter(Boolean).slice(0, 5);
        return skills.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {skills.map((s) => (
              <span key={s} className="badge badge-gray" style={{ fontSize: "0.68rem" }}>
                {s}
              </span>
            ))}
          </div>
        ) : (
          "—"
        );
      },
    },
  ];

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
            Career <span className="gradient-text">Comparison</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Compare up to 4 tech careers side by side — salary, growth,
            difficulty, and required skills.
          </p>
        </div>

        {/* Career selector */}
        <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                marginBottom: "0.75rem",
              }}
            >
              Selected ({selectedSlugs.length}/4)
            </h2>
            {selectedSlugs.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {selectedSlugs.map((slug) => (
                  <button
                    key={slug}
                    onClick={() => removeSlug(slug)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.3rem 0.65rem",
                      borderRadius: 100,
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#a5b4fc",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {slug}
                    <X size={11} />
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                No careers selected. Add up to 4 below.
              </p>
            )}
          </div>

          {selectedSlugs.length < 4 && (
            <div>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: "0.625rem",
                  color: "var(--text-muted)",
                }}
              >
                Add career
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {availableSlugs.map((slug) => (
                  <button
                    key={slug}
                    onClick={() => addSlug(slug)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.3rem 0.65rem",
                      borderRadius: 100,
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(99,102,241,0.4)";
                      (e.currentTarget as HTMLElement).style.color = "#a5b4fc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border)";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-secondary)";
                    }}
                  >
                    <Plus size={11} />
                    {slug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comparison table */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "3rem",
            }}
          >
            <Spinner size={32} />
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : careers.length === 0 ? (
          <EmptyState
            title="No careers selected"
            description="Select at least 1 career above to see the comparison."
            icon={<BarChart2 size={24} />}
          />
        ) : (
          <div
            className="glass-card"
            style={{ overflow: "auto", padding: 0 }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 600,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "1rem 1.25rem",
                      textAlign: "left",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.03)",
                      minWidth: 130,
                    }}
                  >
                    Attribute
                  </th>
                  {careers.map((c) => (
                    <th
                      key={c.slug}
                      style={{
                        padding: "1rem 1.25rem",
                        textAlign: "left",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        borderBottom: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.03)",
                        verticalAlign: "top",
                      }}
                    >
                      <div>{c.title}</div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          fontWeight: 400,
                          marginTop: "0.2rem",
                        }}
                      >
                        {c.slug}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, rowIdx) => (
                  <tr
                    key={row.label}
                    style={{
                      background:
                        rowIdx % 2 === 0
                          ? "transparent"
                          : "rgba(255,255,255,0.015)",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.875rem 1.25rem",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.label}
                    </td>
                    {careers.map((c) => (
                      <td
                        key={c.slug}
                        style={{
                          padding: "0.875rem 1.25rem",
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {row.render(c)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Action row */}
                <tr>
                  <td
                    style={{
                      padding: "1rem 1.25rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                    }}
                  >
                    Actions
                  </td>
                  {careers.map((c) => (
                    <td
                      key={c.slug}
                      style={{ padding: "1rem 1.25rem" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        <Link
                          href={`/roadmap?career=${c.slug}`}
                          className="btn-primary"
                          style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
                        >
                          <TrendingUp size={12} />
                          Get Roadmap
                        </Link>
                        <Link
                          href={`/careers/${c.slug}`}
                          className="btn-secondary"
                          style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
                        >
                          <IndianRupee size={12} />
                          View Details
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="section-padding container-page"><Spinner size={32} /></div>}>
      <ComparePageContent />
    </Suspense>
  );
}
