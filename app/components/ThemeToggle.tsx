"use client";

import { useMemo, useState } from "react";
import { useThemeMode } from "./ThemeProvider";

type ThemeButton = {
  value: "light" | "dark" | "system";
  label: string;
};

type ThemeToggleProps = {
  compact?: boolean;
};

const themeButtons: ThemeButton[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Reset" },
];

export default function ThemeToggle({ compact }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useThemeMode();
  const [open, setOpen] = useState(false);

  const activeLabel = useMemo(() => {
    const active = themeButtons.find((item) => item.value === theme);
    return active?.label ?? "System";
  }, [theme]);

  const indicatorClass =
    resolvedTheme === "dark"
      ? "bg-slate-900 dark:bg-slate-100"
      : "bg-amber-400 dark:bg-slate-200";

  const containerBase =
    "group relative flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-600";

  const pillBase =
    "flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold transition";

  return (
    <div className="relative z-50">
      <button
        type="button"
        className={`${containerBase} ${compact ? "px-1.5 py-0.5" : "px-2.5 py-1"}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle theme"
      >
        <span className="flex items-center gap-1">
          <span className={`h-2.5 w-2.5 rounded-full ${indicatorClass}`} />
          {!compact && <span className="hidden sm:inline">{activeLabel}</span>}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {resolvedTheme}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-2xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <p className="px-2 pb-1 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Theme
          </p>
          <div className="space-y-1">
            {themeButtons.map((item) => {
              const isActive = theme === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                className={`${pillBase} ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                }`}
                  onClick={() => {
                    setTheme(item.value);
                    setOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                  {item.value === "system" && (
                    <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                      auto
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
