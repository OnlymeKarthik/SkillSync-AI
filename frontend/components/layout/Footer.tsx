import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#030712]/80 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3 group">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <BrainCircuit size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg gradient-text-brand tracking-tight">
                Vidyavani
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Real-time AI career intelligence bridging NSQF academia and industry demand with Knowledge Graphs and GraphRAG.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <span>🇮🇳</span> Smart India Hackathon 2026
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/dashboard" className="hover:text-violet-300 transition-colors">
                  Skill Gap Dashboard
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-violet-300 transition-colors">
                  Explore Careers
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-violet-300 transition-colors">
                  Learning Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/graph" className="hover:text-violet-300 transition-colors">
                  Knowledge Graph Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Career Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Career Tools
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/chat" className="hover:text-violet-300 transition-colors">
                  AI Career Advisor
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-violet-300 transition-colors">
                  Smart Job Board
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-violet-300 transition-colors">
                  Career Comparison
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-violet-300 transition-colors">
                  Resume Skill Extractor
                </Link>
              </li>
            </ul>
          </div>

          {/* Govt & National Frameworks */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Standards & Data
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400">●</span> NSQF Levels 4 — 8 Compliant
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-blue-400">●</span> NASSCOM SSC Qualification Packs
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-400">●</span> MSDE Curriculum Guidelines
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">●</span> Live Crawl4AI Market Harvester
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            © 2026 Vidyavani (SkillSync AI) · Built by <strong className="text-gray-300 font-medium">Team Fantastic Six</strong> for SIH 2026.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Open Source Innovation</span>
            <span>·</span>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Govt Analytics
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
