"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type DocumentRequestFormProps = {
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
};

const initialForm = {
  name: "",
  email: "",
  phone: "",
  docType: "",
  businessName: "",
  state: "",
  notes: "",
};

export default function DocumentRequestForm({
  defaultName,
  defaultEmail,
  defaultPhone,
}: DocumentRequestFormProps) {
  const [form, setForm] = useState({
    ...initialForm,
    name: defaultName,
    email: defaultEmail,
    phone: defaultPhone,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      docType: form.docType.trim(),
      businessName: form.businessName.trim(),
      state: form.state.trim(),
      notes: form.notes.trim(),
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.docType || !payload.businessName || !payload.notes) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/documents/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Unable to submit right now.");
        return;
      }
      toast.success("Request submitted. We’ll be in touch soon.");
      setForm({ ...initialForm, name: defaultName, email: defaultEmail, phone: defaultPhone });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-soft-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Name
          </label>
          <input
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            placeholder="Jane Doe"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Contact email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Contact phone
          </label>
          <input
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            placeholder="+1 555 123 4567"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Document type
          </label>
          <input
            value={form.docType}
            onChange={(event) => handleChange("docType", event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            placeholder="Certificate of good standing"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Business name
          </label>
          <input
            value={form.businessName}
            onChange={(event) => handleChange("businessName", event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            placeholder="Virtual Office LLC"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            State (optional)
          </label>
          <input
            value={form.state}
            onChange={(event) => handleChange("state", event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            placeholder="CA"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Notes / instructions
        </label>
        <textarea
          value={form.notes}
          onChange={(event) => handleChange("notes", event.target.value)}
          required
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
          placeholder="Any deadlines, delivery format, or filing details."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We’ll confirm receipt and follow up with availability.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300"
        >
          {submitting ? "Sending..." : "Submit request"}
        </button>
      </div>
    </form>
  );
}
