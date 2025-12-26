"use client";

import { useState } from "react";

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
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState(post.tags.join(", "));
  const [metaTitle, setMetaTitle] = useState(post.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    post.metaDescription || ""
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(post.status);
  const [publishedAt, setPublishedAt] = useState(
    formatDateTimeLocal(post.publishedAt)
  );
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
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <div className="space-y-2">
        <p className="text-sm text-slate-500">Editing</p>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
          <input value={tags} onChange={(event) => setTags(event.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setCoverImage(event.target.files?.[0] || null)}
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
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
