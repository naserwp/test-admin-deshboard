import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import BlogManager from "./BlogManager";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: [{ createdAt: "desc" }]
  });

  const userName = session.user.userId || session.user.email || "Admin";
  const imageUrl = (session.user as any).imageUrl;

  const formattedPosts = posts.map((post) => ({
    ...post,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    seoScore: post.seoScore,
    humanScore: post.humanScore
  }));

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.15),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.14),transparent_28%)] opacity-70 dark:opacity-50" />
      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-soft-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">
                Blog Studio
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Manage blog posts
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Create, update, and publish posts with cover images, tags, and rich content.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/70">
                Drag & drop cover URLs
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/70">
                AI-ready excerpts
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/70">
                Publish in one click
              </span>
            </div>
          </div>
          <div className="mt-8">
            <BlogManager initialPosts={formattedPosts} />
          </div>
        </div>
      </div>
    </div>
  );
}
