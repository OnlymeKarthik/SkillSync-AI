"use client";

import { useState, useEffect, useRef } from "react";
import { graphApi, careersApi } from "@/lib/api";
import { useApi } from "@/lib/hooks/useApi";
import { ErrorState, EmptyState } from "@/components/ui/States";
import { Spinner } from "@/components/ui/Loaders";
import type { GraphNode, Career } from "@/lib/types";
import { Network, Filter, Info } from "lucide-react";

// Group → color mapping for nodes
const GROUP_COLORS: Record<string, string> = {
  AI: "#0d9488",
  "Data & AI": "#0d9488",
  Cloud: "#0ea5e9",
  Engineering: "#10b981",
  Security: "#ef4444",
  Web: "#f59e0b",
  Management: "#f97316",
  Design: "#a78bfa",
  "Government & PSU": "#14b8a6",
  Career: "#06b6d4",
  Skill: "#94a3b8",
  default: "#64748b",
};

function getColor(group: string) {
  return GROUP_COLORS[group] ?? GROUP_COLORS.default;
}

function ForceGraph({
  nodes,
  onNodeClick,
}: {
  nodes: GraphNode[];
  onNodeClick?: (node: GraphNode) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<(GraphNode & { vx: number; vy: number; fx?: number; fy?: number })[]>([]);
  const dragging = useRef<{ node: typeof nodesRef.current[0] | null; offsetX: number; offsetY: number }>({ node: null, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Initialize node positions
    nodesRef.current = nodes.map((n, i) => ({
      ...n,
      x: cx + (Math.random() - 0.5) * 400,
      y: cy + (Math.random() - 0.5) * 300,
      vx: 0,
      vy: 0,
    }));

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);

      const ns = nodesRef.current;

      // Node map for relationship lookups
      const nodeMap = new Map(ns.map((n) => [n.id, n]));

      // Spring forces for connected nodes
      ns.forEach((node) => {
        if (!node.relationships) return;
        node.relationships.forEach((rel) => {
          if (!rel.target) return;
          const targetNode = nodeMap.get(rel.target);
          if (targetNode && targetNode !== node) {
            const dx = targetNode.x! - node.x!;
            const dy = targetNode.y! - node.y!;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = 120;
            const spring = (dist - desiredDist) * 0.003;
            const sx = (dx / dist) * spring;
            const sy = (dy / dist) * spring;
            node.vx += sx;
            node.vy += sy;
            targetNode.vx -= sx;
            targetNode.vy -= sy;
          }
        });
      });

      // Simple repulsion force
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[j].x! - ns[i].x!;
          const dy = ns[j].y! - ns[i].y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = Math.min(2500 / (dist * dist), 6);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          ns[i].vx -= fx;
          ns[i].vy -= fy;
          ns[j].vx += fx;
          ns[j].vy += fy;
        }
        // Center attraction
        ns[i].vx += (cx - ns[i].x!) * 0.003;
        ns[i].vy += (cy - ns[i].y!) * 0.003;
        // Damping
        ns[i].vx *= 0.85;
        ns[i].vy *= 0.85;
        if (!dragging.current.node || dragging.current.node.id !== ns[i].id) {
          ns[i].x = (ns[i].x ?? cx) + ns[i].vx;
          ns[i].y = (ns[i].y ?? cy) + ns[i].vy;
          // Keep in bounds
          ns[i].x = Math.max(30, Math.min(W - 30, ns[i].x!));
          ns[i].y = Math.max(30, Math.min(H - 30, ns[i].y!));
        }
      }

      // Draw edges between connected nodes
      ns.forEach((node) => {
        if (!node.relationships) return;
        node.relationships.forEach((rel) => {
          if (!rel.target) return;
          const targetNode = nodeMap.get(rel.target);
          if (targetNode) {
            ctx.beginPath();
            ctx.moveTo(node.x!, node.y!);
            ctx.lineTo(targetNode.x!, targetNode.y!);
            ctx.strokeStyle =
              rel.type === "PREREQUISITE_OF"
                ? "rgba(99, 102, 241, 0.4)"
                : "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = rel.type === "PREREQUISITE_OF" ? 1.5 : 1;
            if (rel.type === "PREREQUISITE_OF") {
              ctx.setLineDash([4, 4]);
            } else {
              ctx.setLineDash([]);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      });

      // Draw nodes
      ns.forEach((node) => {
        const r = 6 + (node.gap_score ?? 0) * 12;
        const color = getColor(node.group);
        const x = node.x!;
        const y = node.y!;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${color}18`;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}dd`;
        ctx.fill();
        ctx.strokeStyle = `${color}80`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          node.label.length > 18 ? node.label.slice(0, 17) + "…" : node.label,
          x,
          y + r + 13
        );
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes]);

  const getNodeAt = (x: number, y: number) => {
    const ns = nodesRef.current;
    for (let i = ns.length - 1; i >= 0; i--) {
      const n = ns[i];
      const r = 6 + (n.gap_score ?? 0) * 12;
      const dx = x - (n.x ?? 0);
      const dy = y - (n.y ?? 0);
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  };

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={550}
      style={{ width: "100%", height: "100%", cursor: "grab", borderRadius: 12 }}
      onMouseDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = 900 / rect.width;
        const scaleY = 550 / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const node = getNodeAt(x, y);
        if (node) {
          dragging.current = { node, offsetX: x - (node.x ?? 0), offsetY: y - (node.y ?? 0) };
          (e.currentTarget as HTMLCanvasElement).style.cursor = "grabbing";
        }
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = 900 / rect.width;
        const scaleY = 550 / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        if (dragging.current.node) {
          dragging.current.node.x = x - dragging.current.offsetX;
          dragging.current.node.y = y - dragging.current.offsetY;
        }
      }}
      onMouseUp={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = 900 / rect.width;
        const scaleY = 550 / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        if (!dragging.current.node) {
          const node = getNodeAt(x, y);
          if (node && onNodeClick) onNodeClick(node as GraphNode);
        }
        dragging.current = { node: null, offsetX: 0, offsetY: 0 };
        (e.currentTarget as HTMLCanvasElement).style.cursor = "grab";
      }}
    />
  );
}

export default function GraphPage() {
  const [careerFilter, setCareerFilter] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [careerList, setCareerList] = useState<Career[]>([]);

  useEffect(() => {
    careersApi.list({ page_size: 50 }).then((r) => setCareerList(r.careers)).catch(() => {});
  }, []);

  const { data, loading, error } = useApi(
    () => graphApi.getNodes(careerFilter || undefined, 60),
    [careerFilter]
  );

  const nodes = (data?.nodes ?? []) as GraphNode[];

  const groups = [...new Set(nodes.map((n) => n.group))];

  return (
    <div className="section-padding">
      <div className="container-page">
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Skill <span className="gradient-text">Knowledge Graph</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Explore skill relationships and career connections through a
            force-directed graph. Node size indicates demand gap score.
          </p>
        </div>

        {/* Controls */}
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.875rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
            <Filter size={15} />
            <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Filter</span>
          </div>
          <select
            className="select-base"
            value={careerFilter}
            onChange={(e) => setCareerFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="">All Skills</option>
            {careerList.map((c) => (
              <option key={c.slug} value={c.slug}>{c.title}</option>
            ))}
          </select>
          {nodes.length > 0 && (
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: "auto" }}>
              {nodes.length} nodes
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.25rem", alignItems: "start" }}>
          {/* ── Graph Canvas ── */}
          <div
            className="glass-card"
            style={{
              height: 560,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: 0,
            }}
          >
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem" }}>
                <Spinner size={32} />
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Loading knowledge graph...
                </p>
              </div>
            ) : error ? (
              <ErrorState message={error} />
            ) : nodes.length === 0 ? (
              <EmptyState
                title="No graph data"
                description="The Neo4j knowledge graph may be empty. Populate it via the backend seeder."
                icon={<Network size={24} />}
              />
            ) : (
              <ForceGraph
                nodes={nodes}
                onNodeClick={(node) => setSelectedNode(node)}
              />
            )}
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Node detail */}
            {selectedNode ? (
              <div className="glass-card" style={{ padding: "1.25rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.875rem" }}>
                  {selectedNode.label}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Group</span>
                    <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{selectedNode.group}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Gap Score</span>
                    <div className="progress-bar" style={{ marginTop: "0.25rem" }}>
                      <div className="progress-fill" style={{ width: `${(selectedNode.gap_score ?? 0) * 100}%` }} />
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      {((selectedNode.gap_score ?? 0) * 100).toFixed(0)}% gap severity
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="glass-card"
                style={{
                  padding: "1.25rem",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <Info size={20} style={{ margin: "0 auto 0.5rem" }} />
                <p style={{ fontSize: "0.82rem" }}>
                  Click any node to see its details
                </p>
              </div>
            )}

            {/* Legend */}
            {groups.length > 0 && (
              <div className="glass-card" style={{ padding: "1.25rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Legend
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {groups.map((g) => (
                    <div key={g} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: getColor(g),
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                padding: "0.875rem",
                borderRadius: 10,
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
                fontSize: "0.75rem",
                color: "#93c5fd",
                lineHeight: 1.6,
              }}
            >
              <strong>Tips:</strong> Drag nodes to rearrange. Larger nodes have higher skill gap scores. Click to inspect.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
