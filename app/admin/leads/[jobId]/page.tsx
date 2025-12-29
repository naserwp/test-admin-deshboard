import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";
import Link from "next/link";
import LeadJobAdminForm from "../_components/LeadJobAdminForm";
import LeadResultForm from "../_components/LeadResultForm";

export default async function AdminLeadJobPage({
  params,
}: {
  params: { jobId: string } | Promise<{ jobId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const impersonatorUserId = (session.user as any).impersonatorUserId as
    | string
    | null
    | undefined;

  const { jobId } = await Promise.resolve(params);
  if (!jobId) {
    return (
      <div>
        <TopNav
          role={session.user.role}
          userName={session.user.userId ?? "Admin"}
          impersonatorUserId={impersonatorUserId}
        />
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-600">
          Lead job not found.
        </div>
      </div>
    );
  }

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

  const job = await prisma.leadJob.findUnique({
    where: { id: jobId },
    include: {
      user: { select: { userId: true, email: true } },
      results: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!job) {
    return (
      <div>
        <TopNav
          role={session.user.role}
          userName={session.user.userId ?? "Admin"}
          impersonatorUserId={impersonatorUserId}
        />
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-slate-600">
          Lead job not found.
        </div>
      </div>
    );
  }

  const progressValue = job.status === "COMPLETED" ? 100 : job.progress;
  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  return (
    <div>
      <TopNav
        role={session.user.role}
        userName={userName}
        impersonatorUserId={impersonatorUserId}
      />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Lead job details</h1>
            <p className="text-sm text-slate-600">
              {job.keyword} · {job.user.userId} {job.user.email ? `(${job.user.email})` : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/leads"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            >
              ← All jobs
            </Link>
            <a
              href={`/api/admin/leads/jobs/${job.id}/export?format=csv`}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Export CSV
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{job.status}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                style={{ width: `${Math.min(progressValue, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">{progressValue}% complete</p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Target</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {job.leadsTarget} leads
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {job.city ? `${job.city}, ` : ""}
              {job.state ? `${job.state}, ` : ""}
              {job.country ?? "US"}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Created</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {new Date(job.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Updated {new Date(job.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Edit job</h2>
            <p className="text-sm text-slate-500">
              Update keyword, context, status, target, or progress.
            </p>
            <div className="mt-4">
              <LeadJobAdminForm
                jobId={job.id}
                keyword={job.keyword}
                context={job.context}
                status={job.status}
                leadsTarget={job.leadsTarget}
                progress={job.progress}
              />
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Add lead result</h2>
            <p className="text-sm text-slate-500">
              Manually add a verified lead for this job.
            </p>
            <div className="mt-4">
              <LeadResultForm jobId={job.id} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Results</h2>
          <p className="text-sm text-slate-500">
            {job.results.length} lead result{job.results.length === 1 ? "" : "s"} collected.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Business</th>
                  <th className="px-4 py-3 text-left">Industry</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Confidence</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {job.results.map((result) => (
                  <tr key={result.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {result.businessName}
                      {result.website ? (
                        <a
                          href={result.website}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-xs font-medium text-indigo-600"
                        >
                          Website
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {result.industry ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{result.email ?? "-"}</div>
                      <div>{result.phone ?? "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {[result.city, result.state, result.country].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {result.source ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {result.confidence ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {result.notes ?? "-"}
                    </td>
                  </tr>
                ))}

                {!job.results.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No results yet.
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
