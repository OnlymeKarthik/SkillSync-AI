import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  color?: "indigo" | "green" | "amber" | "blue" | "red";
  icon?: React.ReactNode;
}

const colorMap = {
  indigo: "#0d9488",
  green: "#10b981",
  amber: "#f59e0b",
  blue: "#3b82f6",
  red: "#ef4444",
};

export function StatCard({
  label,
  value,
  subtitle,
  trend,
  color = "indigo",
  icon,
}: StatCardProps) {
  const accentColor = colorMap[color];
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <div
      className="glass-card"
      style={{
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle accent top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </p>
        {icon && (
          <div
            style={{
              color: accentColor,
              opacity: 0.7,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          lineHeight: 1,
          marginBottom: "0.375rem",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>

      {subtitle && (
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      )}

      {trend && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: isPositiveTrend ? "#34d399" : "#f87171",
          }}
        >
          {isPositiveTrend ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
}
