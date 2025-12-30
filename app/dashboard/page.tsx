// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";
// import TopNav from "@/app/components/TopNav";
// import Link from "next/link";
// import Avatar from "@/app/components/Avatar";

// export default async function DashboardPage() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id) {
//     return null;
//   }

//   const assignments = await prisma.assignment.findMany({
//     where: { userId: session.user.id },
//     include: { file: true },
//     orderBy: { createdAt: "desc" }
//   });

//   const userName = session.user.userId || session.user.email || "User";
//   const imageUrl = (session.user as any).imageUrl;
//   const unlockedCount = assignments.filter(
//     (assignment) => assignment.status === "UNLOCKED"
//   ).length;
//   const lockedCount = assignments.length - unlockedCount;

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <TopNav
//         role={session.user.role}
//         userName={userName}
//         imageUrl={imageUrl}
//       />
//       <div className="mx-auto max-w-6xl px-6 py-10">
//         <div className="flex flex-wrap items-center justify-between gap-6">
//           <div className="flex items-center gap-4">
//             <Avatar label={userName} imageUrl={imageUrl} size={56} />
//             <div>
//               <p className="text-sm text-slate-500">Welcome back</p>
//               <h1 className="text-2xl font-semibold text-slate-900">
//                 {userName}
//               </h1>
//               <p className="text-sm text-slate-500">
//                 Your assigned documents and access updates.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 grid gap-4 md:grid-cols-3">
//           {[
//             { label: "Assigned documents", value: assignments.length },
//             { label: "Unlocked", value: unlockedCount },
//             { label: "Locked", value: lockedCount }
//           ].map((stat) => (
//             <div key={stat.label} className="card p-6">
//               <p className="text-sm text-slate-500">{stat.label}</p>
//               <p className="mt-2 text-2xl font-semibold text-slate-900">
//                 {stat.value}
//               </p>
//             </div>
//           ))}
//         </div>

//         <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
//           <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
//             <div>
//               <h2 className="text-lg font-semibold text-slate-900">
//                 Assigned documents
//               </h2>
//               <p className="text-sm text-slate-500">
//                 Review, view, and download your latest files.
//               </p>
//             </div>
//             <span className="badge badge-info">Updated just now</span>
//           </div>
//           <table className="table-base">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Title</th>
//                 <th>File Name</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {assignments.map((assignment, index) => {
//                 const isUnlocked = assignment.status === "UNLOCKED";
//                 return (
//                   <tr key={assignment.id} className="border-t border-slate-100">
//                     <td>{index + 1}</td>
//                     <td className="font-semibold text-slate-900">
//                       {assignment.file.title}
//                     </td>
//                     <td className="text-slate-600">
//                       {assignment.file.originalName}
//                     </td>
//                     <td>
//                       <span
//                         className={`badge ${
//                           isUnlocked ? "badge-success" : "badge-warning"
//                         }`}
//                       >
//                         {assignment.status}
//                       </span>
//                     </td>
//                     <td>
//                       {isUnlocked ? (
//                         <div className="flex flex-wrap gap-2">
//                           <Link
//                             href={`/api/files/${assignment.file.id}/view`}
//                             target="_blank"
//                             className="btn btn-primary px-3 py-1 text-xs"
//                           >
//                             View
//                           </Link>
//                           <Link
//                             href={`/api/files/${assignment.file.id}/download`}
//                             className="btn btn-secondary px-3 py-1 text-xs"
//                           >
//                             Download
//                           </Link>
//                         </div>
//                       ) : (
//                         <span className="text-xs text-slate-400">
//                           Locked by admin
//                         </span>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//               {assignments.length === 0 && (
//                 <tr>
//                   <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={5}>
//                     No assigned documents yet. When an admin assigns files,
//                     you&apos;ll see them here.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";
import Link from "next/link";
import Avatar from "@/app/components/Avatar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const [assignments, leadJobCount, leadJobs] = await Promise.all([
    prisma.assignment.findMany({
      where: { userId: session.user.id },
      include: { file: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.leadJob.count({ where: { userId: session.user.id } }),
    prisma.leadJob.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const userName = session.user.userId || session.user.email || "User";
  const imageUrl = (session.user as any).imageUrl;
  const impersonatorUserId = (session.user as any).impersonatorUserId as
    | string
    | null
    | undefined;

  const unlockedCount = assignments.filter(
    (a) => a.status === "UNLOCKED"
  ).length;
  const lockedCount = assignments.length - unlockedCount;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
        impersonatorUserId={impersonatorUserId}
      />

      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/30" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/30" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-10 space-y-8">
        {/* AI banner */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-soft-xl ring-1 ring-slate-900/10 dark:border-slate-800 dark:ring-white/5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-70 dark:opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-sky-900/60 dark:from-slate-950/90 dark:via-slate-900/70 dark:to-sky-900/70" />
          <div className="relative grid gap-6 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                AI-powered virtual office
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Keep every document protected, searchable, and ready for your team.
              </h2>
              <p className="max-w-2xl text-sm text-slate-200 sm:text-base">
                Smart insights surface the right files, automate access, and keep your audits clean.
                Your gray-blue workspace is built for clarity in any mode.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full bg-white/10 px-3 py-1">Auto-tagged docs</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Secure sharing</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Live status</span>
              </div>
            </div>
            <div className="relative flex items-center justify-end">
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-start gap-3 text-white">
                  <div className="h-10 w-10 rounded-2xl bg-sky-500/80 ring-2 ring-white/30" />
                  <div>
                    <p className="text-sm font-semibold">AI Assistant</p>
                    <p className="text-xs text-slate-100/90">
                      “Summarized 3 policy updates and flagged 2 pending approvals.”
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs text-slate-100">
                  <p className="font-semibold">Workspace Pulse</p>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-semibold">24</p>
                      <p className="text-[11px] uppercase tracking-wide text-slate-200/80">
                        unlocked
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">8</p>
                      <p className="text-[11px] uppercase tracking-wide text-slate-200/80">
                        pending
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">3</p>
                      <p className="text-[11px] uppercase tracking-wide text-slate-200/80">
                        alerts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero */}
        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 p-[2px] shadow-sm">
                <div className="rounded-2xl bg-white p-1 dark:bg-slate-900">
                  <Avatar label={userName} imageUrl={imageUrl} size={56} />
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Welcome back
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  {userName}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Manage your assigned documents, access, and downloads from one
                  place.
                </p>
              </div>
            </div>

            <Link
              href="/account"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
            >
              Manage Account
            </Link>
          </div>

          {/* Quick stats */}
        <div className="grid gap-4 border-t border-slate-200 p-6 sm:p-8 md:grid-cols-4 dark:border-slate-800">
          <StatCard
            label="Assigned documents"
            value={assignments.length}
            gradient="from-indigo-500 to-sky-500"
              hint="Total files assigned to you"
            />
            <StatCard
              label="Unlocked"
              value={unlockedCount}
              gradient="from-emerald-500 to-teal-500"
              hint="Ready to view and download"
            />
            <StatCard
              label="Locked"
              value={lockedCount}
              gradient="from-amber-500 to-orange-500"
              hint="Pending admin unlock"
            />
            <StatCard
              label="Lead jobs"
              value={leadJobCount}
              gradient="from-fuchsia-500 to-rose-500"
              hint="Lead searches in your queue"
            />
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Support & chat
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Reach the support team directly from your workspace.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30">
                Chat ready
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                href="/support/history"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
              >
                Chat history
              </Link>
              <Link
                href="/support/ticket/new"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300"
              >
                New support ticket
              </Link>
              <Link
                href="/support/tickets"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
              >
                My tickets
              </Link>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Use the chat button in the bottom-right to start or resume a conversation. If you need an admin to approve something, ask the assistant to request a human.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Need an approval?
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              Start a chat for quick questions, or open a ticket for longer requests.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Ask in chat</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Get instant answers and request a human when you need an admin to review.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Track with tickets</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Tickets keep your approvals and follow-ups organized for you and the admin team.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Lead jobs</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Track the latest lead searches you have created.
              </p>
            </div>
            <Link
              href="/leads/new"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
            >
              + New lead job
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leadJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {job.keyword}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {job.city ? `${job.city}, ` : ""}
                    {job.state ? `${job.state}, ` : ""}
                    {job.country ?? "US"} · Target {job.leadsTarget} leads
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30">
                    {job.status}
                  </span>
                  <Link
                    href={`/leads/${job.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}

            {leadJobs.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No lead jobs yet. Create one to start collecting prospects.
              </div>
            )}
          </div>
        </section>

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Assigned documents
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Review, open, and download your latest files.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:ring-sky-500/30">
              <span className="h-2 w-2 rounded-full bg-sky-500 dark:bg-sky-300" />
              Updated just now
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-200">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">File name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.map((assignment, index) => {
                  const isUnlocked = assignment.status === "UNLOCKED";
                  return (
                    <tr key={assignment.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/70">
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {assignment.file.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {assignment.file.originalName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
                            isUnlocked
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30"
                              : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30",
                          ].join(" ")}
                        >
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isUnlocked ? (
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/files/${assignment.file.id}`}
                              className="btn btn-primary px-3 py-1 text-xs transition hover:brightness-105 active:scale-[0.98]"
                            >
                              View
                            </Link>

                            <Link
                              href={`/api/files/${assignment.file.id}/download`}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              Download
                            </Link>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-400">
                            Locked by admin
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {assignments.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                      colSpan={5}
                    >
                      No assigned documents yet. When an admin assigns files,
                      you&apos;ll see them here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tip: Keep your profile updated so admins can assign documents
              faster.
            </p>
            <Link
              href="/account"
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Update profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  gradient,
  hint,
}: {
  label: string;
  value: number;
  gradient: string;
  hint: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl dark:from-slate-700 dark:to-slate-900 dark:opacity-40`}
      />
      <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}
