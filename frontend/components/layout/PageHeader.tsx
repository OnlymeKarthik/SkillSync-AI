"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  badge?: {
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    text: string;
    variant?: "violet" | "emerald" | "blue" | "amber";
  };
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const BADGE_VARIANTS = {
  violet: "bg-violet-500/10 border-violet-500/25 text-violet-300",
  emerald: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
  blue: "bg-blue-500/10 border-blue-500/25 text-blue-300",
  amber: "bg-amber-500/10 border-amber-500/25 text-amber-300",
};

export default function PageHeader({
  badge,
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  const variant = badge?.variant || "violet";
  const Icon = badge?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`mb-10 md:mb-12 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {badge && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${BADGE_VARIANTS[variant]}`}>
              {Icon && <Icon size={13} className="shrink-0" />}
              <span>{badge.text}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-3xl leading-relaxed">
            {description}
          </p>
          {/* Gradient underline */}
          <div
            className="mt-4 h-0.5 w-20 rounded-full"
            style={{
              background: "linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, transparent 100%)",
            }}
          />
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
