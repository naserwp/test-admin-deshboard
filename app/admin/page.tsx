import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const [userCount, fileCount, assignmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.file.count(),
    prisma.assignment.count()
  ]);

  return (
    <div>
      <TopNav role={session.user.role} />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold">Admin Overview</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Users", value: userCount },
            { label: "Files", value: fileCount },
            { label: "Assignments", value: assignmentCount }
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
