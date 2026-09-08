import { careersApi } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TrendingUp,
  IndianRupee,
  BarChart2,
  ArrowRight,
  Star,
  ChevronLeft,
  Map,
  Bot,
} from "lucide-react";

const difficultyColor = {
  beginner: "badge-green",
  intermediate: "badge-amber",
  advanced: "badge-red",
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "Not specified";
  const fmt = (n: number) =>
    n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `₹${fmt(min)} – ₹${fmt(max)} / month`;
  if (min) return `₹${fmt(min)}+ / month`;
  return "";
}

function importanceBadge(importance: number) {
  if (importance >= 0.9) return { label: "Required", cls: "badge-red" };
  if (importance >= 0.7) return { label: "Important", cls: "badge-amber" };
  return { label: "Nice to have", cls: "badge-gray" };
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let career;
  try {
    career = await careersApi.getBySlug(slug);
  } catch {
    notFound();
  }

  const requiredSkills = (career.required_skills ?? []).filter(
    (s) => s.skill !== null
  );

  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Back link */}
        <Link
          href="/careers"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "1.75rem",
            transition: "color 0.15s",
          }}
        >
          <ChevronLeft size={15} />
          Back to Careers
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "1.75rem",
            alignItems: "start",
          }}
        >
          {/* ── Main Content ── */}
          <div>
            {/* Header */}
            <div
              className="glass-card"
              style={{ padding: "2rem", marginBottom: "1.5rem" }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginBottom: "1rem",
                }}
              >
                <span className="badge badge-indigo">{career.domain}</span>
                {career.difficulty && (
                  <span
                    className={`badge ${difficultyColor[career.difficulty]}`}
                  >
                    {career.difficulty}
                  </span>
                )}
                {career.nsqf_levels?.map((lvl) => (
                  <span key={lvl} className="badge badge-purple">
                    NSQF Level {lvl}
                  </span>
                ))}
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  marginBottom: "0.75rem",
                }}
              >
                {career.title}
              </h1>

              {career.description && (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    marginBottom: "1.5rem",
                  }}
                >
                  {career.description}
                </p>
              )}

              {/* Metrics */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: 10,
                    background: "rgba(13,148,136,0.08)",
                    border: "1px solid rgba(13,148,136,0.15)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      color: "#2dd4bf",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <IndianRupee size={13} />
                    Salary Range
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatSalary(career.avg_salary_min, career.avg_salary_max)}
                  </div>
                </div>

                {career.growth_rate != null && (
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: 10,
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.15)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        color: "#34d399",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <TrendingUp size={13} />
                      Annual Growth
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {career.growth_rate}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Required Skills */}
            {requiredSkills.length > 0 && (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Star size={16} style={{ color: "#f59e0b" }} />
                  Required Skills ({requiredSkills.length})
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                  }}
                >
                  {requiredSkills.map((item) => {
                    const badge = importanceBadge(item.importance);
                    return (
                      <div
                        key={item.skill}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.625rem 0.875rem",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          {item.skill}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: 80,
                              height: 4,
                              borderRadius: 2,
                              background: "rgba(255,255,255,0.1)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${item.importance * 100}%`,
                                height: "100%",
                                background:
                                  "linear-gradient(90deg, #0d9488, #14b8a6)",
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <span className={`badge ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              position: "sticky",
              top: 80,
            }}
          >
            {/* Generate Roadmap */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: "0.5rem",
                }}
              >
                Ready to get started?
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  marginBottom: "1.25rem",
                  lineHeight: 1.6,
                }}
              >
                Generate a personalized AI learning roadmap tailored to this
                career path.
              </p>
              <Link
                href={`/roadmap?career=${slug}`}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Map size={15} />
                Generate AI Roadmap
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Chat */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: "0.5rem",
                }}
              >
                Have questions?
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  marginBottom: "1.25rem",
                  lineHeight: 1.6,
                }}
              >
                Chat with the AI Career Advisor for personalized guidance on
                this career.
              </p>
              <Link
                href="/chat"
                className="btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Bot size={15} />
                Ask AI Advisor
              </Link>
            </div>

            {/* Compare */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: "0.5rem",
                }}
              >
                Exploring options?
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  marginBottom: "1.25rem",
                  lineHeight: 1.6,
                }}
              >
                Compare this career side-by-side with up to 3 others.
              </p>
              <Link
                href={`/careers/compare?slugs=${slug}`}
                className="btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <BarChart2 size={15} />
                Compare Careers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
