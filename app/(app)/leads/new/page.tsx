"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const BUSINESS_SIZES = ["Any", "1-10", "11-50", "51-200", "200+"];

export default function NewLeadJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    keyword: "",
    context: "",
    country: "US",
    state: "",
    city: "",
    businessSize: "Any",
    leadsTarget: 50,
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "leadsTarget" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.keyword.trim()) {
      toast.error("Keyword is required to create a lead job.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/leads/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create lead job.");
      }

      toast.success("Lead job created successfully.");
      router.push("/leads");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create lead job."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
          Leads
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Create a new lead job
        </h1>
        <p className="text-sm text-slate-500">
          Configure your search parameters and we will start collecting relevant
          leads.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Job details</h2>
              <p className="text-sm text-slate-500">
                Keyword and context help refine your results.
              </p>
            </div>
            <span className="rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 px-3 py-1 text-xs font-semibold text-white shadow">
              Step 1
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Keyword <span className="text-rose-500">*</span>
              </span>
              <input
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                placeholder="e.g. dental clinics"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                required
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Context</span>
              <textarea
                name="context"
                value={formData.context}
                onChange={handleChange}
                placeholder="Optional notes about ideal customers, industries, or exclusions."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Targeting</h2>
              <p className="text-sm text-slate-500">
                Optional filters to narrow your lead sources.
              </p>
            </div>
            <span className="rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 px-3 py-1 text-xs font-semibold text-white shadow">
              Step 2
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Country</span>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="US"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">State</span>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="CA"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">City</span>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="San Francisco"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Business size
              </span>
              <select
                name="businessSize"
                value={formData.businessSize}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {BUSINESS_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Leads target
              </span>
              <input
                type="number"
                name="leadsTarget"
                min={1}
                value={formData.leadsTarget}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            We will start collecting leads once this job is created.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Creating..." : "Create lead job"}
          </button>
        </div>
      </form>
    </div>
  );
}
