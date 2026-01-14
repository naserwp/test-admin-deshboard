import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { samplePosts } from "@/app/lib/samplePosts";

const wordsPerMinute = 180;
const readingTime = (content: string) =>
  Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / wordsPerMinute));

export const metadata = {
  title: "Blog | Virtual Office Management",
  description:
    "Insights, product updates, and guides for building secure, modern document workflows.",
  openGraph: {
    title: "Blog | Virtual Office Management",
    description:
      "Insights, product updates, and guides for building secure, modern document workflows."
  }
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });

  const displayPosts =
    posts.length > 0
      ? posts.map((post) => ({
          ...post,
          readMinutes: post.readMinutesOverride || readingTime(post.content)
        }))
      : samplePosts.map((post) => ({
          ...post,
          readMinutes: readingTime(post.content)
        }));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Blog
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Virtual Office insights
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Discover guides, updates, and best practices for keeping documents
            organized and secure.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post) => (
            <article
              key={post.id}
              className="card relative flex h-full flex-col overflow-hidden p-0 shadow-md transition hover:-translate-y-1 hover:shadow-soft-xl"
            >
              {post.coverImageUrl && (
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-white">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/20 px-2 py-1 backdrop-blur"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {post.excerpt}
                </p>
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    {post.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full bg-emerald-50 px-2 py-1 dark:bg-emerald-900/40 dark:text-emerald-100"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : "Draft"}
                    <span className="h-1 w-1 rounded-full bg-slate-400" />
                    {post.readMinutes} min read
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {displayPosts.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
              No blog posts yet. Check back soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
