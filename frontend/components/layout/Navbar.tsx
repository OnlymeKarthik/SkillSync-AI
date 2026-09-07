"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/discover",  label: "Explore",   icon: Compass },
  { href: "/roadmap",   label: "Roadmap",   icon: Map },
  { href: "/graph",     label: "Graph",     icon: Network },
  { href: "/chat",      label: "AI Advisor",icon: MessageSquare },
  { href: "/jobs",      label: "Jobs",      icon: Briefcase },
  { href: "/compare",   label: "Compare",   icon: Scale },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Track scroll for navbar transparency
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "bg-[#030712]/95 border-b border-white/[0.10] shadow-lg shadow-black/25"
            : "bg-[#030712]/75 border-b border-white/[0.06]"
        }`}
      >
        {/* Gradient glow line at bottom — visible on scroll */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 30%, rgba(59,130,246,0.2) 70%, transparent 100%)",
          }}
        />

        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-200">
              <BrainCircuit size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text-brand tracking-tight">
              Vidyavani
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 focus-ring ${
                    active
                      ? "text-violet-300 font-semibold"
                      : "text-gray-400 hover:text-gray-100 hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-violet-500/10 border border-violet-500/25 pointer-events-none"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/onboarding"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 active:scale-95 focus-ring"
            >
              <FileText size={14} />
              <span className="hidden xs:inline">Upload Resume</span>
              <span className="xs:hidden">Resume</span>
            </Link>

            <Link
              href="/dashboard?sector=GOVERNMENT"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/[0.05] text-xs sm:text-sm font-medium border border-transparent hover:border-white/10 transition-all focus-ring"
            >
              <LayoutDashboard size={14} />
              <span className="hidden xl:inline">Govt Panel</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus-ring"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-16 right-0 bottom-0 z-50 w-72 bg-[#090d16]/95 backdrop-blur-xl border-l border-white/10 p-5 flex flex-col justify-between lg:hidden overflow-y-auto"
            >
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 px-3 py-2 mb-1">
                  Navigation
                </div>
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={16} className={active ? "text-violet-400" : "text-gray-400"} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <Link
                  href="/onboarding"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all"
                >
                  <FileText size={15} />
                  Upload Resume
                </Link>
                <Link
                  href="/dashboard?sector=GOVERNMENT"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
                >
                  <LayoutDashboard size={15} />
                  Govt Analytics Panel
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
