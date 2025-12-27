"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import EmptyState from "../_components/EmptyState";
import { LeadJob } from "../_components/LeadCard";

export default function LeadJobDetailsPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId;
  const [job, setJob] = useState<LeadJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    let isMounted = true;

    const loadJob = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/leads/jobs/${jobId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load lead job.");
        }

        const data = await response.json();
        if (isMounted) {
          setJob(data?.job ?? data ?? null);
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

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            Leads
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Job details
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review the lead job configuration and the upcoming results.
          </p>
        </div>
        <Link
          href="/leads"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600"
        >
          ← Back to jobs
        </Link>
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={`summary-${index}`}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {errorMessage}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Keyword
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {job?.keyword ?? "-"}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 px-3 py-1 text-xs font-semibold text-white shadow">
              {job?.status ?? "Queued"}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Location
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {job?.city ? `${job.city}, ` : ""}
              {job?.state ? `${job.state}, ` : ""}
              {job?.country ?? "US"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Size: {job?.businessSize ?? "Any"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Target
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {job?.leadsTarget ?? 50} leads
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Created {job?.createdAt ? new Date(job.createdAt).toLocaleString() : "just now"}
            </p>
          </div>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <p className="mt-1 text-sm text-slate-500">
            Overview of the search parameters used in this job.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-center justify-between">
              <span>Keyword</span>
              <span className="font-medium text-slate-900">
                {job?.keyword ?? "-"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Context</span>
              <span className="font-medium text-slate-900">
                {job?.context ?? "-"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Business size</span>
              <span className="font-medium text-slate-900">
                {job?.businessSize ?? "Any"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Target leads</span>
              <span className="font-medium text-slate-900">
                {job?.leadsTarget ?? 50}
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Results</h2>
              <p className="text-sm text-slate-500">
                Leads will appear here as soon as the job completes.
              </p>
            </div>
            <span className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-3 py-1 text-xs font-semibold text-white shadow">
              Coming soon
            </span>
          </div>

          <div className="mt-6">
            <EmptyState
              title="No results yet"
              description="We are still collecting leads for this job. Check back soon."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
