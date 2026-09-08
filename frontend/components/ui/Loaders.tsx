interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 6,
  style,
}: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: "1.5rem" }}>
      <Skeleton height={20} width="60%" style={{ marginBottom: "0.75rem" }} />
      <Skeleton height={14} width="40%" style={{ marginBottom: "1.25rem" }} />
      <Skeleton height={12} width="100%" style={{ marginBottom: "0.5rem" }} />
      <Skeleton height={12} width="80%" style={{ marginBottom: "1.25rem" }} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Skeleton height={24} width={70} borderRadius={100} />
        <Skeleton height={24} width={90} borderRadius={100} />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: "1.25rem" }}>
      <Skeleton height={12} width="50%" style={{ marginBottom: "0.75rem" }} />
      <Skeleton height={32} width="60%" style={{ marginBottom: "0.5rem" }} />
      <Skeleton height={11} width="70%" />
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid rgba(99,102,241,0.25)",
        borderTop: "2px solid #6366f1",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// Add spin animation via global style injection (one-time)
if (typeof document !== "undefined") {
  if (!document.getElementById("spinner-keyframes")) {
    const style = document.createElement("style");
    style.id = "spinner-keyframes";
    style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}
