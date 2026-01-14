"use client";

import { useState } from "react";

export default function UploadForm() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    setLoading(true);
    const response = await fetch("/api/admin/files/upload", {
      method: "POST",
      body: formData
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Upload failed");
      return;
    }

    setMessage("File uploaded successfully.");
    setTitle("");
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">PDF File</label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            required
            className="block w-full flex-1 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800 dark:text-slate-200 dark:file:bg-sky-500 dark:file:text-white dark:hover:file:bg-sky-400"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose a PDF and click upload to add it to the library.
        </p>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {message && <p className="text-sm text-green-600 dark:text-emerald-300">{message}</p>}
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>Uploads appear in the table below.</span>
      </div>
    </form>
  );
}
