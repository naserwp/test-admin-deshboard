"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalLogo from "../GlobalLogo";
import { publicNavItems } from "./publicNav";

export default function PublicHeader() {
  const pathname = usePathname();

  const isActive = (href: string, currentPath: string | null) => {
    if (!currentPath) return false;
    if (href === "/") return currentPath === "/";
    if (href === "/blog") return currentPath === "/blog" || currentPath.startsWith("/blog/");
    if (href === "/changelog") {
      return currentPath === "/changelog" || currentPath.startsWith("/changelog/");
    }
    if (href === "/agency") {
      return currentPath === "/agency" || currentPath.startsWith("/agency/");
    }
    return currentPath === href;
  };

  const headerLinkClass = (href: string) =>
    [
      "relative inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition-all duration-200",
      isActive(href, pathname)
        ? "bg-white text-slate-900 shadow-sm underline decoration-2 underline-offset-4 decoration-indigo-400 dark:bg-white/10 dark:text-white"
        : "text-slate-600 dark:text-slate-100/80",
      "hover:-translate-y-0.5 hover:text-slate-900 hover:bg-white/70 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]",
      "dark:hover:text-white dark:hover:bg-indigo-500/15 dark:hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
    ].join(" ");

  const headerIconClass = [
    "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
    "text-slate-600 dark:text-slate-100/80",
    "hover:-translate-y-0.5 hover:text-slate-900 hover:bg-white/70 hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]",
    "dark:hover:text-white dark:hover:bg-indigo-500/15 dark:hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
  ].join(" ");

  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.1),transparent_28%)]" />
      <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <GlobalLogo />
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-100/80"
        >
          {publicNavItems.map((item) => (
            <Link key={item.label} href={item.href} className={headerLinkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/signup" className="btn btn-primary">
            Get started
          </Link>
          <Link
            href="/auth/login"
            className={headerIconClass}
            aria-label="Sign in"
            title="Sign in"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-10a4 4 0 1 0-8 0 4 4 0 0 0 8 0m6 8v-2a4 4 0 0 0-3-3.87"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
