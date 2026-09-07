"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  BarChart3,
  Network,
  MessageSquare,
  Briefcase,
  Compass,
  Scale,
  Map,
  FileText,
  LayoutDashboard,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard",  label: "Dashboard",  icon: BarChart3 },
  { href: "/discover",   label: "Explore",     icon: Compass },
  { href: "/roadmap",    label: "Roadmap",     icon: Map },
  { href: "/graph",      label: "Graph",       icon: Network },
  { href: "/chat",       label: "AI Advisor",  icon: MessageSquare },
  { href: "/jobs",       label: "Jobs",        icon: Briefcase },
  { href: "/compare",    label: "Compare",     icon: Scale },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center pulse-glow">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg gradient-text-brand tracking-tight">
            Vidyavani
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-violet-300 bg-violet-500/10"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={14} />
                {label}
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-violet-500/10 border border-violet-500/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
          >
            <FileText size={14} />
            Upload Resume
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/[0.04] text-sm font-medium transition-all"
          >
            <LayoutDashboard size={14} />
            <span className="hidden xl:inline">Govt Panel</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
