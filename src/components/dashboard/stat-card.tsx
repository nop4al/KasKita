import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/mock-data";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "emerald" | "blue" | "rose" | "neutral" | "green" | "red";
  description?: string;
  isCurrency?: boolean;
  badgeText?: string;
  subLabel?: string;
  subValue?: string;
  className?: string;
}

const themeConfigs = {
  emerald: {
    bgLight: "bg-emerald-50/60 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/80",
    iconBox: "bg-emerald-600 text-white shadow-xs",
    tagBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    valueColor: "text-emerald-950 dark:text-emerald-100",
  },
  green: {
    bgLight: "bg-emerald-50/60 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/80",
    iconBox: "bg-emerald-600 text-white shadow-xs",
    tagBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    valueColor: "text-emerald-950 dark:text-emerald-100",
  },
  blue: {
    bgLight: "bg-blue-50/60 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/80",
    iconBox: "bg-blue-600 text-white shadow-xs",
    tagBg: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
    valueColor: "text-blue-950 dark:text-blue-100",
  },
  rose: {
    bgLight: "bg-rose-50/60 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/80",
    iconBox: "bg-rose-600 text-white shadow-xs",
    tagBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
    valueColor: "text-rose-950 dark:text-rose-100",
  },
  red: {
    bgLight: "bg-rose-50/60 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/80",
    iconBox: "bg-rose-600 text-white shadow-xs",
    tagBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
    valueColor: "text-rose-950 dark:text-rose-100",
  },
  neutral: {
    bgLight: "bg-slate-50 dark:bg-zinc-800/40",
    border: "border-slate-200 dark:border-zinc-700",
    iconBox: "bg-slate-700 text-white shadow-xs",
    tagBg: "bg-slate-200 text-slate-800 dark:bg-zinc-700 dark:text-zinc-200",
    valueColor: "text-slate-900 dark:text-zinc-100",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = "emerald",
  description,
  isCurrency = true,
  badgeText,
  subLabel,
  subValue,
  className,
}: StatCardProps) {
  const cfg = themeConfigs[variant] || themeConfigs.emerald;
  const formattedValue =
    typeof value === "number" && isCurrency ? formatRupiah(value) : value;

  return (
    <Card
      className={cn(
        "rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm transition-all duration-150 hover:shadow-md",
        cfg.border,
        className
      )}
    >
      <CardContent className="p-5 space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 block truncate">
              {title}
            </span>
            {badgeText && (
              <span
                className={cn(
                  "inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  cfg.tagBg
                )}
              >
                {badgeText}
              </span>
            )}
          </div>

          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              cfg.iconBox
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.4} />
          </div>
        </div>

        <div>
          <h3
            className={cn(
              "text-2xl sm:text-3xl font-black tracking-tight",
              cfg.valueColor
            )}
          >
            {formattedValue}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {(subLabel || subValue) && (
          <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>{subLabel}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {subValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
