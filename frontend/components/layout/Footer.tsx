import Link from "next/link";
import { Link2, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: Array<{
    title: string;
    links: Array<{ label: string; href: string; external?: boolean }>;
  }> = [
    {
      title: "Platform",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Career Explorer", href: "/careers" },
        { label: "Job Board", href: "/jobs" },
        { label: "Skill Graph", href: "/graph" },
      ],
    },
    {
      title: "Tools",
      links: [
        { label: "AI Roadmap", href: "/roadmap" },
        { label: "Resume Analyzer", href: "/resume" },
        { label: "AI Career Chat", href: "/chat" },
        { label: "Skill Discovery", href: "/discover" },
      ],
    },
    {
      title: "Framework",
      links: [
        {
          label: "NSQF Overview",
          href: "https://nsdcindia.org/nsqf",
          external: true,
        },
        {
          label: "SWAYAM Courses",
          href: "https://swayam.gov.in",
          external: true,
        },
        { label: "NPTEL", href: "https://nptel.ac.in", external: true },
        { label: "NCS Portal", href: "https://ncs.gov.in", external: true },
      ],
    },
  ];


  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
        padding: "3rem 0 1.5rem",
        marginTop: "auto",
      }}
    >
      <div className="container-page">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr repeat(3, auto)",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                V
              </div>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                Vidyavani
              </span>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.82rem",
                lineHeight: 1.6,
                maxWidth: 260,
              }}
            >
              AI-powered career intelligence bridging the gap between NSQF
              curricula and real industry demand.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                marginTop: "1rem",
              }}
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "var(--text-muted)",
                  transition: "color 0.2s",
                  display: "flex",
                }}
                aria-label="GitHub"
              >
              <Link2 size={18} />
              </a>
            </div>
          </div>

          {/* Link sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.875rem",
                }}
              >
                {section.title}
              </h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {section.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: "0.5rem" }}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.82rem",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          transition: "color 0.2s",
                        }}
                      >
                        {link.label}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.82rem",
                          textDecoration: "none",
                          transition: "color 0.2s",
                        }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="glow-divider" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "1.25rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            © {currentYear} Vidyavani. Built for SIH 2026.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            Powered by NSQF · Groq · Neo4j · pgvector
          </p>
        </div>
      </div>
    </footer>
  );
}
