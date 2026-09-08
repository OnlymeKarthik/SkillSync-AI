import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(13,148,136,0.08) 0%, transparent 65%)",
      }}
    >
      <div
        style={{
          fontSize: "6rem",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          marginBottom: "1.5rem",
        }}
        className="gradient-text"
      >
        404
      </div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "1rem",
          maxWidth: 380,
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn-primary">
          <Home size={15} />
          Go Home
        </Link>
        <Link href="/dashboard" className="btn-secondary">
          <ArrowLeft size={15} />
          View Dashboard
        </Link>
      </div>
    </div>
  );
}
