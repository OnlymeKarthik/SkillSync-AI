"use client";

import StatsCards from "@/components/dashboard/StatsCards";
import SkillGapChart from "@/components/dashboard/SkillGapChart";
import PageHeader from "@/components/layout/PageHeader";
import { BarChart3, Building2, Shield } from "lucide-react";

export default function DashboardContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Standard Page Header */}
      <PageHeader
        badge={{
          icon: BarChart3,
          text: "Live Market Intelligence",
          variant: "violet",
        }}
        title={
          <>
            Skill Gap <span className="gradient-text">Analytics</span>
          </>
        }
        description={
          <>
            Real-time comparison of industry demand from <strong className="text-gray-200 font-semibold">private tech employers</strong> and{" "}
            <strong className="text-gray-200 font-semibold">government recruitment portals</strong> against official NSQF curriculum coverage.
          </>
        }
      />

      {/* KPI Cards */}
      <div className="mb-8 md:mb-10">
        <StatsCards />
      </div>

      {/* Main Overall Gap Chart */}
      <div className="mb-8 md:mb-10">
        <SkillGapChart sector="all" limit={10} />
      </div>

      {/* Split: Private vs Govt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Building2 size={16} className="text-violet-400" />
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              Private Sector High-Demand Gaps
            </h3>
          </div>
          <SkillGapChart sector="PRIVATE" limit={6} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Shield size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              Government Sector High-Demand Gaps
            </h3>
          </div>
          <SkillGapChart sector="GOVERNMENT" limit={6} />
        </div>
      </div>
    </div>
  );
}
