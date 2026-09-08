"use client";

import Link from "next/link";
import { useApi } from "@/lib/hooks/useApi";
import { dashboardApi } from "@/lib/api";
import {
  LayoutDashboard,
  Map,
  Bot,
  FileText,
  Search,
  Network,
  ArrowRight,
  Briefcase,
  TrendingUp,
  BookOpen,
  Zap,
} from "lucide-react";



export default function HomePage() {
  const { data: stats } = useApi(() => dashboardApi.getStats(), []);

  const features = [
    {
      icon: LayoutDashboard,
      title: "Skill Gap Dashboard",
      description:
        "Real-time analytics comparing industry skill demand vs. NSQF curriculum coverage — split by private and government sectors.",
      href: "/dashboard",
      color: "#6366f1",
    },
    {
      icon: Briefcase,
      title: "Career Explorer",
      description:
        "Browse 12 curated tech careers with salary ranges, growth rates, NSQF levels, and required skills.",
      href: "/careers",
      color: "#8b5cf6",
    },
    {
      icon: Map,
      title: "AI Roadmap Generator",
      description:
        "Get a personalized, stage-by-stage learning roadmap powered by LangGraph + Groq LLM, with free (SWAYAM/NPTEL) and paid resources.",
      href: "/roadmap",
      color: "#10b981",
    },
    {
      icon: Bot,
      title: "AI Career Advisor",
      description:
        "Chat with an AI career counselor trained on the Indian job market, NSQF framework, and skill development pathways.",
      href: "/chat",
      color: "#f59e0b",
    },
    {
      icon: FileText,
      title: "Resume Analyzer",
      description:
        "Upload your PDF/DOCX resume for instant AI skill extraction, and score it against your target career.",
      href: "/resume",
      color: "#3b82f6",
    },
    {
      icon: Network,
      title: "Knowledge Graph",
      description:
        "Explore skill relationships and career paths through a live D3 force-directed graph powered by Neo4j.",
      href: "/graph",
      color: "#ec4899",
    },
  ];

  const statItems = stats
    ? [
        {
          value: stats.total_jobs_scraped.toLocaleString(),
          label: "Job Postings Indexed",
          color: "#6366f1",
        },
        {
          value: stats.total_skill_gaps.toLocaleString(),
          label: "Skill Gaps Identified",
          color: "#ef4444",
        },
        {
          value: stats.total_curriculum_skills.toLocaleString(),
          label: "NSQF Curriculum Skills",
          color: "#10b981",
        },
        {
          value: "12",
          label: "Tech Career Tracks",
          color: "#f59e0b",
        },
      ]
    : null;

  return (
    <div>
      {/* ── Hero Section ────────────────────────────────── */}
      <section
        style={{
          padding: "6rem 0 5rem",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid decoration */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />

        <div className="container-page" style={{ position: "relative" }}>
          {/* Tag line */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 100,
              padding: "0.375rem 0.875rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#a5b4fc",
              marginBottom: "1.75rem",
            }}
          >
            <Zap size={12} />
            AI-Powered Career Intelligence — India 2026
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
              maxWidth: 760,
            }}
          >
            Bridge the Gap Between{" "}
            <span className="gradient-text">NSQF Curriculum</span> and Industry
            Demand
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: 580,
              marginBottom: "2.5rem",
            }}
          >
            Vidyavani analyses real job market data to identify skill gaps in
            Indian curricula, then generates personalized AI roadmaps to help
            you land your target career — in the private or government sector.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
            <Link href="/roadmap" className="btn-primary" style={{ fontSize: "0.95rem", padding: "0.75rem 1.5rem" }}>
              Generate My Roadmap
              <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard" className="btn-secondary" style={{ fontSize: "0.95rem", padding: "0.75rem 1.5rem" }}>
              <LayoutDashboard size={16} />
              View Gap Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Stats Strip ─────────────────────────────── */}
      {statItems && (
        <section
          style={{
            padding: "2rem 0",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}
        >
          <div className="container-page">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {statItems.map((item) => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      color: item.color,
                      letterSpacing: "-0.03em",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Feature Cards ─────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-page">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "0.75rem",
              }}
            >
              Everything You Need to Navigate Your Career
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              From skill gap analysis to AI-generated roadmaps — built for
              students, freshers, and upskilling professionals.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.75rem",
                      height: "100%",
                      cursor: "pointer",
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = "translateY(-3px)";
                      el.style.boxShadow = `0 8px 30px rgba(0,0,0,0.3)`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${feature.color}20`,
                        border: `1px solid ${feature.color}35`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: feature.color,
                        marginBottom: "1rem",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        marginBottom: "1rem",
                      }}
                    >
                      {feature.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: feature.color,
                      }}
                    >
                      Explore
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section
        style={{
          padding: "4rem 0",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="container-page">
          <h2
            style={{
              fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "2.5rem",
              textAlign: "center",
            }}
          >
            How Vidyavani Works
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              {
                step: "01",
                icon: <FileText size={22} />,
                title: "Upload Your Resume",
                desc: "We extract your skills using AI and build your profile.",
                color: "#6366f1",
              },
              {
                step: "02",
                icon: <TrendingUp size={22} />,
                title: "Analyze the Gap",
                desc: "We compare your skills against real job postings and NSQF curricula.",
                color: "#8b5cf6",
              },
              {
                step: "03",
                icon: <Map size={22} />,
                title: "Generate Roadmap",
                desc: "Get a personalized AI roadmap with free SWAYAM/NPTEL resources.",
                color: "#10b981",
              },
              {
                step: "04",
                icon: <BookOpen size={22} />,
                title: "Learn & Track",
                desc: "Follow your personalized roadmap and chat with the AI advisor anytime.",
                color: "#f59e0b",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass-card"
                style={{ padding: "1.5rem", textAlign: "center" }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: item.color,
                    letterSpacing: "0.1em",
                    marginBottom: "0.75rem",
                    opacity: 0.7,
                  }}
                >
                  STEP {item.step}
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.color,
                    margin: "0 auto 1rem",
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-page" style={{ textAlign: "center" }}>
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: "var(--radius-xl)",
              padding: "3rem 2rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "1rem",
              }}
            >
              Ready to Discover Your Career Path?
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                marginBottom: "2rem",
                maxWidth: 480,
                margin: "0 auto 2rem",
              }}
            >
              Upload your resume or start exploring careers — free, no sign-up
              required.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="/resume" className="btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}>
                <FileText size={16} />
                Analyze My Resume
              </Link>
              <Link href="/careers" className="btn-secondary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}>
                <Search size={16} />
                Browse Careers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
