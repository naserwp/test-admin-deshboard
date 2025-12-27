"use client";

import { useState } from "react";
import RichEditor from "./RichEditor";

type BlogPostFormData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverImageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImageUrl?: string | null;
  categories?: string[];
  videoUrl?: string | null;
  seoScore?: number | null;
  humanScore?: number | null;
  customPublished?: string | null;
  readMinutesOverride?: number | null;
  tocOverride?: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
};

type EditBlogFormProps = {
  post: BlogPostFormData;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

export default function EditBlogForm({ post }: EditBlogFormProps) {
  const fieldClass =
    "w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-800/60";

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState(post.tags.join(", "));
  const [metaTitle, setMetaTitle] = useState(post.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    post.metaDescription || ""
  );
  const [metaImageUrl, setMetaImageUrl] = useState(post.metaImageUrl || "");
  const [categories, setCategories] = useState((post.categories || []).join(", "));
  const [videoUrl, setVideoUrl] = useState(post.videoUrl || "");
  const [customPublished, setCustomPublished] = useState(post.customPublished || "");
  const [seoScore, setSeoScore] = useState(post.seoScore || 0);
  const [humanScore, setHumanScore] = useState(post.humanScore || 0);
  const [readMinutesOverride, setReadMinutesOverride] = useState(
    post.readMinutesOverride || ""
  );
  const [tocOverride, setTocOverride] = useState(post.tocOverride || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(post.status);
  const [publishedAt, setPublishedAt] = useState(
    formatDateTimeLocal(post.publishedAt)
  );
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tocLoading, setTocLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const estimateSeo = () => {
    const titleScore = Math.min(40, Math.max(0, title.length / 2));
    const descScore = Math.min(30, Math.max(0, metaDescription.length / 3));
    const headingScore = Math.min(20, content.split("#").length * 3);
    const tagScore = Math.min(
      10,
      Math.max(
        0,
        tags.split(",").filter(Boolean).length * 2 ||
          categories.split(",").filter(Boolean).length * 2
      )
    );
    return Math.min(100, Math.round(titleScore + descScore + headingScore + tagScore));
  };

  const estimateHuman = () => {
    const sentences = content.split(".").length;
    const shortLines = content.split("\n").filter((l) => l.length < 120).length;
    const balance = Math.min(100, Math.round((sentences + shortLines) * 2));
    return balance;
  };

  const handleGenerateToc = async () => {
    setTocLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/toc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to generate TOC");
      }
      const payload = await res.json();
      if (payload.toc) {
        setTocOverride(payload.toc.join("\n"));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to generate TOC");
    } finally {
      setTocLoading(false);
    }
  };

  // autosave draft locally
  const draftKey = `blog-edit-${post.id}`;
  useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTitle(data.title || post.title);
        setSlug(data.slug || post.slug);
        setExcerpt(data.excerpt || post.excerpt);
        setContent(data.content || post.content);
        setTags(data.tags || post.tags.join(", "));
        setMetaTitle(data.metaTitle || post.metaTitle || "");
        setMetaDescription(data.metaDescription || post.metaDescription || "");
        setMetaImageUrl(data.metaImageUrl || post.metaImageUrl || "");
        setCategories(data.categories || (post.categories || []).join(", "));
        setVideoUrl(data.videoUrl || post.videoUrl || "");
        setCustomPublished(data.customPublished || post.customPublished || "");
        setReadMinutesOverride(data.readMinutesOverride || post.readMinutesOverride || "");
        setTocOverride(data.tocOverride || post.tocOverride || "");
        setStatus(data.status || post.status);
        setPublishedAt(data.publishedAt || formatDateTimeLocal(post.publishedAt));
      } catch {
        /* ignore */
      }
    }
  });

  useState(() => {
    if (!autoSave) return;
    const payload = {
      title,
      slug,
      excerpt,
      content,
      tags,
      metaTitle,
      metaDescription,
      metaImageUrl,
      categories,
      videoUrl,
      customPublished,
      readMinutesOverride,
      tocOverride,
      status,
      publishedAt,
    };
    const id = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(draftKey, JSON.stringify(payload));
      }
    }, 800);
    return () => clearTimeout(id);
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append("tags", tags);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("metaImageUrl", metaImageUrl);
    formData.append("categories", categories);
    formData.append("videoUrl", videoUrl);
    formData.append("customPublished", customPublished);
    formData.append("readMinutesOverride", `${readMinutesOverride || ""}`);
    formData.append("tocOverride", tocOverride);
    formData.append("seoScore", estimateSeo().toString());
    formData.append("humanScore", estimateHuman().toString());
    formData.append("status", status);
    formData.append("publishedAt", publishedAt);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    setLoading(true);
    const response = await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      body: formData
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Failed to update blog post.");
      return;
    }

    setMessage("Blog post updated.");
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 shadow-soft-xl">
      <div className="space-y-2">
        <p className="text-sm text-slate-500">Editing</p>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Autosave
            <input
              type="checkbox"
              className="ml-2"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
          </span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Slug</label>
          <input
            value={slug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            required
            className={fieldClass}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={2}
            required
            className={fieldClass}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Content</label>
          <RichEditor value={content} onChange={setContent} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input value={tags} onChange={(event) => setTags(event.target.value)} className={fieldClass} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setCoverImage(event.target.files?.[0] || null)}
            className={fieldClass}
          />
          {post.coverImageUrl && (
            <p className="text-xs text-slate-500">
              Current: {post.coverImageUrl}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Meta title</label>
          <input
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Meta description</label>
          <input
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Meta image URL</label>
          <input
            value={metaImageUrl}
            onChange={(event) => setMetaImageUrl(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Categories (comma separated)</label>
          <input
            value={categories}
            onChange={(event) => setCategories(event.target.value)}
            placeholder="Finance, Credit"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Video embed URL (optional)</label>
          <input
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "DRAFT" | "PUBLISHED")
            }
            className={fieldClass}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Publish date</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Custom publish label</label>
          <input
            value={customPublished}
            onChange={(event) => setCustomPublished(event.target.value)}
            placeholder="e.g., Coming Q4 or Published early"
            className={fieldClass}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Read time (minutes)</label>
          <input
            type="number"
            min={1}
            value={readMinutesOverride}
            onChange={(event) => setReadMinutesOverride(event.target.value)}
            placeholder="Auto-calculated if empty"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Custom TOC (one per line, optional)</label>
          <textarea
            value={tocOverride}
            onChange={(event) => setTocOverride(event.target.value)}
            rows={3}
            placeholder="Intro\nNet 30 basics\nApproval steps"
            className={fieldClass}
          />
          <button
            type="button"
            onClick={handleGenerateToc}
            disabled={tocLoading || !content}
            className="btn btn-secondary mt-2"
          >
            {tocLoading ? "Generating..." : "AI-generate TOC"}
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <p className="font-semibold">SEO Score</p>
          <p className="text-2xl font-bold">{seoScore}/100</p>
          <button
            type="button"
            onClick={() => setSeoScore(estimateSeo())}
            className="btn btn-secondary mt-3 w-full"
          >
            Recalculate
          </button>
        </div>
        <div className="space-y-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <p className="font-semibold">Humanize %</p>
          <p className="text-2xl font-bold">{humanScore}/100</p>
          <button
            type="button"
            onClick={() => setHumanScore(estimateHuman())}
            className="btn btn-secondary mt-3 w-full"
          >
            Recalculate
          </button>
        </div>
      </div>
      {(message || error) && (
        <div className="text-sm">
          {message && <p className="text-emerald-600">{message}</p>}
          {error && <p className="text-rose-600">{error}</p>}
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
