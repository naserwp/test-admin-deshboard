"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type LeadJobAdminFormProps = {
  jobId: string;
  keyword: string;
  context?: string | null;
  status: string;
  leadsTarget: number;
  progress: number;
};

const STATUS_OPTIONS = ["QUEUED", "RUNNING", "COMPLETED", "FAILED"];

export default function LeadJobAdminForm({
  jobId,
  keyword,
  context,
  status,
  leadsTarget,
  progress,
}: LeadJobAdminFormProps) {
  const [formData, setFormData] = useState({
    keyword,
    context: context ?? "",
    status,
    leadsTarget,
    progress,
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "leadsTarget" || name === "progress" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to update job.");
      }
      toast.success("Lead job updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Keyword</span>
          <input
            name="keyword"
            value={formData.keyword}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Status</span>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-600">
        <span className="font-medium text-slate-800">Context</span>
        <textarea
          name="context"
          value={formData.context}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Leads target</span>
          <input
            name="leadsTarget"
            type="number"
            min={1}
            value={formData.leadsTarget}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Progress (%)</span>
          <input
            name="progress"
            type="number"
            min={0}
            max={100}
            value={formData.progress}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
