import Link from "next/link";
import changelogEntries from "@/app/lib/changelog-data.json";
import { PUBLIC_CONTAINER } from "@/app/components/layout/publicNav";

type ChangelogEntry = {
  hash: string;
  subject: string;
  date: string;
};

export default function ChangelogPage() {
  const entries = (changelogEntries as ChangelogEntry[]).map((entry) => ({
    ...entry,
    formattedDate: new Date(entry.date).toLocaleDateString(),
  }));

  return (
    <div className={`relative ${PUBLIC_CONTAINER} flex flex-col gap-10 py-10`}>
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100 shadow-sm dark:bg-slate-900/80 dark:text-indigo-200 dark:ring-slate-800">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Shipping log
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Changelog
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Follow every release—AI upgrades, admin controls, and lead quality improvements—all in one place.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <article
            key={`${entry.hash}-${entry.date}`}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-soft-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-transparent to-sky-50 opacity-80 dark:from-indigo-950/40 dark:to-sky-950/40" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {entry.subject}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                    {entry.formattedDate}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-800">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-slate-700">
                    {entry.hash}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Commit {entry.hash} recorded on {entry.formattedDate}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800">
                  Deployed
                </span>
              </div>
            </div>
          </article>
        ))}
        {!entries.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No changelog entries available yet.
          </div>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
        <div className="space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white">Want earlier access?</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upcoming: lead scoring tweaks, CSV health checks, and pipeline sync.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/auth/signup" className="btn btn-primary">
            Get started
          </Link>
          <Link href="/auth/login" className="btn btn-secondary">
            View dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
