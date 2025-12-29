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
          <div className="rounded-lg border bg-white p-6 text-sm">
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
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin • Lead jobs</h1>
            <p className="text-sm text-slate-600">
              Review all lead job requests, progress, and results.
            </p>
          </div>
          <Link
            href="/leads/settings"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
          >
            Provider settings
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-semibold">All lead jobs</div>
            <span className="text-xs text-slate-500">{jobs.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
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
                  <tr key={job.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {job.keyword}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{job.user.userId}</div>
                      <div className="text-xs text-slate-400">
                        {job.user.email ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {[job.city, job.state, job.country].filter(Boolean).join(", ") ||
                        "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border px-2 py-0.5 text-xs">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.status === "COMPLETED" ? 100 : job.progress}%
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${job.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}

                {!jobs.length ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
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
