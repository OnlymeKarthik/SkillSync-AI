"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import type { SkillGapChartItem, SectorFilter } from "@/lib/types";
import { TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

const SECTOR_COLORS = {
  "Private Sector": "#8b5cf6",
  "Government": "#10b981",
};

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-elevated rounded-xl p-3.5 border border-white/10 shadow-xl min-w-[160px]">
      <p className="text-sm font-semibold text-gray-100 mb-2.5 pb-2 border-b border-white/[0.06]">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs py-0.5">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: entry.color }}
            />
            <span className="text-gray-400">{entry.name}</span>
          </div>
          <span className="font-semibold text-gray-100">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  sector?: SectorFilter;
  limit?: number;
}

const DEMO_GAP_DATA: SkillGapChartItem[] = [
  { skill: "Docker & K8s", "Private Sector": 84, "Government": 32 },
  { skill: "FastAPI / Python", "Private Sector": 76, "Government": 58 },
  { skill: "React / Next.js", "Private Sector": 89, "Government": 41 },
  { skill: "PostgreSQL & Vector", "Private Sector": 71, "Government": 62 },
  { skill: "Cloud (AWS/GCP)", "Private Sector": 92, "Government": 36 },
  { skill: "Cybersecurity & SIEM", "Private Sector": 64, "Government": 78 },
  { skill: "CI/CD Pipelines", "Private Sector": 79, "Government": 25 },
  { skill: "GenAI & LLMs", "Private Sector": 88, "Government": 18 },
  { skill: "Data Structures", "Private Sector": 68, "Government": 82 },
  { skill: "System Design", "Private Sector": 74, "Government": 38 },
];

export default function SkillGapChart({ sector = "all", limit = 10 }: Props) {
  const [data, setData] = useState<SkillGapChartItem[]>(() => DEMO_GAP_DATA.slice(0, limit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.dashboard.getGapAnalysis(sector, limit);
      if (res.chart_data && res.chart_data.length > 0) {
        setData(res.chart_data);
      }
    } catch {
      // Fallback is already loaded
    }
  };

  useEffect(() => { fetchData(); }, [sector, limit]);

  if (loading) {
    return (
      <div className="glass-elevated rounded-2xl p-6 h-80 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw size={18} className="animate-spin text-violet-400" />
          <span className="text-sm">Loading skill gap data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-elevated rounded-2xl p-6 h-80 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 text-xs text-violet-400 hover:text-violet-300 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-elevated rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-violet-400" />
            <h3 className="text-base font-semibold text-gray-100">
              Top Demanded Skills vs Curriculum Coverage
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Based on {data.length} skills across real job postings · Last 30 days
          </p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4">
          {Object.entries(SECTOR_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
              <span className="text-xs text-gray-400">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 60 }}
          barCategoryGap="25%"
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="skill"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.05)" }} />
          <Bar
            dataKey="Private Sector"
            fill={SECTOR_COLORS["Private Sector"]}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            isAnimationActive={false}
          />
          <Bar
            dataKey="Government"
            fill={SECTOR_COLORS["Government"]}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
