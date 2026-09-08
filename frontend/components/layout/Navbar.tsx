"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Map,
  Bot,
  FileText,
  Search,
  Network,
  Menu,
  X,
  Zap,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/careers", label: "Careers", icon: Briefcase },
  { href: "/jobs", label: "Jobs", icon: Search },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/chat", label: "AI Chat", icon: Bot },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/discover", label: "Discover", icon: Zap },
  { href: "/graph", label: "Graph", icon: Network },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);



  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: 64,
        background: "rgba(12, 16, 23, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="container-page"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "white",
            }}
          >
            V
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "var(--text-primary)",
            }}
          >
            Vidyavani
          </span>
        </Link>

        {/* Desktop nav links */}
        <div
          className="hide-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            overflowX: "auto",
          }}
        >
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.4rem 0.7rem",
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                  color: active ? "#5eead4" : "var(--text-secondary)",
                  background: active
                    ? "rgba(13,148,136,0.12)"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(13,148,136,0.2)"
                    : "1px solid transparent",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="show-mobile-only"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-primary)",
            padding: "0.5rem",
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 0,
            right: 0,
            background: "rgba(12, 16, 23, 0.97)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            zIndex: 99,
          }}
        >
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: active ? "#5eead4" : "var(--text-secondary)",
                  background: active ? "rgba(13,148,136,0.12)" : "transparent",
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
