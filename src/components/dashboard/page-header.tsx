import * as React from "react";
import { Badge } from "@/components/ui/badge";

export interface PageHeaderProps {
  badgeText?: string;
  categoryText?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  badgeText = "Oktober 2026",
  categoryText = "KasKita · RT 04 / RW 08",
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {categoryText}
            </span>
            <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Periode {badgeText}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            {description}
          </p>
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
