import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";
import Link from "next/link";

export default async function AdminLeadsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const impersonatorUserId = (session.user as any).impersonatorUserId as
    | string
    | null
    | undefined;

  if (session.user.role !== "ADMIN") {
    return (
      <div>
        <TopNav
          role={session.user.role}
          userName={session.user.userId ?? "User"}
          impersonatorUserId={impersonatorUserId}
        />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            You do not have permission to view this page.
          </div>
        </div>
      </div>
    );
  }

  const jobs = await prisma.leadJob.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { userId: true, email: true } } },
  });

  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  return (
    <div>
      <TopNav
        role={session.user.role}
        userName={userName}
        impersonatorUserId={impersonatorUserId}
      />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin • Lead jobs</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Review all lead job requests, progress, and results.
            </p>
          </div>
          <Link
            href="/leads/settings"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
          >
            Provider settings
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="font-semibold text-slate-900 dark:text-slate-100">All lead jobs</div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{jobs.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="text-left px-4 py-3">Keyword</th>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Progress</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {job.keyword}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div>{job.user.userId}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-400">
                        {job.user.email ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {[job.city, job.state, job.country].filter(Boolean).join(", ") ||
                        "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {job.status === "COMPLETED" ? 100 : job.progress}%
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${job.id}`}
                        className="text-indigo-600 hover:underline dark:text-indigo-300 dark:hover:text-indigo-200"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}

                {!jobs.length ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No lead jobs yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
