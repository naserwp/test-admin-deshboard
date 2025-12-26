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
    orderBy: { createdAt: "desc" }
  });

  const userName = session.user.userId || session.user.email || "User";
  const imageUrl = (session.user as any).imageUrl;
  const unlockedCount = assignments.filter(
    (assignment) => assignment.status === "UNLOCKED"
  ).length;
  const lockedCount = assignments.length - unlockedCount;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
      />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar label={userName} imageUrl={imageUrl} size={56} />
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-2xl font-semibold text-slate-900">
                {userName}
              </h1>
              <p className="text-sm text-slate-500">
                Your assigned documents and access updates.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: "Assigned documents", value: assignments.length },
            { label: "Unlocked", value: unlockedCount },
            { label: "Locked", value: lockedCount }
          ].map((stat) => (
            <div key={stat.label} className="card p-6">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Assigned documents
              </h2>
              <p className="text-sm text-slate-500">
                Review, view, and download your latest files.
              </p>
            </div>
            <span className="badge badge-info">Updated just now</span>
          </div>
          <table className="table-base">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>File Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment, index) => {
                const isUnlocked = assignment.status === "UNLOCKED";
                return (
                  <tr key={assignment.id} className="border-t border-slate-100">
                    <td>{index + 1}</td>
                    <td className="font-semibold text-slate-900">
                      {assignment.file.title}
                    </td>
                    <td className="text-slate-600">
                      {assignment.file.originalName}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isUnlocked ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td>
                      {isUnlocked ? (
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/api/files/${assignment.file.id}/view`}
                            target="_blank"
                            className="btn btn-primary px-3 py-1 text-xs"
                          >
                            View
                          </Link>
                          <Link
                            href={`/api/files/${assignment.file.id}/download`}
                            className="btn btn-secondary px-3 py-1 text-xs"
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
                  <td className="px-6 py-10 text-center text-sm text-slate-500" colSpan={5}>
                    No assigned documents yet. When an admin assigns files,
                    you&apos;ll see them here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
