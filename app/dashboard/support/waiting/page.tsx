import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";

export default async function DashboardSupportWaitingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth/login");

  const userId = session.user.id;

  const [conversations, tickets] = await Promise.all([
    prisma.conversation.findMany({
      where: { userId, status: "REQUESTED_HUMAN" },
      orderBy: { lastMessageAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        createdAt: true,
        lastMessageAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, role: true, createdAt: true },
        },
      },
    }),
    prisma.supportTicket.findMany({
      where: { userId, status: { in: ["OPEN", "PENDING"] } },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        updatedAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true },
        },
      },
    }),
  ]);

  const userName =
    session.user.userId ?? (session.user as any).name ?? (session.user as any).email ?? "User";
  const imageUrl = (session.user as any).imageUrl;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav role={session.user.role} userName={userName} imageUrl={imageUrl} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Waiting for admin</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Requests that need a live admin or approval.
            </p>
          </div>
          <div className="flex gap-2 text-sm font-semibold">
            <Link
              href="/dashboard/support/chats"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
            >
              Chats
            </Link>
            <Link
              href="/dashboard/support/tickets"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
            >
              Tickets
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm dark:border-amber-500/40 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
            <span>Chats waiting for admin</span>
            <span>{conversations.length} waiting</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">Conversation</th>
                <th className="px-4 py-3 text-left">Last message</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => (
                <tr key={c.id} className="border-t hover:bg-amber-50/60 dark:border-amber-500/30 dark:hover:bg-amber-500/10">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">#{c.id.slice(0, 8)}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{c.status}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {c.messages[0]?.content?.slice(0, 80) ?? "No messages"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(c.lastMessageAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/support/chats/${c.id}`}
                      className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!conversations.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No chats are waiting for admin right now.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <span>Tickets waiting on admin</span>
            <span>{tickets.length} open/pending</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">Ticket</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Last message</th>
                <th className="px-4 py-3 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/70">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/support/tickets/${t.id}`}
                      className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                    >
                      #{t.id}
                    </Link>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.subject}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs dark:border-slate-700 dark:text-slate-200">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs dark:border-slate-700 dark:text-slate-200">
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {t.messages[0]?.content?.slice(0, 80) ?? "No messages"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(t.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!tickets.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No tickets are waiting right now.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
