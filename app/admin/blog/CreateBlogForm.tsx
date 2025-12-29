"use client";

import { useMemo, useState } from "react";
import RichEditor from "./RichEditor";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  seoScore?: number;
  humanScore?: number;
};

type CreateBlogFormProps = {
  onCreated: (post: BlogPost) => void;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function CreateBlogForm({ onCreated }: CreateBlogFormProps) {
  const fieldClass =
    "w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-800/60";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaImageUrl, setMetaImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [customPublished, setCustomPublished] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [publishedAt, setPublishedAt] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverMode, setCoverMode] = useState<"upload" | "url">("upload");
  const [metaImageMode, setMetaImageMode] = useState<"upload" | "url">("url");
  const [videoMode, setVideoMode] = useState<"upload" | "url">("url");
  const [readMinutesOverride, setReadMinutesOverride] = useState("");
  const [tocOverride, setTocOverride] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tocLoading, setTocLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [humanScore, setHumanScore] = useState<number | null>(null);

  const estimateSeo = () => {
    const titleScore = Math.min(40, Math.max(0, title.length / 2));
    const descScore = Math.min(30, Math.max(0, metaDescription.length / 3));
    const headingScore = Math.min(20, content.split("#").length * 3);
    const tagScore = Math.min(10, Math.max(tags.split(",").filter(Boolean).length, categories.split(",").filter(Boolean).length) * 2);
    return Math.min(100, Math.round(titleScore + descScore + headingScore + tagScore));
  };

  const estimateHuman = () => {
    const sentences = content.split(".").length;
    const shortLines = content.split("\n").filter((l) => l.length < 120).length;
    return Math.min(100, Math.round((sentences + shortLines) * 2));
  };

  const isSeoStrong = useMemo(() => estimateSeo() >= 75, [content, metaDescription, tags, categories, title]);
  const computedHumanScore = useMemo(
    () => humanScore ?? estimateHuman(),
    [humanScore, content]
  );

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

  const handleAiSeo = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/blog/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, content }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to generate SEO");
      }
      const payload = await res.json();
      if (payload.excerpt) setExcerpt(payload.excerpt);
      if (payload.metaDescription) setMetaDescription(payload.metaDescription);
      if (typeof payload.humanScore === "number") setHumanScore(payload.humanScore);
    } catch (err: any) {
      setError(err?.message || "Failed to generate SEO");
    }
  };

  // Autosave to localStorage
  const draftKey = "blog-create-draft";
  useMemo(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setExcerpt(data.excerpt || "");
        setContent(data.content || "");
        setTags(data.tags || "");
        setCategories(data.categories || "");
        setMetaTitle(data.metaTitle || "");
        setMetaDescription(data.metaDescription || "");
        setMetaImageUrl(data.metaImageUrl || "");
        setCoverImageUrl(data.coverImageUrl || "");
        setVideoUrl(data.videoUrl || "");
        setCustomPublished(data.customPublished || "");
        setStatus(data.status || "DRAFT");
        setPublishedAt(data.publishedAt || "");
        setReadMinutesOverride(data.readMinutesOverride || "");
        setTocOverride(data.tocOverride || "");
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMemo(() => {
    if (!autoSave) return;
    const payload = {
      title,
      slug,
      excerpt,
      content,
      tags,
      categories,
      metaTitle,
      metaDescription,
      metaImageUrl,
      coverImageUrl,
      videoUrl,
      customPublished,
      status,
      publishedAt,
      readMinutesOverride,
      tocOverride,
    };
    const id = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(payload));
    }, 800);
    return () => clearTimeout(id);
  }, [
    autoSave,
    title,
    slug,
    excerpt,
    content,
    tags,
    categories,
    metaTitle,
    metaDescription,
    metaImageUrl,
    coverImageUrl,
    videoUrl,
    customPublished,
    status,
    publishedAt,
    readMinutesOverride,
    tocOverride,
  ]);

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
    formData.append("categories", categories);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("metaImageUrl", metaImageUrl);
    formData.append("videoUrl", videoUrl);
    formData.append("customPublished", customPublished);
    formData.append("status", status);
    formData.append("publishedAt", publishedAt);
    formData.append("seoScore", estimateSeo().toString());
    formData.append("humanScore", computedHumanScore.toString());
    formData.append("readMinutesOverride", readMinutesOverride);
    formData.append("tocOverride", tocOverride);

    if (coverMode === "upload" && coverImage) {
      formData.append("coverImage", coverImage);
    }
    if (coverMode === "url" && coverImageUrl) {
      formData.append("coverImageUrl", coverImageUrl);
    }
    if (metaImageMode === "upload" && coverImage) {
      formData.append("metaImageUrl", coverImageUrl || metaImageUrl);
    } else if (metaImageMode === "url" && metaImageUrl) {
      formData.append("metaImageUrl", metaImageUrl);
    }

    if (videoMode === "upload" && videoFile) {
      formData.append("videoFile", videoFile);
    }

    setLoading(true);
    const response = await fetch("/api/admin/blog", {
      method: "POST",
      body: formData
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Failed to create blog post.");
      return;
    }

    const payload = await response.json();
    onCreated(payload.post);
    setMessage("Blog post created.");
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setTags("");
    setCategories("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaImageUrl("");
    setCoverImageUrl("");
    setVideoUrl("");
    setReadMinutesOverride("");
    setTocOverride("");
    setCustomPublished("");
    setStatus("DRAFT");
    setPublishedAt("");
    setCoverImage(null);
    setVideoFile(null);
    setHumanScore(null);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6 shadow-soft-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Create new post</h2>
          <p className="text-xs text-slate-500">Visual editor · drag & drop media</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`rounded-full px-3 py-1 ${isSeoStrong ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            SEO {estimateSeo()}/100
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Human {computedHumanScore}/100
          </span>
          <label className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            Autosave
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slug) {
                setSlug(slugify(event.target.value));
              }
            }}
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
      </div>

      <RichEditor value={content} onChange={setContent} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="productivity, security"
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Cover image</span>
            <div className="flex gap-2 text-xs">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="cover-mode"
                  checked={coverMode === "upload"}
                  onChange={() => setCoverMode("upload")}
                />
                Upload
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="cover-mode"
                  checked={coverMode === "url"}
                  onChange={() => setCoverMode("url")}
                />
                URL
              </label>
            </div>
          </div>
          {coverMode === "upload" ? (
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setCoverImage(event.target.files?.[0] || null)}
              className={fieldClass}
            />
          ) : (
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className={fieldClass}
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Meta image</span>
            <div className="flex gap-2 text-xs">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="meta-mode"
                  checked={metaImageMode === "url"}
                  onChange={() => setMetaImageMode("url")}
                />
                URL
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="meta-mode"
                  checked={metaImageMode === "upload"}
                  onChange={() => setMetaImageMode("upload")}
                />
                Upload
              </label>
            </div>
          </div>
          {metaImageMode === "url" ? (
            <input
              value={metaImageUrl}
              onChange={(event) => setMetaImageUrl(event.target.value)}
              placeholder="https://example.com/meta.jpg"
              className={fieldClass}
            />
          ) : (
            <p className="text-xs text-slate-500">Meta will reuse cover upload when provided.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Video</span>
            <div className="flex gap-2 text-xs">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="video-mode"
                  checked={videoMode === "url"}
                  onChange={() => setVideoMode("url")}
                />
                Embed URL
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="video-mode"
                  checked={videoMode === "upload"}
                  onChange={() => setVideoMode("upload")}
                />
                Upload
              </label>
            </div>
          </div>
          {videoMode === "url" ? (
            <input
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://www.youtube.com/embed/..."
              className={fieldClass}
            />
          ) : (
            <input
              type="file"
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
              className={fieldClass}
            />
          )}
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

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      {(message || error) && (
        <div className="text-sm">
          {message && <p className="text-emerald-600">{message}</p>}
          {error && <p className="text-rose-600">{error}</p>}
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving..." : "Create post"}
      </button>
    </form>
  );
}
