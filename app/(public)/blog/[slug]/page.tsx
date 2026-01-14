import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { renderMarkdown } from "@/app/lib/markdown";
import { samplePosts } from "@/app/lib/samplePosts";
import TOCClient from "@/app/(public)/blog/TOCClient";
import { PUBLIC_CONTAINER } from "@/app/components/layout/publicNav";

type BlogPostPageProps = {
  params: { slug: string };
};

const wordsPerMinute = 180;
const readingTime = (content: string) =>
  Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / wordsPerMinute));

const buildToc = (content: string, override?: string | null) => {
  if (override?.trim()) {
    return override
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text) => {
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");
        return { level: 2, text, slug };
      });
  }
  const lines = content.split(/\r?\n/);
  return (
    lines
      .map((line) => {
        const match = line.match(/^(#{1,3})\s+(.*)$/);
        if (!match) return null;
        const level = match[1].length;
        const text = match[2].trim();
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");
        return { level, text, slug };
      })
      .filter(Boolean) as { level: number; text: string; slug: string }[]
  );
};

const getRelated = (currentSlug: string) => {
  const filtered = samplePosts.filter((p) => p.slug !== currentSlug);
  return filtered.slice(0, 2);
};

async function findPost(slug: string) {
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" }
  });
  if (post) {
    return {
      ...post,
      readMinutes: readingTime(post.content),
      videoUrl: undefined as string | undefined
    };
  }

  const sample = samplePosts.find((p) => p.slug === slug);
  return sample
    ? {
        ...sample,
        readMinutes: readingTime(sample.content),
        tocOverride: null,
        customPublished: null
      }
    : null;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post =
    (await prisma.blogPost.findFirst({
      where: { slug: params.slug, status: "PUBLISHED" }
    })) || samplePosts.find((p) => p.slug === params.slug);

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
      images: "coverImageUrl" in post && post.coverImageUrl ? [post.coverImageUrl] : undefined
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await findPost(params.slug);

  if (!post) {
    notFound();
  }

  const toc = buildToc(post.content, post.tocOverride);
  const html = renderMarkdown(post.content);
  const related = getRelated(post.slug);

  return (
    <div className={`${PUBLIC_CONTAINER} py-12`}>
      <div className="lg:flex lg:gap-10">
        <article className="flex-1 w-full max-w-3xl">
          <div className="space-y-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <span aria-hidden="true">←</span>
              Back to blog
            </Link>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Blog
            </p>
            <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-300">
              <span>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString()
                  : post.customPublished || "Published"}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-400" />
              <span>{post.readMinutes ?? readingTime(post.content)} min read</span>

              <div className="flex flex-wrap gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                {post.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-50 px-2 py-1 dark:bg-indigo-900/40 dark:text-indigo-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {post.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full bg-emerald-50 px-2 py-1 dark:bg-emerald-900/40 dark:text-emerald-100"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {"coverImageUrl" in post && post.coverImageUrl && (
            <div className="relative mt-8 overflow-hidden rounded-3xl border border-slate-200/80 shadow-soft-xl dark:border-slate-800">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-80 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
            </div>
          )}

          <div
            className="blog-content mt-10 space-y-6 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {"videoUrl" in post && post.videoUrl && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-black shadow-lg dark:border-slate-800">
              <div className="aspect-video">
                <iframe
                  src={post.videoUrl}
                  title="Blog video"
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </article>

        <aside className="mt-10 flex w-full flex-col gap-6 lg:mt-0 lg:w-80">
          <TOCClient items={toc} />

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 dark:text-sky-300">
              Related reads
            </p>
            <div className="mt-4 space-y-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="h-14 w-16 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {readingTime(item.content)} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
