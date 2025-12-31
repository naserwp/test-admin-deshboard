"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import MarketingNav from "@/app/components/MarketingNav";
import GlobalFooter from "@/app/components/GlobalFooter";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
};

export default function TalkToSalesPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      toast.error("Name, email, and message are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/talk-to-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: form.phone.trim(),
          company: form.company.trim(),
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Unable to submit right now.");
        return;
      }
      toast.success("Thanks! We’ll reach out shortly.");
      setForm(initialForm);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.15),transparent_30%)] opacity-70 dark:opacity-50" />
      <div className="relative mx-auto max-w-6xl px-6 pt-6">
        <MarketingNav />
      </div>

      <main className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.6fr_0.4fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:bg-slate-800 dark:text-indigo-200">
                Talk to Sales
              </p>
              <h1 className="text-3xl font-semibold">Let’s plan your rollout.</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Share a few details and we’ll follow up with a tailored Virtual Office plan.
              </p>
            </div>

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
                    Email
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
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                    placeholder="+1 555 123 4567"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Company
                  </label>
                  <input
                    value={form.company}
                    onChange={(event) => handleChange("company", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                    placeholder="Virtual Office"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Notes
                </label>
                <textarea
                  value={form.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                  placeholder="Tell us about your team, timeline, and goals."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                >
                  Prefer self-serve? Start a trial →
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300"
                >
                  {submitting ? "Sending..." : "Talk to sales"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-soft-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <h2 className="text-lg font-semibold">What to expect</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>• Response within one business day.</li>
                <li>• A tailored walkthrough of admin controls.</li>
                <li>• Help planning data migration and rollout.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Booking integrations coming soon.
              </p>
              <p className="mt-2">
                We’re preparing calendar scheduling and automated lead routing for this page.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <GlobalFooter />
      </div>
    </div>
  );
}
