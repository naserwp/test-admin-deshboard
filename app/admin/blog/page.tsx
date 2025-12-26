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
    createdAt: post.createdAt.toISOString()
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
      />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Blog
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Manage blog posts
          </h1>
          <p className="text-sm text-slate-600">
            Create, update, and publish blog content for your marketing site.
          </p>
        </div>

        <BlogManager initialPosts={formattedPosts} />
      </div>
    </div>
  );
}
