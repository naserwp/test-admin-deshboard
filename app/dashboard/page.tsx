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

  const assignments = await prisma.assignment.findMany({
    where: { userId: session.user.id },
    include: { file: true },
    orderBy: { createdAt: "desc" },
  });

  const userName = session.user.userId || session.user.email || "User";
  const imageUrl = (session.user as any).imageUrl;

  const unlockedCount = assignments.filter(
    (a) => a.status === "UNLOCKED"
  ).length;
  const lockedCount = assignments.length - unlockedCount;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
      />

      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md shadow-sm">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 p-[2px] shadow-sm">
                <div className="rounded-2xl bg-white p-1">
                  <Avatar label={userName} imageUrl={imageUrl} size={56} />
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Welcome back</p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">
                  {userName}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your assigned documents, access, and downloads from one
                  place.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Choose ONE based on your project routing */}
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                Manage Account
              </Link>

              <Link
                href="/auth/logout"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Sign out
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid gap-4 border-t border-slate-200 p-6 sm:p-8 md:grid-cols-3">
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
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Assigned documents
              </h2>
              <p className="text-sm text-slate-500">
                Review, open, and download your latest files.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Updated just now
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">File name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {assignments.map((assignment, index) => {
                  const isUnlocked = assignment.status === "UNLOCKED";
                  return (
                    <tr key={assignment.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {assignment.file.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {assignment.file.originalName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
                            isUnlocked
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-amber-50 text-amber-700 ring-amber-200",
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
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                              Download
                            </Link>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
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
                      className="px-6 py-10 text-center text-sm text-slate-500"
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
          <div className="flex flex-col gap-2 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Tip: Keep your profile updated so admins can assign documents
              faster.
            </p>
            <Link
              href="/account"
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-800"
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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`}
      />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
