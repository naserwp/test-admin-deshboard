"use client";

import { useEffect, useMemo, useState } from "react";

type TocItem = { level: number; text: string; slug: string };

export default function TOCClient({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.slug);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const grouped = useMemo(() => items, [items]);

  const handleClick = (slug: string) => {
    const el = document.getElementById(slug);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-24 space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 dark:text-sky-300">
        Table of contents
      </p>
      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-200">
        {grouped.length === 0 && <p className="text-slate-400">No sections detected.</p>}
        {grouped.map((item) => {
          const depth =
            item.level === 1 ? "" : item.level === 2 ? "pl-3 text-[13px]" : "pl-5 text-[12px]";
          const isActive = active === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => handleClick(item.slug)}
              className={`group flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800 ${depth}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition ${
                  isActive ? "bg-sky-500" : "bg-slate-300"
                }`}
              />
              <span
                className={`flex-1 transition ${
                  isActive ? "text-sky-700 dark:text-sky-300" : ""
                }`}
              >
                {item.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
