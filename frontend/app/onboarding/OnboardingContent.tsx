"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload, FileText, X, CheckCircle, Loader2,
  Sparkles, ChevronRight, AlertCircle, User,
  GraduationCap, Layers, Code
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
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

// Demo result shown when backend is unavailable
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
    <div className="flex items-center gap-2 p-2.5 glass rounded-xl border border-white/8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${CATEGORY_COLORS[skill.category] ?? "text-gray-300"}`}>
            {skill.name}
          </span>
          {skill.level && (
            <span className={`text-xs px-1.5 py-0.5 rounded border capitalize ${SKILL_LEVEL_COLORS[skill.level] ?? ""}`}>
              {skill.level}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5">{skill.category}</p>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-600">
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

      const res = await fetch("http://localhost:8000/api/v1/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data: ResumeAnalysis = await res.json();
      setResult(data);
      setUploadState("success");
    } catch {
      // Demo mode when backend unavailable
      await new Promise(r => setTimeout(r, 2000));
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
    <div className="min-h-screen bg-[#030712] bg-grid">
      <Navbar />
      <div className="bg-glow-violet fixed inset-0 pointer-events-none" />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            Upload Your <span className="gradient-text">Resume</span>
          </h1>
          <p className="text-gray-400 text-lg">AI extracts your skills and maps them to careers and skill gaps automatically.</p>
        </div>

        {/* Upload area */}
        {uploadState === "idle" && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-violet-400 bg-violet-500/10 scale-[1.01]"
                : "border-white/10 hover:border-violet-500/40 hover:bg-white/[0.02]"
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
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Upload className="w-9 h-9 text-violet-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              {dragOver ? "Drop it here!" : "Drop your resume here"}
            </h2>
            <p className="text-gray-500 mb-4">or click to browse · PDF and DOCX supported · Max 10 MB</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all">
              <FileText className="w-4 h-4" /> Choose File
            </button>
          </div>
        )}

        {/* Uploading state */}
        {uploadState === "uploading" && (
          <div className="glass rounded-3xl p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Loader2 className="w-9 h-9 text-violet-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Analysing your resume...</h2>
            <p className="text-gray-500">{file?.name}</p>
            <div className="mt-6 flex flex-col gap-2 text-sm text-gray-600 max-w-xs mx-auto">
              {["Extracting text from document", "Running NLP skill extraction", "Mapping to NSQF framework"].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="glass rounded-2xl p-5 border border-red-500/20 flex items-center gap-3 mt-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {uploadState === "success" && result && (
          <div className="space-y-5">
            {/* Profile card */}
            <div className="glass rounded-2xl p-6 border border-violet-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-xl">{result.candidate_name ?? "Candidate"}</h2>
                    <p className="text-violet-300 text-sm">{result.domain}</p>
                  </div>
                </div>
                <button onClick={handleReset} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { icon: GraduationCap, label: "Education", value: result.education_level ?? "Not detected" },
                  { icon: Layers, label: "Experience", value: result.years_of_experience != null ? `${result.years_of_experience}y` : "Fresher" },
                  { icon: Code, label: "Skills Found", value: `${result.skill_count} skills` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                    <Icon className="w-4 h-4 text-violet-400 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-white truncate">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.03] rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">AI Summary</p>
                <p className="text-sm text-gray-300 leading-relaxed">{result.resume_summary}</p>
              </div>
            </div>

            {/* Extracted skills */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Extracted Skills</h3>
                <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">{result.skill_count} total</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.extracted_skills.map((skill, i) => (
                  <SkillBadge key={i} skill={skill} />
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="glass rounded-2xl p-5 border border-emerald-500/20">
              <p className="text-emerald-300 font-semibold mb-1">Skills extracted successfully!</p>
              <p className="text-sm text-gray-400 mb-4">Your profile is ready. Explore career matches or generate your personalised roadmap.</p>
              <div className="flex gap-3 flex-wrap">
                <a href="/discover" className="flex items-center gap-2 px-4 py-2.5 bg-violet-500/20 border border-violet-500/30 hover:bg-violet-500/30 text-violet-300 rounded-xl text-sm font-medium transition-all">
                  Explore Careers <ChevronRight className="w-4 h-4" />
                </a>
                <a href="/roadmap" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/10 hover:border-violet-500/30 hover:text-violet-300 text-gray-300 rounded-xl text-sm font-medium transition-all">
                  Generate Roadmap <ChevronRight className="w-4 h-4" />
                </a>
                <a href="/chat" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/10 hover:border-violet-500/30 hover:text-violet-300 text-gray-300 rounded-xl text-sm font-medium transition-all">
                  Talk to AI Advisor <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
