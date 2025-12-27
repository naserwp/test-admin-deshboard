import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function FileViewerPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  // Optional: security check (only assigned user can view)
  const assignment = await prisma.assignment.findFirst({
    where: { userId: session.user.id, fileId: params.id, status: "UNLOCKED" },
    include: { file: true },
  });
  if (!assignment) redirect("/dashboard");

  const file = assignment.file;

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Viewer header bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Document viewer</p>
          <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {file.title}
          </h1>
          <p className="truncate text-xs text-slate-500 dark:text-slate-300">{file.originalName}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            ← Back
          </Link>

          <a
            href={`/api/files/${file.id}/download`}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Download
          </a>

          <a
            href={`/api/files/${file.id}/view`}
            target="_blank"
            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Open in new tab
          </a>
        </div>
      </div>

      {/* Viewer frame */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* subtle moving glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-300/25 blur-3xl animate-[floaty_10s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl animate-[floaty_14s_ease-in-out_infinite]" />

        <iframe
          title={file.title}
          src={`/api/files/${file.id}/view`}
          className="h-[78vh] w-full"
        />
      </div>

      {/* local keyframes */}
      <style>{`
        @keyframes floaty {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,-14px,0) scale(1.03); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
      `}</style>
    </div>
  );
}
