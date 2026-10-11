"use client";

import * as React from "react";
import { Landmark } from "lucide-react";

interface DashboardLoadingScreenProps {
  minDuration?: number;
}

export function DashboardLoadingScreen({ minDuration = 650 }: DashboardLoadingScreenProps) {
  const [visible, setVisible] = React.useState(true);
  const [fading, setFading] = React.useState(false);
  const [progress, setProgress] = React.useState(15);

  React.useEffect(() => {
    const t1 = setTimeout(() => setProgress(55), 140);
    const t2 = setTimeout(() => setProgress(88), 320);
    const t3 = setTimeout(() => setProgress(100), minDuration - 100);

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, minDuration);

    const unmountTimer = setTimeout(() => {
      setVisible(false);
    }, minDuration + 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [minDuration]);

  if (!visible) return null;

  return (
    <div
      data-testid="dashboard-loading-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 transition-all duration-400 ease-out ${
        fading ? "opacity-0 scale-105 pointer-events-none blur-[1px]" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute h-72 w-72 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl pointer-events-none -z-10 animate-pulse-ring" />

      <div className="flex flex-col items-center gap-4">
        {/* Animated App Icon with float & pulse-ring */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-3xl bg-emerald-500/20 dark:bg-emerald-500/30 blur-sm animate-pulse-ring pointer-events-none" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-500/10 animate-float">
            <Landmark className="h-8 w-8 transition-transform" strokeWidth={2.4} />
          </div>
        </div>

        {/* Brand Name with smooth entrance */}
        <div className="text-center">
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            KasKita
          </span>
        </div>

        {/* Shimmering Progress Bar */}
        <div className="relative w-52 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1 shadow-inner">
          <div
            className="relative h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer highlight sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
