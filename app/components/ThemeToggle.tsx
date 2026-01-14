"use client";

import { useMemo } from "react";
import { useThemeMode } from "./ThemeProvider";

const modes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useThemeMode();

  const label = useMemo(() => {
    if (theme === "system") return "AUTO";
    return theme.toUpperCase();
  }, [theme]);

  const nextMode = () => {
    const currentIndex = modes.indexOf(theme);
    const next = modes[(currentIndex + 1) % modes.length];
    setTheme(next);
  };

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={nextMode}
      className="flex h-11 min-w-[2.75rem] items-center justify-center rounded-full border border-slate-300 bg-white/90 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-md backdrop-blur transition hover:border-slate-400 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:border-slate-600 dark:bg-slate-800/95 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800/80"
      aria-label="Toggle theme"
    >
      <span
        className={`mr-2 inline-flex h-2.5 w-2.5 rounded-full ${
          isDark ? "bg-slate-100" : "bg-slate-900"
        }`}
      />
      <span>{label}</span>
    </button>
  );
}
