"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import EmptyState from "../_components/EmptyState";
import { LeadJob } from "../_components/LeadCard";
import LeadResultsTable from "./components/LeadResultsTable";

type LeadResult = {
  id: string;
  businessName: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  confidence?: number | null;
  notes?: string | null;
  isHidden?: boolean;
  isArchived?: boolean;
};

type LeadJobDetail = LeadJob & {
  results?: LeadResult[];
};

export default function LeadJobDetailsPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId;
  const [job, setJob] = useState<LeadJobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);

  const loadJob = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/leads/jobs/${jobId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Unable to load lead job.");
      }

      setJob(data?.job ?? data ?? null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleRunJob = async () => {
    if (!jobId) return;
    setIsRunning(true);
    try {
      const response = await fetch(`/api/leads/jobs/${jobId}/run`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to run lead job.");
      }
      toast.success(
        `${payload?.insertedCount ?? 0} leads saved (from ${
          payload?.totalFound ?? 0
        } found).`
      );
      await loadJob();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lead run failed."
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleEnrichJob = async () => {
    if (!jobId) return;
    setIsEnriching(true);
    try {
      const response = await fetch(`/api/leads/jobs/${jobId}/enrich`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to enrich leads.");
      }
      toast.success(`${payload?.enrichedCount ?? 0} leads enriched.`);
      await loadJob();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Enrichment failed."
      );
    } finally {
      setIsEnriching(false);
    }
  };

  const progressValue =
    job?.status === "COMPLETED" ? 100 : Math.max(0, job?.progress ?? 0);

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
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRunJob}
            disabled={isRunning}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isRunning ? "Running..." : "Run job"}
          </button>
          <button
            type="button"
            onClick={handleEnrichJob}
            disabled={isEnriching || !job?.results?.length}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {isEnriching ? "Enriching..." : "Enrich with AI"}
          </button>
          <Link
            href="/leads"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600"
          >
            ← Back to jobs
          </Link>
        </div>
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
              Size: {job?.size ?? "Any"}
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
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                style={{ width: `${Math.min(progressValue, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {progressValue}% complete
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
                {job?.size ?? "Any"}
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
              {job?.status ?? "Queued"}
            </span>
          </div>

          <div className="mt-6">
            {job?.results && job.results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    {job.results.length} results found
                  </p>
                </div>

                <LeadResultsTable jobId={jobId} results={job.results} />
              </div>
            ) : (
              <EmptyState
                title="No results yet"
                description="We are still collecting leads for this job. Check back soon."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
