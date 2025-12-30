import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import Avatar from "@/app/components/Avatar";
import { ConversationStatus, TicketStatus } from "@prisma/client";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const [
    userCount,
    fileCount,
    assignmentCount,
    leadJobCount,
    leadResultCount,
    pendingConversationCount,
    openSupportTicketCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.file.count(),
    prisma.assignment.count(),
    prisma.leadJob.count(),
    prisma.leadResult.count(),
    prisma.conversation.count({
      where: { status: ConversationStatus.REQUESTED_HUMAN },
    }),
    prisma.supportTicket.count({
      where: { status: { in: [TicketStatus.OPEN, TicketStatus.PENDING] } },
    }),
  ]);

  const userName = session.user.userId || session.user.email || "Admin";
  const imageUrl = (session.user as any).imageUrl;
  const impersonatorUserId = (session.user as any).impersonatorUserId as
    | string
    | null
    | undefined;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav
        role={session.user.role}
        userName={userName}
        imageUrl={imageUrl}
        impersonatorUserId={impersonatorUserId}
      />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar label={userName} imageUrl={imageUrl} size={56} />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-300">Admin workspace</p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Admin overview
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">
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

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Active users", value: userCount },
            { label: "Documents stored", value: fileCount },
            { label: "Assignments", value: assignmentCount },
            { label: "Lead jobs", value: leadJobCount }
          ].map((stat) => (
            <div key={stat.label} className="card p-6">
              <p className="text-sm text-slate-500 dark:text-slate-300">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Admin priorities
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Keep documents fresh, align assignments, and maintain compliance.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>• Review locked files that need approval.</li>
              <li>• Assign onboarding packets to new hires.</li>
              <li>• Export audit logs before quarterly review.</li>
              <li>• Monitor lead jobs and results quality.</li>
            </ul>
          </div>
          <div className="card-muted p-6">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Recent activity
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>New user requests</span>
                <span className="badge badge-warning">2 pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Files waiting approval</span>
                <span className="badge badge-info">5 items</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Lead results collected</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {leadResultCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Storage usage</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">72%</span>
              </div>
            </div>
            <div className="mt-6">
              <a href="/admin/leads" className="btn btn-secondary w-full">
                Review lead jobs
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Support center
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Respond to chats requesting a human and keep tickets moving.
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/40">
                Live queue ready
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                  Waiting for admin
                </p>
                <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  {pendingConversationCount}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Conversations where a user requested human support.
                </p>
                <a
                  href="/admin/support/conversations?status=REQUESTED_HUMAN"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                >
                  Review chat queue ƒ+'
                </a>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                  Tickets open/pending
                </p>
                <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  {openSupportTicketCount}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  Support tickets that still need admin action.
                </p>
                <a
                  href="/admin/support/tickets?status=OPEN"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                >
                  Open ticket board ƒ+'
                </a>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <a
                href="/admin/support/conversations"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400"
              >
                All conversations
              </a>
              <a
                href="/admin/support/tickets"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
              >
                All tickets
              </a>
              <a
                href="/support/tickets"
                className="inline-flex items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-2 text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-400 dark:hover:text-slate-100"
              >
                User-facing portal
              </a>
            </div>
          </div>

          <div className="card-muted p-6">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Support handoff tips
            </p>
            <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>ƒ?› Reply to REQUESTED_HUMAN chats within a few minutes.</li>
              <li>ƒ?› Convert long chats into tickets so history stays organized.</li>
              <li>ƒ?› Tag outcomes in tickets before closing to aid reporting.</li>
              <li>ƒ?› Share the user portal link for self-service updates.</li>
            </ul>
            <div className="mt-4">
              <a
                href="/support/history"
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                View a user&apos;s chat history ƒ+'
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
