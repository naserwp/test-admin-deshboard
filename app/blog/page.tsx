import Link from "next/link";
import MarketingNav from "@/app/components/MarketingNav";
import MarketingFooter from "@/app/components/MarketingFooter";
import { prisma } from "@/app/lib/prisma";

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

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <MarketingNav />
      </div>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Blog
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Virtual Office insights
          </h1>
          <p className="text-lg text-slate-600">
            Discover guides, updates, and best practices for keeping documents
            organized and secure.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="card flex h-full flex-col p-6">
              {post.coverImageUrl && (
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="h-40 w-full rounded-xl object-cover"
                />
              )}
              <div className="mt-4 flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-indigo-700">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-indigo-50 px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-600">{post.excerpt}</p>
                <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : "Draft"}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
              No blog posts yet. Check back soon.
            </div>
          )}
        </div>
      </div>
      <MarketingFooter />
    </div>
  );
}
