"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ArrowRight,
  FileText,
  Network,
  BarChart3,
  Map,
  Briefcase,
  MessageSquare,
  Scale,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 glass border border-violet-500/25 rounded-full px-4 py-1.5 text-xs sm:text-sm text-violet-300 mb-6 shadow-lg shadow-violet-500/10"
        >
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full pulse-glow" />
          <span>Smart India Hackathon 2026 · Team Fantastic Six</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 max-w-5xl mx-auto"
        >
          Bridge the Gap Between{" "}
          <span className="gradient-text">Academia & Industry</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Vidyavani analyses real-time job postings from private tech giants and government portals,
          maps them against NSQF curricula using Knowledge Graphs, and tells you{" "}
          <span className="text-gray-100 font-semibold">exactly what skills you&apos;re missing</span> — with a personalized roadmap to close the gap.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/onboarding"
            className="flex items-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/30 active:scale-95"
          >
            <FileText size={18} />
            <span>Upload Your Resume</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 glass border border-white/10 hover:border-violet-500/40 text-gray-200 hover:text-white font-semibold rounded-xl transition-all duration-200 hover:bg-white/[0.06] active:scale-95"
          >
            <BarChart3 size={18} />
            <span>View Skill Gap Dashboard</span>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16 p-6 rounded-2xl glass border border-white/[0.07]"
        >
          {[
            { value: "1.5Cr+", label: "NSQF graduates/year" },
            { value: "47%", label: "Unemployed within 6 months" },
            { value: "300+", label: "Live job postings analysed" },
            { value: "Real-time", label: "Skill gap detection" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text-brand mb-1">{value}</div>
              <div className="text-xs text-gray-400 font-medium">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300 mb-3">
            <Sparkles size={13} />
            <span>Integrated AI Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Everything You Need To Bridge The Skill Gap
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            Powered by Neo4j Knowledge Graphs, Microsoft GraphRAG, and LangGraph multi-agent orchestration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                href={feat.href}
                className="group flex flex-col justify-between glass glass-hover rounded-2xl p-6 h-full border border-white/[0.07] hover:border-violet-500/30"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${feat.color} shadow-lg`}>
                      <feat.icon size={20} className="text-white" />
                    </div>
                    {feat.badge && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300">
                        {feat.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-100 group-hover:text-violet-300 transition-colors mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center text-xs font-semibold text-violet-400 group-hover:text-violet-300 gap-1">
                  <span>Explore feature</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Who is it for */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Built For India&apos;s Workforce Ecosystem
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            Targeting every key stakeholder from vocational trainees to policy makers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USER_TYPES.map((u, i) => (
            <motion.div
              key={u.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="glass rounded-2xl p-7 border border-white/[0.07] flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl mb-4 p-3 w-fit rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  {u.emoji}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2.5">{u.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{u.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: "Resume Intelligence",
    href: "/onboarding",
    description: "Upload your resume — AI extracts your skills via spaCy and computes your personal gap score against target roles.",
    color: "bg-violet-600",
    badge: "Upload & Analyse",
  },
  {
    icon: Map,
    title: "AI Roadmap Generator",
    href: "/roadmap",
    description: "Multi-stage personalized learning roadmaps with free SWAYAM/NPTEL and paid tracks with milestone projects.",
    color: "bg-blue-600",
    badge: "Flagship Feature",
  },
  {
    icon: BarChart3,
    title: "Skill Gap Dashboard",
    href: "/dashboard",
    description: "Visual analytics comparing private sector and government job demands vs NSQF curricula coverage.",
    color: "bg-emerald-600",
    badge: "Live Analytics",
  },
  {
    icon: Network,
    title: "Knowledge Graph Explorer",
    href: "/graph",
    description: "Interactive graph visualization of skill relationships, prerequisites, and NSQF qualification packs.",
    color: "bg-pink-600",
    badge: "GraphRAG",
  },
  {
    icon: MessageSquare,
    title: "AI Career Advisor",
    href: "/chat",
    description: "Streaming chat advisor with career-only context filtering and cascading Groq + Gemini + Ollama fallback.",
    color: "bg-orange-600",
    badge: "LangGraph",
  },
  {
    icon: Briefcase,
    title: "Smart Job Board",
    href: "/jobs",
    description: "Real job postings from Naukri, LinkedIn, and government portals — filter by private or public sector.",
    color: "bg-teal-600",
    badge: "Private + Govt",
  },
];

const USER_TYPES = [
  {
    emoji: "🎓",
    title: "Students & Freshers",
    description: "Discover the critical skills your NSQF course didn't teach, and follow an actionable roadmap to get hire-ready before campus placements.",
  },
  {
    emoji: "🔄",
    title: "Mid-Career Professionals",
    description: "Identify skill decay against live market demand, benchmark realistic salary expectations, and transition into high-growth tech domains.",
  },
  {
    emoji: "🏛️",
    title: "Govt & NSQF Bodies",
    description: "Access national-level analytics on which vocational curricula are most outdated, with live market evidence to justify curriculum revisions.",
  },
];
