"use client";

import StatsCards from "@/components/dashboard/StatsCards";
import SkillGapChart from "@/components/dashboard/SkillGapChart";
import { BarChart3 } from "lucide-react";

export default function DashboardContent() {
  return (
    <div className="min-h-screen bg-gray-950 bg-grid">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-2">
            <BarChart3 size={14} />
            <span>Live Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Skill Gap Analysis</h1>
          <p className="text-gray-500">
            Comparing industry demand from{" "}
            <span className="text-gray-300">private job portals</span> and{" "}
            <span className="text-gray-300">government portals</span> against NSQF curriculum coverage.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <StatsCards />
        </div>

        {/* Main Chart */}
        <div className="mb-6">
          <SkillGapChart sector="all" limit={10} />
        </div>

        {/* Split: Private vs Govt */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="text-sm font-medium text-gray-300">Private Sector Top Skills</span>
            </div>
            <SkillGapChart sector="PRIVATE" limit={6} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-gray-300">Government Sector Top Skills</span>
            </div>
            <SkillGapChart sector="GOVERNMENT" limit={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
