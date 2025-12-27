"use client";

import Link from "next/link";

export interface LeadJob {
  id: string;
  keyword: string;
  country?: string;
  state?: string | null;
  city?: string | null;
  businessSize?: string | null;
  leadsTarget?: number | null;
  context?: string | null;
  createdAt?: string;
  status?: string;
}

interface LeadCardProps {
  job: LeadJob;
}

export default function LeadCard({ job }: LeadCardProps) {
  return (
    <Link
      href={`/leads/${job.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            {job.keyword}
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            Lead job #{job.id.slice(0, 6)}
          </h3>
        </div>
        <span className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {job.status ?? "Queued"}
        </span>
      </div>
      <div className="text-sm text-slate-500">
        <p>
          {job.city ? `${job.city}, ` : ""}
          {job.state ? `${job.state}, ` : ""}
          {job.country ?? "US"}
        </p>
        <p>
          Target: {job.leadsTarget ?? 50} leads · Size: {job.businessSize ?? "Any"}
        </p>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{job.createdAt ? new Date(job.createdAt).toLocaleString() : "Just now"}</span>
        <span className="text-indigo-500 transition group-hover:text-indigo-600">
          View details →
        </span>
      </div>
    </Link>
  );
}
