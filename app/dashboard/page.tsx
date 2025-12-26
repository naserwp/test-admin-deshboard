import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";
import Link from "next/link";

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

  return (
    <div>
      <TopNav role={session.user.role} />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold">Your PDFs</h1>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment, index) => {
                const isUnlocked = assignment.status === "UNLOCKED";
                return (
                  <tr key={assignment.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{assignment.file.title}</td>
                    <td className="px-4 py-3 text-slate-600">{assignment.file.originalName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isUnlocked
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isUnlocked ? (
                        <div className="flex gap-2">
                          <Link
                            href={`/api/files/${assignment.file.id}/view`}
                            target="_blank"
                            className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white"
                          >
                            View
                          </Link>
                          <Link
                            href={`/api/files/${assignment.file.id}/download`}
                            className="rounded-md bg-slate-200 px-3 py-1 text-xs text-slate-700"
                          >
                            Download
                          </Link>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {assignments.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    No assigned PDFs yet.
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
