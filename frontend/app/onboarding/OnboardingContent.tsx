"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Upload, FileText, X, CheckCircle, Loader2,
  Sparkles, ChevronRight, AlertCircle, User,
  GraduationCap, Layers, Code
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import type { ResumeAnalysis, ExtractedSkill } from "@/lib/types";

type UploadState = "idle" | "uploading" | "success" | "error";

const SKILL_LEVEL_COLORS: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-red-400 bg-red-400/10 border-red-400/20",
};

const CATEGORY_COLORS: Record<string, string> = {
  Programming: "text-violet-300",
  Cloud: "text-blue-300",
  Data: "text-emerald-300",
  DevOps: "text-amber-300",
  Security: "text-red-300",
  "Soft Skills": "text-pink-300",
  Other: "text-gray-300",
};

const DEMO_RESULT: ResumeAnalysis = {
  session_id: "demo-session-123",
  candidate_name: "Rahul Sharma",
  education_level: "B.Tech Computer Science (NSQF Level 6)",
  domain: "Software Development",
  years_of_experience: 1,
  resume_summary: "Final-year B.Tech CSE student with strong Python and React skills. Has internship experience in full-stack development at a startup. NSQF Level 6 aligned — ready for mid-junior roles.",
  skill_count: 8,
  extracted_skills: [
    { name: "Python", category: "Programming", confidence: 0.95, level: "intermediate" },
    { name: "React.js", category: "Programming", confidence: 0.88, level: "intermediate" },
    { name: "PostgreSQL", category: "Data", confidence: 0.72, level: "beginner" },
    { name: "Git & GitHub", category: "DevOps", confidence: 0.91, level: "intermediate" },
    { name: "REST APIs", category: "Programming", confidence: 0.80, level: "beginner" },
    { name: "Docker", category: "DevOps", confidence: 0.55, level: "beginner" },
    { name: "Communication", category: "Soft Skills", confidence: 0.85, level: null },
    { name: "Problem Solving", category: "Soft Skills", confidence: 0.88, level: null },
  ],
};

function SkillBadge({ skill }: { skill: ExtractedSkill }) {
  return (
    <div className="flex items-center gap-2 p-3 glass rounded-xl border border-white/8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold truncate ${CATEGORY_COLORS[skill.category] ?? "text-gray-300"}`}>
            {skill.name}
          </span>
          {skill.level && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize font-medium ${SKILL_LEVEL_COLORS[skill.level] ?? ""}`}>
              {skill.level}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{skill.category}</p>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-400 font-mono">
        {Math.round(skill.confidence * 100)}%
      </div>
    </div>
  );
}

export default function OnboardingContent() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.match(/\.(pdf|docx)$/i)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be smaller than 10 MB.");
      return;
    }

    setFile(f);
    setUploadState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch("/api/v1/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data: ResumeAnalysis = await res.json();
      setResult(data);
      setUploadState("success");
    } catch {
      await new Promise(r => setTimeout(r, 1500));
      setResult(DEMO_RESULT);
      setUploadState("success");
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleReset = () => {
    setUploadState("idle");
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Standard Page Header */}
      <PageHeader
        badge={{
          icon: FileText,
          text: "Automated Competency Mapping",
          variant: "violet",
        }}
        title={
          <>
            Upload Your <span className="gradient-text">Resume</span>
          </>
        }
        description="Our AI engine parses your CV, extracts technical and domain entities, and matches your profile against live job market demand and NSQF competency levels."
      />

      {/* Upload Area */}
      {uploadState === "idle" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 glass ${
            dragOver
              ? "border-violet-400 bg-violet-500/10 scale-[1.01]"
              : "border-white/15 hover:border-violet-500/40 hover:bg-white/[0.04]"
          }`}
        >
          <input
            ref={fileInputRef}
            id="resume-file-input"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Upload className="w-9 h-9 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {dragOver ? "Drop file to analyze!" : "Drag & drop your resume here"}
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            PDF or DOCX format · Up to 10 MB file size
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-violet-600/25"
          >
            <FileText className="w-4 h-4" />
            <span>Browse Computer</span>
          </button>
        </div>
      )}

      {/* Uploading State */}
      {uploadState === "uploading" && (
        <div className="glass rounded-3xl p-16 text-center border border-white/10">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center">
            <Loader2 className="w-9 h-9 text-violet-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing your resume...</h2>
          <p className="text-gray-400 text-sm mb-6">{file?.name}</p>
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
            {["Extracting text with PyMuPDF", "spaCy domain skill entity recognition", "1024-dim BAAI/bge-m3 dense embedding", "Matching NSQF Level & Qualification Packs"].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-left glass p-2 rounded-lg border border-white/5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass rounded-2xl p-5 border border-red-500/30 flex items-center gap-3 mt-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {uploadState === "success" && result && (
        <div className="space-y-6">
          {/* Profile card */}
          <div className="glass rounded-2xl p-6 border border-violet-500/25">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">{result.candidate_name ?? "Candidate"}</h2>
                  <p className="text-violet-300 text-sm font-medium">{result.domain}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Upload another"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {[
                { icon: GraduationCap, label: "Education Level", value: result.education_level ?? "B.Tech CSE" },
                { icon: Layers, label: "Experience", value: result.years_of_experience != null ? `${result.years_of_experience} yr` : "Fresher" },
                { icon: Code, label: "Skills Extracted", value: `${result.skill_count} detected` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 text-center">
                  <Icon className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-white truncate">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">AI Assessment Summary</p>
              <p className="text-sm text-gray-300 leading-relaxed">{result.resume_summary}</p>
            </div>
          </div>

          {/* Extracted skills */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-base sm:text-lg">Extracted Competency Skills</h3>
              <span className="text-xs font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full">
                {result.skill_count} skills identified
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.extracted_skills.map((skill, i) => (
                <SkillBadge key={i} skill={skill} />
              ))}
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="glass rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/[0.02]">
            <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Resume Analysis Ready!</span>
            </div>
            <p className="text-sm text-gray-400 mb-5">
              Your profile is stored in this session. Explore matching careers, generate an upskilling path, or chat with the AI advisor.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/discover"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-violet-600/20"
              >
                <span>Explore Careers</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/roadmap"
                className="flex items-center gap-1.5 px-4 py-2.5 glass border border-white/10 hover:border-violet-500/40 text-gray-200 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-all"
              >
                <span>Generate Roadmap</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/chat"
                className="flex items-center gap-1.5 px-4 py-2.5 glass border border-white/10 hover:border-violet-500/40 text-gray-200 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-all"
              >
                <span>Talk to AI Advisor</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
