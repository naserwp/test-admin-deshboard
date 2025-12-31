"use client";

import { useState } from "react";
import Link from "next/link";

type TicketFormProps = {
  defaultName?: string;
  defaultEmail?: string;
};

type TicketResponse = {
  ticket?: {
    id: string;
    subject: string;
  };
  error?: string;
};

export default function TicketForm({ defaultName = "", defaultEmail = "" }: TicketFormProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<TicketResponse["ticket"] | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("message", message);
      if (name.trim()) formData.append("name", name.trim());
      if (email.trim()) formData.append("email", email.trim());
      attachments.forEach((file) => formData.append("attachments", file));

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        body: formData,
      });
      const payload = (await res.json().catch(() => ({}))) as TicketResponse;
      if (!res.ok) {
        throw new Error(payload.error || "Unable to create ticket");
      }
      setTicket(payload.ticket || null);
      setSubject("");
      setMessage("");
      setAttachments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Subject</label>
          <input
            name="subject"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            placeholder="Ticket subject"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Description</label>
          <textarea
            name="message"
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            placeholder="Describe the issue..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">User/Contact name</label>
            <input
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
              placeholder="User name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Email</label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
              placeholder="contact@example.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Upload screenshots (optional)
          </label>
          <input
            name="attachments"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) =>
              setAttachments(event.target.files ? Array.from(event.target.files) : [])
            }
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800 dark:text-slate-200 dark:file:bg-white dark:file:text-slate-900 dark:hover:file:bg-slate-200"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Optional; up to 5 images (max 5MB each).
          </p>
        </div>

        {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/support/tickets"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-60 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300"
          >
            {loading ? "Creating..." : "Create ticket"}
          </button>
        </div>
      </form>

      {ticket ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
          <p className="font-semibold">Ticket created successfully.</p>
          <div className="mt-2">
            <Link
              href={`/admin/support/tickets/${ticket.id}`}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-200 dark:hover:text-emerald-100"
            >
              View ticket #{ticket.id}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
