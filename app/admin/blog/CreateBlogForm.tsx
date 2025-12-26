"use client";

import { useState } from "react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
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
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [publishedAt, setPublishedAt] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    formData.append("status", status);
    formData.append("publishedAt", publishedAt);
    if (coverImage) {
      formData.append("coverImage", coverImage);
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
    setMetaTitle("");
    setMetaDescription("");
    setStatus("DRAFT");
    setPublishedAt("");
    setCoverImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Create new post</h2>
        <span className="text-xs text-slate-500">
          Markdown supported in content
        </span>
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
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Slug</label>
          <input
            value={slug}
            onChange={(event) => setSlug(slugify(event.target.value))}
            required
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={2}
            required
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={8}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="productivity, security"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setCoverImage(event.target.files?.[0] || null)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Meta title</label>
          <input
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Meta description</label>
          <input
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "DRAFT" | "PUBLISHED")
            }
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
