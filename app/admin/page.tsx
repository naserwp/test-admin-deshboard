import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import Avatar from "@/app/components/Avatar";

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

  const userName = session.user.userId || session.user.email || "Admin";
  const imageUrl = (session.user as any).imageUrl;

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
              <p className="text-sm text-slate-500">Admin workspace</p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Admin overview
              </h1>
              <p className="text-sm text-slate-500">
                Monitor users, document activity, and assignments.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <a href="/admin/users" className="btn btn-secondary">
              Manage users
            </a>
            <a href="/admin/files" className="btn btn-primary">
              Upload documents
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: "Active users", value: userCount },
            { label: "Documents stored", value: fileCount },
            { label: "Assignments", value: assignmentCount }
          ].map((stat) => (
            <div key={stat.label} className="card p-6">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Admin priorities
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Keep documents fresh, align assignments, and maintain compliance.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Review locked files that need approval.</li>
              <li>• Assign onboarding packets to new hires.</li>
              <li>• Export audit logs before quarterly review.</li>
            </ul>
          </div>
          <div className="card-muted p-6">
            <p className="text-sm font-semibold text-slate-700">
              Recent activity
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>New user requests</span>
                <span className="badge badge-warning">2 pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Files waiting approval</span>
                <span className="badge badge-info">5 items</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage usage</span>
                <span className="font-semibold text-slate-900">72%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
