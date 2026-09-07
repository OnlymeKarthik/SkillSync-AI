import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#030712]/80 backdrop-blur-md mt-auto">
      {/* Gradient top divider */}
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3 group">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <BrainCircuit size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg gradient-text-brand tracking-tight">
                Vidyavani
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed mb-4 max-w-[220px]">
              Real-time AI career intelligence bridging NSQF academia and industry demand with Knowledge Graphs and GraphRAG.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <span>🇮🇳</span> Smart India Hackathon 2026
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-[13px] text-gray-400">
              {[
                { href: "/dashboard", label: "Skill Gap Dashboard" },
                { href: "/discover", label: "Explore Careers" },
                { href: "/roadmap", label: "Learning Roadmaps" },
                { href: "/graph", label: "Knowledge Graph Explorer" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-violet-300 transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Career Tools
            </h4>
            <ul className="space-y-2.5 text-[13px] text-gray-400">
              {[
                { href: "/chat", label: "AI Career Advisor" },
                { href: "/jobs", label: "Smart Job Board" },
                { href: "/compare", label: "Career Comparison" },
                { href: "/onboarding", label: "Resume Skill Extractor" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-violet-300 transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Govt & National Frameworks */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">
              Standards & Data
            </h4>
            <ul className="space-y-2.5 text-[13px] text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> NSQF Levels 4 — 8 Compliant
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" /> NASSCOM SSC Qualification Packs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" /> MSDE Curriculum Guidelines
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> Live Crawl4AI Market Harvester
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="section-divider mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            © 2026 Vidyavani (SkillSync AI) · Built by <strong className="text-gray-300 font-medium">Team Fantastic Six</strong> for SIH 2026.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Open Source Innovation</span>
            <span>·</span>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-200">
              Govt Analytics
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
