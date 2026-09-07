"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, BookOpen, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  accentClass: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, sub, color, accentClass }: StatCardProps) {
  return (
    <div
      className={`glass-elevated glass-hover rounded-2xl p-5 transition-all duration-200 ${accentClass}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-100 mb-0.5">{value}</p>
      <p className="text-sm font-medium text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1.5">{sub}</p>}
    </div>
  );
}

const DEMO_STATS: DashboardStats = {
  total_jobs_scraped: 342,
  total_private_jobs: 218,
  total_govt_jobs: 124,
  total_curriculum_skills: 890,
  total_skill_gaps: 47,
  avg_gap_coverage_percent: 53.2,
  last_updated: "Live",
};

export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>(DEMO_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.dashboard.getStats()
      .then(setStats)
      .catch(() => setStats(DEMO_STATS))
      .finally(() => setLoading(false));
  }, []);

  // Skeleton loader with shimmer
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 h-28">
            <div className="w-10 h-10 rounded-xl skeleton-shimmer mb-3" />
            <div className="w-16 h-6 skeleton-shimmer mb-1.5" />
            <div className="w-24 h-3 skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      icon: Briefcase,
      label: "Jobs Scraped",
      value: stats?.total_jobs_scraped.toLocaleString("en-IN") ?? "—",
      sub: `${stats?.total_private_jobs ?? 0} Private · ${stats?.total_govt_jobs ?? 0} Govt`,
      color: "bg-violet-600",
      accentClass: "accent-left-violet",
      delay: 0,
    },
    {
      icon: BookOpen,
      label: "Curriculum Skills",
      value: stats?.total_curriculum_skills.toLocaleString("en-IN") ?? "—",
      sub: "Across all NSQF courses",
      color: "bg-blue-600",
      accentClass: "accent-left-blue",
      delay: 0.08,
    },
    {
      icon: AlertTriangle,
      label: "Skill Gaps Found",
      value: stats?.total_skill_gaps.toLocaleString("en-IN") ?? "—",
      sub: "In last 30 days",
      color: "bg-red-600",
      accentClass: "accent-left-red",
      delay: 0.16,
    },
    {
      icon: TrendingUp,
      label: "Curriculum Coverage",
      value: stats ? `${stats.avg_gap_coverage_percent.toFixed(1)}%` : "—",
      sub: "Avg NSQF-to-industry match",
      color: "bg-emerald-600",
      accentClass: "accent-left-emerald",
      delay: 0.24,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
