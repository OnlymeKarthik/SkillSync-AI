"use client";

import { useState, useRef } from "react";
import { resumeApi, careersApi } from "@/lib/api";
import { useSkillsStore } from "@/lib/store/skillsStore";
import { Spinner } from "@/components/ui/Loaders";
import { ErrorState } from "@/components/ui/States";
import type { ResumeAnalysis, CareerScore, Career } from "@/lib/types";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Star,
  XCircle,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { useApi } from "@/lib/hooks/useApi";

function SkillBadge({
  skill,
  type,
}: {
  skill: string;
  type: "matched" | "missing" | "partial";
}) {
  const styles = {
    matched: { cls: "badge-green", icon: <CheckCircle size={10} /> },
    missing: { cls: "badge-red", icon: <XCircle size={10} /> },
    partial: { cls: "badge-amber", icon: <AlertTriangle size={10} /> },
  }[type];
  return (
    <span className={`badge ${styles.cls}`}>
      {styles.icon}
      {skill}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 78,
          height: 78,
          borderRadius: "50%",
          background: "var(--bg-elevated)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const { setSkills } = useSkillsStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [score, setScore] = useState<CareerScore | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const { data: careersData } = useApi(() => careersApi.list({ page_size: 50 }), []);
  const careerList = careersData?.careers ?? [];

  const handleFile = async (file: File) => {
    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      setUploadError("Only PDF and DOCX files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setAnalysis(null);
    setScore(null);

    try {
      const result = await resumeApi.upload(file, selectedCareer || undefined);
      setAnalysis(result);
      // Share extracted skills with the global store
      const skillNames = result.extracted_skills.map((s) => s.name);
      setSkills(skillNames);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const scoreResume = async () => {
    if (!analysis || !selectedCareer) return;
    setScoring(true);
    setScoreError(null);
    try {
      const result = await resumeApi.scoreAgainstCareer(
        analysis.session_id,
        selectedCareer
      );
      setScore(result);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : "Scoring failed");
    } finally {
      setScoring(false);
    }
  };

  const readinessColor = {
    Ready: "#10b981",
    "Almost There": "#f59e0b",
    "Needs Work": "#ef4444",
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
            Resume <span className="gradient-text">Analyzer</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Upload your PDF or DOCX resume for instant AI skill extraction, then
            score it against your target career.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: analysis ? "1fr 1fr" : "1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* ── Upload Section ── */}
          <div>
            {/* Drop Zone */}
            <div
              className="glass-card"
              style={{
                padding: "2.5rem",
                borderStyle: dragOver ? "solid" : "dashed",
                borderWidth: 2,
                borderColor: dragOver
                  ? "rgba(99,102,241,0.6)"
                  : "rgba(255,255,255,0.12)",
                background: dragOver ? "rgba(99,102,241,0.06)" : undefined,
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
                marginBottom: "1rem",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
            >
              {uploading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <Spinner size={40} />
                  <p style={{ fontWeight: 600, fontSize: "1rem" }}>
                    Analyzing your resume...
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    AI is extracting your skills
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: "rgba(99,102,241,0.12)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#818cf8",
                    }}
                  >
                    <Upload size={24} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.4rem" }}>
                      Drop your resume here
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      or click to browse
                    </p>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    PDF or DOCX · Max 10MB
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            {uploadError && (
              <div
                style={{
                  padding: "0.875rem 1rem",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <AlertTriangle size={15} />
                {uploadError}
              </div>
            )}

            {/* Analysis result */}
            {analysis && (
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <CheckCircle size={18} style={{ color: "#34d399" }} />
                  <h2 style={{ fontWeight: 700, fontSize: "1rem" }}>
                    Resume Analyzed
                  </h2>
                </div>

                {analysis.candidate_name && (
                  <div style={{ marginBottom: "0.625rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Name: </span>
                    <span style={{ fontWeight: 600 }}>{analysis.candidate_name}</span>
                  </div>
                )}
                {analysis.education_level && (
                  <div style={{ marginBottom: "0.625rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Education: </span>
                    <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{analysis.education_level}</span>
                  </div>
                )}
                {analysis.years_of_experience != null && (
                  <div style={{ marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Experience: </span>
                    <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{analysis.years_of_experience} year{analysis.years_of_experience !== 1 ? "s" : ""}</span>
                  </div>
                )}

                {analysis.resume_summary && (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                    {analysis.resume_summary}
                  </p>
                )}

                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.625rem" }}>
                    Extracted Skills ({analysis.skill_count})
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {analysis.extracted_skills.map((s) => (
                      <span key={s.name} className="badge badge-indigo" style={{ fontSize: "0.72rem" }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Score against career
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <select
                      className="select-base"
                      value={selectedCareer}
                      onChange={(e) => setSelectedCareer(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select career...</option>
                      {careerList.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.title}</option>
                      ))}
                    </select>
                    <button
                      className="btn-primary"
                      onClick={scoreResume}
                      disabled={!selectedCareer || scoring}
                      style={{ flexShrink: 0 }}
                    >
                      {scoring ? <Spinner size={15} /> : <BarChart2 size={15} />}
                      Score
                    </button>
                  </div>
                  {scoreError && (
                    <p style={{ fontSize: "0.78rem", color: "#f87171", marginTop: "0.5rem" }}>
                      {scoreError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Score Result ── */}
          {score && (
            <div>
              <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
                  <ScoreRing score={score.match_score} />
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      Career Match Score
                    </p>
                    <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.375rem" }}>
                      {score.career_title}
                    </h2>
                    <span
                      className="badge"
                      style={{
                        background: `${readinessColor[score.readiness_label]}20`,
                        color: readinessColor[score.readiness_label],
                        border: `1px solid ${readinessColor[score.readiness_label]}40`,
                        fontSize: "0.78rem",
                      }}
                    >
                      <Star size={10} />
                      {score.readiness_label}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ padding: "0.875rem", borderRadius: 8, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <p style={{ fontSize: "0.7rem", color: "#34d399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Current Salary Est.</p>
                    <p style={{ fontWeight: 700 }}>{score.estimated_salary_current}</p>
                  </div>
                  <div style={{ padding: "0.875rem", borderRadius: 8, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <p style={{ fontSize: "0.7rem", color: "#818cf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>After Upskilling</p>
                    <p style={{ fontWeight: 700 }}>{score.estimated_salary_upskilled}</p>
                  </div>
                </div>

                {score.matched_skills.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                      ✓ Skills You Have ({score.matched_skills.length})
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {score.matched_skills.map((s) => <SkillBadge key={s} skill={s} type="matched" />)}
                    </div>
                  </div>
                )}

                {score.missing_skills.length > 0 && (
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                      ✗ Skills to Learn ({score.missing_skills.length})
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {score.missing_skills.map((s) => <SkillBadge key={s} skill={s} type="missing" />)}
                    </div>
                  </div>
                )}

                <Link
                  href={`/roadmap?career=${score.career_slug}`}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                >
                  Generate Learning Roadmap
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
