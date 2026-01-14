"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GlobalLogo from "./GlobalLogo";

const slides = [
  {
    title: "Lead intelligence, rebuilt for dark ops teams",
    subtitle: "AI synthesis + multi-channel signals (LinkedIn, Google, directories) with validated contacts.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Admins can solve issues faster",
    subtitle: "Impersonate safely, audit everything, and keep every workspace unblocked.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Virtual Office, elevated",
    subtitle: "Secure docs, live assignments, AI context, and a polished dark canvas your team loves.",
    image:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function GlobalHeader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const activeSlide = useMemo(() => slides[index], [index]);
  const headerLinkClass = [
    "relative inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold transition-all duration-200",
    "text-slate-600 dark:text-slate-100/80",
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
    <header className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-soft-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.2),transparent_28%)] animate-pulse-slow" />
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-6 h-40 w-40 rounded-full bg-sky-500/30 blur-3xl" />

      <div className="relative flex flex-col gap-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <GlobalLogo />
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-100/80">
            <Link href="/" className={headerLinkClass}>
              Home
            </Link>
            <Link href="/changelog" className={headerLinkClass}>
              Changelog
            </Link>
            <Link href="/agency" className={headerLinkClass}>
              Agency
            </Link>
            <Link href="/blog" className={headerLinkClass}>
              Blog
            </Link>
            <Link href="/auth/signup" className={headerLinkClass}>
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
          </nav>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-200 ring-1 ring-white/10">
              Global banner • {String(index + 1).padStart(2, "0")} / {slides.length}
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {activeSlide.title}
            </h1>
            <p className="max-w-2xl text-sm text-slate-200">
              {activeSlide.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl"
              >
                Start now
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                View dashboard
              </Link>
              <Link
                href="/changelog"
                className="inline-flex items-center justify-center rounded-full border border-indigo-300/60 bg-indigo-500/30 px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-500/50"
              >
                Recent updates
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-300">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Compliance live
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                AI enrichment
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Admin guardrails
              </span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-lg ring-1 ring-white/10 dark:border-slate-800">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60 transition duration-700"
              style={{ backgroundImage: `url(${activeSlide.image})` }}
            />
            <div className="relative flex h-full flex-col justify-between bg-gradient-to-b from-black/50 via-slate-900/50 to-slate-900/80 p-6">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
                <span className="inline-flex items-center gap-2">
                  Hero slider
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[11px]">Live</span>
              </div>
              <div className="space-y-3">
                <p className="text-xl font-semibold">Virtual Office Spotlight</p>
                <p className="text-sm text-slate-200">
                  Rotating highlights of what&apos;s new: richer leads, admin impersonation, and
                  AI-powered context so your workspace feels alive.
                </p>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                  {slides.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-8 rounded-full transition ${
                        i === index ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
