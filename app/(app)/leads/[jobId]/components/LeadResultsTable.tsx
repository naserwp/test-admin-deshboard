"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type LeadResult = {
  id: string;
  businessName: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  ownerName?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  source?: string | null;
  confidence?: number | null;
  notes?: string | null;
  isHidden?: boolean;
  isArchived?: boolean;
};

type LeadResultsTableProps = {
  jobId: string;
  results: LeadResult[];
};

const PAGE_SIZE = 10;

export default function LeadResultsTable({ jobId, results }: LeadResultsTableProps) {
  const [localResults, setLocalResults] = useState<LeadResult[]>(results);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [minConfidence, setMinConfidence] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLocalResults(results);
    setSelectedIds(new Set());
    setPage(1);
  }, [results]);

  useEffect(() => {
    setPage(1);
  }, [sourceFilter, stateFilter, cityFilter, minConfidence, showHidden, showArchived]);

  const sources = useMemo(() => {
    return Array.from(
      new Set(localResults.map((result) => result.source).filter(Boolean) as string[])
    );
  }, [localResults]);

  const filtered = useMemo(() => {
    const min = minConfidence ? Number(minConfidence) : null;
    return localResults.filter((result) => {
      if (sourceFilter && result.source !== sourceFilter) return false;
      if (stateFilter && result.state !== stateFilter) return false;
      if (cityFilter && result.city !== cityFilter) return false;
      if (!showHidden && result.isHidden) return false;
      if (!showArchived && result.isArchived) return false;
      if (min !== null && Number.isFinite(min)) {
        if (result.confidence === null || result.confidence === undefined) return false;
        if ((result.confidence ?? 0) < min) return false;
      }
      return true;
    });
  }, [localResults, sourceFilter, stateFilter, cityFilter, minConfidence, showHidden, showArchived]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const visibleIds = paged.map((result) => result.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = visibleIds.every((id) => next.has(id));
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const exportAllUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("mode", "all");
    if (sourceFilter) params.set("source", sourceFilter);
    if (stateFilter) params.set("state", stateFilter);
    if (cityFilter) params.set("city", cityFilter);
    if (minConfidence) params.set("minConfidence", minConfidence);
    if (showHidden) params.set("includeHidden", "true");
    if (showArchived) params.set("includeArchived", "true");
    return `/api/leads/jobs/${jobId}/export.csv?${params.toString()}`;
  }, [jobId, sourceFilter, stateFilter, cityFilter, minConfidence, showHidden, showArchived]);

  const exportSelectedUrl = useMemo(() => {
    if (!selectedIds.size) return null;
    const params = new URLSearchParams();
    params.set("mode", "selected");
    params.set("ids", Array.from(selectedIds).join(","));
    return `/api/leads/jobs/${jobId}/export.csv?${params.toString()}`;
  }, [jobId, selectedIds]);

  const handleUpdateResult = async (id: string, updates: { isHidden?: boolean; isArchived?: boolean }) => {
    try {
      const response = await fetch(`/api/leads/results/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Update failed.");
      }
      setLocalResults((prev) =>
        prev.map((result) =>
          result.id === id ? { ...result, ...updates } : result
        )
      );
      toast.success("Lead updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    }
  };

  const formatConfidence = (value?: number | null) => {
    if (value === null || value === undefined) return "-";
    return `${Math.round(value * 100)}%`;
  };

  const buildTags = (result: LeadResult) => {
    const tags = [
      result.industry,
      result.source ? result.source.replace(/-/g, " ") : null,
      result.city,
      result.state,
    ].filter(Boolean) as string[];
    return Array.from(new Set(tags)).slice(0, 4);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <label className="flex items-center gap-2">
            Source
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-2 py-1"
            >
              <option value="">All</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            State
            <input
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
              className="w-20 rounded-full border border-slate-200 bg-white px-2 py-1"
              placeholder="CA"
            />
          </label>
          <label className="flex items-center gap-2">
            City
            <input
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="w-24 rounded-full border border-slate-200 bg-white px-2 py-1"
              placeholder="Austin"
            />
          </label>
          <label className="flex items-center gap-2">
            Min conf.
            <input
              value={minConfidence}
              onChange={(event) => setMinConfidence(event.target.value)}
              className="w-16 rounded-full border border-slate-200 bg-white px-2 py-1"
              placeholder="70"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(event) => setShowHidden(event.target.checked)}
            />
            Show hidden
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
            />
            Show archived
          </label>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <a
            href={exportAllUrl}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm"
          >
            Export all
          </a>
          {exportSelectedUrl ? (
            <a
              href={exportSelectedUrl}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-2 text-white shadow-sm"
            >
              Export selected ({selectedIds.size})
            </a>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-4">
                <input type="checkbox" onChange={toggleSelectAll} />
              </th>
              <th className="px-4 py-4">Business</th>
              <th className="px-4 py-4">Owner</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Phone</th>
              <th className="px-4 py-4">Location</th>
              <th className="px-4 py-4">Confidence</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map((result) => (
              <tr key={result.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-4 align-top">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(result.id)}
                    onChange={() => toggleSelect(result.id)}
                  />
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="space-y-2">
                    <div className="font-semibold text-slate-900">
                      {result.businessName}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {buildTags(result).length ? (
                        buildTags(result).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No tags yet</span>
                      )}
                    </div>
                    {result.website ? (
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"
                      >
                        Visit website
                      </a>
                    ) : null}
                    <div className="text-xs text-slate-500">
                      {result.notes ? (
                        <span>AI context: {result.notes}</span>
                      ) : (
                        <span>AI context not generated</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-slate-600">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-500">Industry</div>
                    <div>{result.industry ?? "-"}</div>
                    <div className="text-xs font-semibold text-slate-500">Source</div>
                    <div className="capitalize">{result.source ?? "-"}</div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-slate-600">
                  {result.ownerName ?? "-"}
                </td>
                <td className="px-4 py-4 align-top text-slate-600">
                  {result.email ? (
                    <a href={`mailto:${result.email}`} className="text-indigo-600">
                      {result.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-4 align-top text-slate-600">
                  {result.phone ? (
                    <a href={`tel:${result.phone}`} className="text-indigo-600">
                      {result.phone}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-4 align-top text-slate-600">
                  {[result.city, result.state, result.country]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </td>
                <td className="px-4 py-4 align-top text-slate-600">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {formatConfidence(result.confidence)}
                  </span>
                </td>
                <td className="px-4 py-4 align-top text-xs font-semibold text-slate-600">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateResult(result.id, { isHidden: !result.isHidden })}
                      className="rounded-full border border-slate-200 bg-white px-2 py-1"
                    >
                      {result.isHidden ? "Unhide" : "Hide"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateResult(result.id, { isArchived: !result.isArchived })}
                      className="rounded-full border border-slate-200 bg-white px-2 py-1"
                    >
                      {result.isArchived ? "Unarchive" : "Archive"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!paged.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No leads match the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {paged.length} of {filtered.length} results
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Prev
          </button>
          <span>
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={page >= pageCount}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
