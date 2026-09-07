"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Network, Search, ZoomIn, ZoomOut, RotateCcw, Filter,
  Layers, ChevronRight, Info, BookOpen, Briefcase, Zap, CheckCircle2
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

interface GraphNode {
  id: string;
  label: string;
  group: string;
  gap_score: number;
  nsqf_level: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: "REQUIRES" | "PREREQUISITE_OF" | "TEACHES";
}

const CATEGORY_COLORS: Record<string, { bg: string; stroke: string; text: string }> = {
  Programming: { bg: "#8b5cf6", stroke: "#a78bfa", text: "text-violet-300" },
  "Cloud & DevOps": { bg: "#3b82f6", stroke: "#60a5fa", text: "text-blue-300" },
  "Data Science": { bg: "#10b981", stroke: "#34d399", text: "text-emerald-300" },
  "AI/ML": { bg: "#ec4899", stroke: "#f472b6", text: "text-pink-300" },
  Cybersecurity: { bg: "#f59e0b", stroke: "#fbbf24", text: "text-amber-300" },
  Roles: { bg: "#06b6d4", stroke: "#22d3ee", text: "text-cyan-300" },
};

const INITIAL_NODES: Omit<GraphNode, "x" | "y" | "vx" | "vy" | "radius">[] = [
  // Programming
  { id: "Python", label: "Python", group: "Programming", gap_score: 0.15, nsqf_level: 5 },
  { id: "React", label: "React.js", group: "Programming", gap_score: 0.28, nsqf_level: 6 },
  { id: "TypeScript", label: "TypeScript", group: "Programming", gap_score: 0.42, nsqf_level: 6 },
  { id: "Next.js", label: "Next.js", group: "Programming", gap_score: 0.55, nsqf_level: 6 },
  { id: "SQL", label: "SQL & Relational", group: "Programming", gap_score: 0.12, nsqf_level: 4 },
  { id: "FastAPI", label: "FastAPI", group: "Programming", gap_score: 0.38, nsqf_level: 6 },

  // Cloud & DevOps
  { id: "Docker", label: "Docker", group: "Cloud & DevOps", gap_score: 0.48, nsqf_level: 6 },
  { id: "Kubernetes", label: "Kubernetes", group: "Cloud & DevOps", gap_score: 0.65, nsqf_level: 7 },
  { id: "AWS", label: "AWS Cloud", group: "Cloud & DevOps", gap_score: 0.52, nsqf_level: 6 },
  { id: "CI_CD", label: "CI/CD Pipelines", group: "Cloud & DevOps", gap_score: 0.45, nsqf_level: 6 },
  { id: "Linux", label: "Linux Admin", group: "Cloud & DevOps", gap_score: 0.20, nsqf_level: 5 },

  // Data Science
  { id: "Pandas", label: "Pandas & NumPy", group: "Data Science", gap_score: 0.30, nsqf_level: 5 },
  { id: "PowerBI", label: "Power BI", group: "Data Science", gap_score: 0.35, nsqf_level: 5 },
  { id: "PostgreSQL", label: "PostgreSQL + pgvector", group: "Data Science", gap_score: 0.40, nsqf_level: 6 },

  // AI/ML
  { id: "ScikitLearn", label: "Scikit-Learn", group: "AI/ML", gap_score: 0.50, nsqf_level: 6 },
  { id: "PyTorch", label: "PyTorch", group: "AI/ML", gap_score: 0.62, nsqf_level: 7 },
  { id: "GraphRAG", label: "GraphRAG & LLMs", group: "AI/ML", gap_score: 0.78, nsqf_level: 7 },

  // Roles
  { id: "FullStackDev", label: "Full Stack Developer", group: "Roles", gap_score: 0.35, nsqf_level: 6 },
  { id: "DataScientist", label: "Data Scientist", group: "Roles", gap_score: 0.48, nsqf_level: 7 },
  { id: "DevOpsEng", label: "DevOps Engineer", group: "Roles", gap_score: 0.52, nsqf_level: 6 },
];

const INITIAL_LINKS: GraphLink[] = [
  { source: "Python", target: "FastAPI", type: "PREREQUISITE_OF" },
  { source: "Python", target: "Pandas", type: "PREREQUISITE_OF" },
  { source: "Pandas", target: "ScikitLearn", type: "PREREQUISITE_OF" },
  { source: "ScikitLearn", target: "PyTorch", type: "PREREQUISITE_OF" },
  { source: "PyTorch", target: "GraphRAG", type: "PREREQUISITE_OF" },
  { source: "React", target: "Next.js", type: "PREREQUISITE_OF" },
  { source: "TypeScript", target: "Next.js", type: "PREREQUISITE_OF" },
  { source: "Linux", target: "Docker", type: "PREREQUISITE_OF" },
  { source: "Docker", target: "Kubernetes", type: "PREREQUISITE_OF" },
  { source: "Docker", target: "CI_CD", type: "PREREQUISITE_OF" },
  { source: "Next.js", target: "FullStackDev", type: "REQUIRES" },
  { source: "FastAPI", target: "FullStackDev", type: "REQUIRES" },
  { source: "PostgreSQL", target: "FullStackDev", type: "REQUIRES" },
  { source: "PyTorch", target: "DataScientist", type: "REQUIRES" },
  { source: "SQL", target: "DataScientist", type: "REQUIRES" },
  { source: "Kubernetes", target: "DevOpsEng", type: "REQUIRES" },
  { source: "AWS", target: "DevOpsEng", type: "REQUIRES" },
  { source: "CI_CD", target: "DevOpsEng", type: "REQUIRES" },
];

export default function GraphContent() {
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize nodes with positions
  const nodes = useMemo(() => {
    const width = 900;
    const height = 550;
    return INITIAL_NODES.map((n, i) => {
      const angle = (i / INITIAL_NODES.length) * 2 * Math.PI;
      const dist = 180 + (i % 3) * 60;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: n.group === "Roles" ? 28 : 20,
      } as GraphNode;
    });
  }, []);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (selectedGroup !== "All" && n.group !== selectedGroup) return false;
      if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [nodes, selectedGroup, search]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredLinks = useMemo(() => {
    return INITIAL_LINKS.filter(l => activeNodeIds.has(l.source) && activeNodeIds.has(l.target));
  }, [activeNodeIds]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw links
      filteredLinks.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = link.type === "REQUIRES" ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = link.type === "REQUIRES" ? 2 : 1;
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowX = target.x - Math.cos(angle) * target.radius;
        const arrowY = target.y - Math.sin(angle) * target.radius;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 8 * Math.cos(angle - Math.PI / 6), arrowY - 8 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - 8 * Math.cos(angle + Math.PI / 6), arrowY - 8 * Math.sin(angle + Math.PI / 6));
        ctx.fillStyle = link.type === "REQUIRES" ? "rgba(99, 102, 241, 0.7)" : "rgba(255, 255, 255, 0.3)";
        ctx.fill();
      });

      // Draw nodes
      filteredNodes.forEach(node => {
        const isSelected = selectedNode?.id === node.id;
        const colorConfig = CATEGORY_COLORS[node.group] || { bg: "#6366f1", stroke: "#818cf8" };

        // Glow when selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(139, 92, 246, 0.35)";
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = colorConfig.bg;
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.strokeStyle = isSelected ? "#ffffff" : colorConfig.stroke;
        ctx.stroke();

        // Node label
        ctx.font = node.group === "Roles" ? "bold 11px Inter, sans-serif" : "10px Inter, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Truncate label if too long
        const label = node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label;
        ctx.fillText(label, node.x, node.y + node.radius + 12);
      });

      ctx.restore();
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [filteredNodes, filteredLinks, selectedNode, zoom, pan]);

  // Click on canvas to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    const clicked = filteredNodes.find(node => {
      const dx = node.x - clickX;
      const dy = node.y - clickY;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 5;
    });

    setSelectedNode(clicked || null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Standard Page Header */}
      <PageHeader
        badge={{
          icon: Network,
          text: "Neo4j Knowledge Graph",
          variant: "violet",
        }}
        title={
          <>
            Knowledge Graph <span className="gradient-text">Explorer</span>
          </>
        }
        description="Interactive graph ontology visualizing prerequisite dependencies, NSQF course curricula coverage, and industry demand relationships."
      />

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 glass p-3.5 rounded-2xl border border-white/[0.08]">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {["All", "Programming", "Cloud & DevOps", "Data Science", "AI/ML", "Roles"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedGroup(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedGroup === cat
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search and Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-all w-36 sm:w-48"
            />
          </div>

          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button
              onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
              className="p-1.5 rounded-lg glass hover:bg-white/10 text-gray-300 transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))}
              className="p-1.5 rounded-lg glass hover:bg-white/10 text-gray-300 transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={15} />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded-lg glass hover:bg-white/10 text-gray-300 transition-colors"
              title="Reset view"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-3 glass rounded-2xl border border-white/[0.08] overflow-hidden relative min-h-[520px] flex items-center justify-center bg-[#070b14]">
          <canvas
            ref={canvasRef}
            width={900}
            height={550}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-grab active:cursor-grabbing w-full h-full block"
          />

          {/* Quick Legend Overlay */}
          <div className="absolute bottom-3 left-3 glass px-3 py-2 rounded-xl border border-white/10 text-[11px] text-gray-400 flex items-center gap-3 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span>Skills</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Career Roles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-400" />
              <span>Prerequisites</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="lg:col-span-1">
          {selectedNode ? (
            <div className="glass rounded-2xl p-5 border border-white/10 sticky top-24">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider">
                    {selectedNode.group}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{selectedNode.label}</h3>
                </div>
                <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-semibold">
                  NSQF L{selectedNode.nsqf_level}
                </span>
              </div>

              {/* Gap Score Meter */}
              <div className="my-4 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Industry Gap Severity</span>
                  <span className={`font-bold ${selectedNode.gap_score > 0.5 ? "text-red-400" : "text-amber-400"}`}>
                    {Math.round(selectedNode.gap_score * 100)}% Outdated
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${selectedNode.gap_score > 0.5 ? "bg-red-500" : "bg-amber-500"}`}
                    style={{ width: `${selectedNode.gap_score * 100}%` }}
                  />
                </div>
              </div>

              {/* Node Relationships */}
              <div className="space-y-3 text-xs mb-5">
                <div>
                  <p className="text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Connected Prerequisites</p>
                  <div className="flex flex-wrap gap-1">
                    {INITIAL_LINKS.filter(l => l.target === selectedNode.id).map(l => (
                      <span key={l.source} className="skill-badge text-[11px]">{l.source}</span>
                    ))}
                    {INITIAL_LINKS.filter(l => l.target === selectedNode.id).length === 0 && (
                      <span className="text-gray-500">None (Foundational)</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Unlocks Target Roles</p>
                  <div className="flex flex-wrap gap-1">
                    {INITIAL_LINKS.filter(l => l.source === selectedNode.id).map(l => (
                      <span key={l.target} className="text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-[11px]">
                        {l.target}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <a
                href={`/roadmap?career=${encodeURIComponent(selectedNode.label)}`}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all shadow-md shadow-violet-600/20"
              >
                <span>Generate Roadmap for Node</span>
                <ChevronRight size={14} />
              </a>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center border border-white/10 sticky top-24">
              <Info className="w-8 h-8 text-violet-400/40 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Click a Node to Inspect</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Explore prerequisite dependencies, NSQF certification mappings, and gap severity ratings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
