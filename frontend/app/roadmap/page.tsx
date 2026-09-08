"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { careersApi, streamRoadmap } from "@/lib/api";
import { useSkillsStore } from "@/lib/store/skillsStore";
import { TagInput } from "@/components/ui/TagInput";
import { ErrorState } from "@/components/ui/States";
import { Spinner } from "@/components/ui/Loaders";
import type { Career, RoadmapItem, RoadmapStage, RoadmapDecision, TrackPreference } from "@/lib/types";
import {
  Map,
  CheckCircle,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
} from "lucide-react";

const TRACKS: { label: string; value: TrackPreference; desc: string }[] = [
  { label: "Free", value: "free", desc: "SWAYAM, NPTEL, YouTube" },
  { label: "Paid", value: "paid", desc: "Coursera, Udemy" },
  { label: "Hybrid", value: "hybrid", desc: "Best of both" },
];

const TIMELINES = [4, 8, 12, 16, 20, 24, 36, 52];
const LEVELS = ["beginner", "intermediate", "advanced"] as const;

function isDecision(item: RoadmapItem): item is RoadmapDecision {
  return item.is_decision_point === true;
}

function StageCard({ stage }: { stage: RoadmapStage }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div
      className="glass-card"
      style={{ padding: "1.5rem", overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", gap: "0.875rem", flex: 1 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "white",
              flexShrink: 0,
            }}
          >
            {stage.stage}
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>
              {stage.title}
            </h3>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Clock size={12} />
                {stage.duration_weeks} week{stage.duration_weeks !== 1 ? "s" : ""}
              </span>
              {stage.skills?.slice(0, 3).map((s) => (
                <span key={s} className="badge badge-purple" style={{ fontSize: "0.68rem" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ color: "var(--text-muted)", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: "1.25rem", paddingLeft: "2.75rem" }}>
          {stage.description && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "1rem",
              }}
            >
              {stage.description}
            </p>
          )}

          {stage.milestone && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.75rem",
                borderRadius: 8,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                marginBottom: "1rem",
              }}
            >
              <CheckCircle
                size={15}
                style={{ color: "#34d399", marginTop: 2, flexShrink: 0 }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#34d399",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.25rem",
                  }}
                >
                  Milestone
                </p>
                <p
                  style={{
                    fontSize: "0.83rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {stage.milestone}
                </p>
              </div>
            </div>
          )}

          {stage.resources && stage.resources.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.625rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <BookOpen size={12} />
                Resources
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {stage.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.625rem 0.875rem",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      textDecoration: "none",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(13,148,136,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "var(--border)";
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {res.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {res.platform} · {res.duration_hrs}h
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        className={`badge ${res.type === "free" ? "badge-green" : "badge-amber"}`}
                      >
                        {res.type}
                      </span>
                      <ExternalLink
                        size={13}
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DecisionCard({
  decision,
}: {
  decision: RoadmapDecision;
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "1.5rem",
        border: "1px solid rgba(245,158,11,0.25)",
        background: "rgba(245,158,11,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(245,158,11,0.2)",
            border: "1px solid rgba(245,158,11,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fbbf24",
          }}
        >
          <Zap size={16} />
        </div>
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#fbbf24",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.2rem",
            }}
          >
            Decision Point
          </p>
          <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            {decision.question}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {decision.options?.map((opt) => (
          <div
            key={opt.label}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "0.875rem",
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
              }}
            >
              {opt.label}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {opt.next_skills?.map((s) => (
                <span key={s} className="badge badge-gray" style={{ fontSize: "0.68rem" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapContent() {
  const searchParams = useSearchParams();
  const initialCareer = searchParams.get("career") ?? "";

  const { skills, setSkills } = useSkillsStore();
  const [careerList, setCareerList] = useState<Career[]>([]);
  const [targetCareer, setTargetCareer] = useState(initialCareer);
  const [track, setTrack] = useState<TrackPreference>("hybrid");
  const [timeline, setTimeline] = useState(12);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [streamText, setStreamText] = useState("");
  const [stages, setStages] = useState<RoadmapItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    careersApi.list({ page_size: 50 }).then((r) => setCareerList(r.careers)).catch(() => {});
  }, []);

  const generate = async () => {
    if (!targetCareer) return;
    setStatus("streaming");
    setStreamText("");
    setStages([]);
    setErrorMsg("");

    try {
      const gen = streamRoadmap({
        target_career_slug: targetCareer,
        current_skills: skills,
        track_preference: track,
        timeline_weeks: timeline,
        experience_level: level,
      });

      for await (const msg of gen) {
        if (msg.error) {
          setErrorMsg(msg.error);
          setStatus("error");
          return;
        }
        if (msg.chunk) {
          setStreamText((t) => t + msg.chunk);
        }
        if (msg.done && msg.stages) {
          setStages(msg.stages as RoadmapItem[]);
          setStatus("done");
          return;
        }
      }
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
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
            AI <span className="gradient-text">Roadmap Generator</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Get a personalized multi-stage learning roadmap powered by LangGraph
            + Groq, with free SWAYAM/NPTEL and paid Coursera resources.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: status === "idle" ? "1fr" : "380px 1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* ── Form ── */}
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Map size={16} style={{ color: "#0d9488" }} />
              Configure Your Roadmap
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Target career */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Target Career *
                </label>
                <select
                  className="select-base"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <option value="">Select a career...</option>
                  {careerList.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current skills */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Your Current Skills
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--text-muted)",
                      marginLeft: "0.4rem",
                    }}
                  >
                    (press Enter to add)
                  </span>
                </label>
                <TagInput
                  tags={skills}
                  onChange={setSkills}
                  placeholder="e.g. Python, SQL, Docker..."
                />
              </div>

              {/* Track */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Learning Track
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {TRACKS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTrack(t.value)}
                      style={{
                        flex: 1,
                        padding: "0.625rem",
                        borderRadius: 10,
                        border: "1px solid",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        textAlign: "center",
                        transition: "all 0.15s",
                        background:
                          track === t.value
                            ? "rgba(13,148,136,0.15)"
                            : "transparent",
                        borderColor:
                          track === t.value
                            ? "rgba(13,148,136,0.4)"
                            : "var(--border)",
                        color:
                          track === t.value
                            ? "#5eead4"
                            : "var(--text-secondary)",
                      }}
                    >
                      <div>{t.label}</div>
                      <div
                        style={{
                          fontWeight: 400,
                          fontSize: "0.7rem",
                          marginTop: "0.2rem",
                          color:
                            track === t.value
                              ? "#5eead4"
                              : "var(--text-muted)",
                        }}
                      >
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Timeline: {timeline} weeks
                </label>
                <select
                  className="select-base"
                  value={timeline}
                  onChange={(e) => setTimeline(Number(e.target.value))}
                  style={{ width: "100%" }}
                >
                  {TIMELINES.map((w) => (
                    <option key={w} value={w}>
                      {w} weeks ({Math.round(w / 4)} months)
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Experience Level
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        borderRadius: 8,
                        border: "1px solid",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        textAlign: "center",
                        transition: "all 0.15s",
                        background:
                          level === l
                            ? "rgba(13,148,136,0.15)"
                            : "transparent",
                        borderColor:
                          level === l
                            ? "rgba(13,148,136,0.4)"
                            : "var(--border)",
                        color:
                          level === l ? "#5eead4" : "var(--text-secondary)",
                        textTransform: "capitalize",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                className="btn-primary"
                onClick={generate}
                disabled={!targetCareer || status === "streaming"}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "0.75rem",
                  fontSize: "0.95rem",
                  marginTop: "0.25rem",
                }}
              >
                {status === "streaming" ? (
                  <>
                    <Spinner size={16} />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Map size={16} />
                    Generate Roadmap
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Roadmap Output ── */}
          {(status === "streaming" || status === "done" || status === "error") && (
            <div>
              {status === "error" && (
                <ErrorState message={errorMsg} onRetry={generate} />
              )}

              {status === "streaming" && stages.length === 0 && (
                <div className="glass-card" style={{ padding: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <Spinner size={20} />
                    <span
                      style={{ fontWeight: 600, fontSize: "0.95rem" }}
                    >
                      Generating your personalized roadmap...
                    </span>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "1rem",
                      fontFamily: "monospace",
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                      maxHeight: 200,
                      overflowY: "auto",
                    }}
                  >
                    <span className={streamText ? "streaming-cursor" : ""}>
                      {streamText || "Consulting knowledge graph..."}
                    </span>
                  </div>
                </div>
              )}

              {stages.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <CheckCircle size={20} style={{ color: "#34d399" }} />
                    <h2 style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                      Your Learning Roadmap ({stages.length} stages)
                    </h2>
                    {status === "streaming" && <Spinner size={16} />}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {stages.map((item, idx) =>
                      isDecision(item) ? (
                        <DecisionCard key={idx} decision={item} />
                      ) : (
                        <StageCard key={idx} stage={item} />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div style={{ padding: "4rem" }}><Spinner size={32} /></div>}>
      <RoadmapContent />
    </Suspense>
  );
}
