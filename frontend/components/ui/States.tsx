import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f87171",
        }}
      >
        <AlertTriangle size={24} />
      </div>
      <div>
        <p
          style={{
            color: "var(--text-primary)",
            fontWeight: 600,
            marginBottom: "0.25rem",
          }}
        >
          Failed to load
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary"
          style={{ fontSize: "0.82rem" }}
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your filters or search terms.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        textAlign: "center",
        gap: "0.875rem",
      }}
    >
      {icon && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <p
          style={{
            color: "var(--text-primary)",
            fontWeight: 600,
            marginBottom: "0.25rem",
          }}
        >
          {title}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {description}
        </p>
      </div>
      {action && action}
    </div>
  );
}
