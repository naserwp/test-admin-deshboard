import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import EditBlogForm from "../EditBlogForm";

type AdminBlogEditPageProps = {
  params: { id: string };
};

export default async function AdminBlogEditPage({
  params
}: AdminBlogEditPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  const impersonatorUserId = (session.user as any).impersonatorUserId as
    | string
    | null
    | undefined;

  const post = await prisma.blogPost.findUnique({
    where: { id: params.id }
  });

  if (!post) {
    notFound();
  }

  const userName = session.user.userId || session.user.email || "Admin";
  const imageUrl = (session.user as any).imageUrl;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
        impersonatorUserId={impersonatorUserId}
      />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <EditBlogForm
          post={{
            ...post,
            publishedAt: post.publishedAt?.toISOString() || null,
            readMinutesOverride: post.readMinutesOverride,
            tocOverride: post.tocOverride
          }}
        />
      </div>
    </div>
  );
}
