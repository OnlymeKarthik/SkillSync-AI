import React from "react";

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
    <div className={`mb-8 md:mb-10 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {badge && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${BADGE_VARIANTS[variant]}`}>
              {Icon && <Icon size={13} className="shrink-0" />}
              <span>{badge.text}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2.5">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
