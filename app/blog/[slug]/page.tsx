import { notFound } from "next/navigation";
import MarketingNav from "@/app/components/MarketingNav";
import MarketingFooter from "@/app/components/MarketingFooter";
import { prisma } from "@/app/lib/prisma";
import { renderMarkdown } from "@/app/lib/markdown";

type BlogPostPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" }
  });

  if (!post) {
    return {
      title: "Blog post not found",
      description: "The blog post you are looking for does not exist."
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" }
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <MarketingNav />
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Blog
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString()
                : "Draft"}
            </span>
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
          </div>
        </div>

        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mt-8 h-64 w-full rounded-2xl object-cover"
          />
        )}

        <div
          className="blog-content mt-10"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </div>
      <MarketingFooter />
    </div>
  );
}
