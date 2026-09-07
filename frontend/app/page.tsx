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
  Zap,
  Shield,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gray-950 bg-grid bg-glow-violet overflow-hidden">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 pt-24 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8"
        >
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full pulse-glow" />
          Smart India Hackathon 2026 · Team Fantastic Six
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
        >
          Bridge the Gap Between{" "}
          <span className="gradient-text">Academia & Industry</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Vidyavani analyses real job postings from private companies and government portals,
          maps them against NSQF curricula using Knowledge Graphs, and tells you{" "}
          <span className="text-gray-200 font-medium">exactly what skills you&apos;re missing</span> — with a personalized roadmap to close the gap.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/onboarding"
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
          >
            <FileText size={18} />
            Upload Your Resume
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 glass border border-white/10 hover:border-violet-500/30 text-gray-200 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <BarChart3 size={18} />
            View Skill Gap Dashboard
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-16 text-center"
        >
          {[
            { value: "1.5Cr+", label: "NSQF graduates/year" },
            { value: "47%", label: "Unemployed within 6 months" },
            { value: "300+", label: "Live job postings analysed" },
            { value: "Real-time", label: "Skill gap detection" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold gradient-text-brand">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
          <p className="text-gray-500">Powered by Knowledge Graphs, GraphRAG, and cutting-edge AI</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link href={feat.href} className="block glass glass-hover rounded-2xl p-6 h-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                  <feat.icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-100 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.description}</p>
                {feat.badge && (
                  <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    {feat.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Who is it for */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Built For</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USER_TYPES.map((u, i) => (
            <motion.div
              key={u.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/[0.06]"
            >
              <div className="text-3xl mb-3">{u.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">{u.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{u.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: FileText, title: "Resume Intelligence", href: "/onboarding",
    description: "Upload your resume — AI extracts your skills and shows your personal gap score.",
    color: "bg-violet-600", badge: "Upload & Analyse",
  },
  {
    icon: Map, title: "AI Roadmap Generator", href: "/roadmap",
    description: "Multi-stage personalized learning roadmap with free/paid tracks and decision breakpoints.",
    color: "bg-blue-600", badge: "⭐ Flagship Feature",
  },
  {
    icon: BarChart3, title: "Skill Gap Dashboard", href: "/dashboard",
    description: "Visual gap analysis comparing Private sector and Government job demands vs NSQF curricula.",
    color: "bg-emerald-600", badge: null,
  },
  {
    icon: Network, title: "Knowledge Graph Explorer", href: "/graph",
    description: "Interactive D3.js visualization of skill relationships, prerequisites, and career paths.",
    color: "bg-pink-600", badge: "GraphRAG Powered",
  },
  {
    icon: MessageSquare, title: "AI Career Advisor", href: "/chat",
    description: "Streaming chat advisor with career-only context filtering. Groq + Ollama offline fallback.",
    color: "bg-orange-600", badge: null,
  },
  {
    icon: Briefcase, title: "Job Board", href: "/jobs",
    description: "Real job postings from Naukri, LinkedIn, NCS, SSC, UPSC — filter Private or Government.",
    color: "bg-teal-600", badge: "Private + Govt",
  },
];

const USER_TYPES = [
  {
    emoji: "🎓",
    title: "Fresh Graduates",
    description: "See exactly what skills your NSQF course didn't teach you, and get a roadmap to close the gap before your first job interview.",
  },
  {
    emoji: "🔄",
    title: "Mid-Career Professionals",
    description: "Upskill in your domain, discover what your industry demands right now, and find both private and government opportunities.",
  },
  {
    emoji: "🏛️",
    title: "Govt & NSQF Bodies",
    description: "See national skill gap data, which curricula are most outdated, and get evidence to justify curriculum updates.",
  },
];
