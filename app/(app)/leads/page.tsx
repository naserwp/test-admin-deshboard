"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LeadCard, { LeadJob } from "./_components/LeadCard";
import EmptyState from "./_components/EmptyState";

export default function LeadsPage() {
  const [jobs, setJobs] = useState<LeadJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/leads/jobs", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load lead jobs.");
        }

        const data = await response.json();
        if (isMounted) {
          setJobs(Array.isArray(data) ? data : data.jobs ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Something went wrong."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            Leads
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Lead generation jobs
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track keyword-based lead jobs and review results as they arrive.
          </p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          + New lead job
        </Link>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-900">Current queue</p>
            <p className="text-xs text-slate-500">
              {isLoading
                ? "Loading jobs..."
                : `${jobs.length} job${jobs.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 px-3 py-1 text-xs font-semibold text-white shadow">
            Live
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={`loading-${index}`}
                className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {errorMessage}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No lead jobs yet"
            description="Create your first lead job to start collecting prospects."
            actionHref="/leads/new"
            actionLabel="Create lead job"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <LeadCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
