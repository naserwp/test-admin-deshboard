"use client";

import Link from "next/link";
import { useState } from "react";
import CreateBlogForm from "./CreateBlogForm";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
};

type BlogManagerProps = {
  initialPosts: BlogPost[];
};

export default function BlogManager({ initialPosts }: BlogManagerProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleDelete = async (postId: string) => {
    setError("");
    setMessage("");
    const confirmed = window.confirm("Delete this blog post?");
    if (!confirmed) return;

    const response = await fetch(`/api/admin/blog/${postId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error || "Failed to delete blog post.");
      return;
    }

    setPosts((current) => current.filter((post) => post.id !== postId));
    setMessage("Blog post deleted.");
  };

  return (
    <div className="mt-8 space-y-8">
      <CreateBlogForm onCreated={(post) => setPosts((current) => [post, ...current])} />

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">All posts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Published</th>
                <th>Slug</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-slate-200">
                  <td className="font-medium text-slate-900">{post.title}</td>
                  <td>
                    <span
                      className={`badge ${
                        post.status === "PUBLISHED"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {post.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="text-slate-600">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="text-slate-600">/{post.slug}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No posts yet. Create the first blog post above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {(message || error) && (
          <div className="border-t border-slate-200 px-6 py-4 text-sm">
            {message && <p className="text-emerald-600">{message}</p>}
            {error && <p className="text-rose-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
