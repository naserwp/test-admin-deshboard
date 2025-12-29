import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";

export default async function AdminSupportWaitingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return redirect("/dashboard");

  const [conversations, pendingTickets] = await Promise.all([
    prisma.conversation.findMany({
      where: { status: "REQUESTED_HUMAN" },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        visitorEmail: true,
        visitorName: true,
        userId: true,
        createdAt: true,
        lastMessageAt: true,
        status: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { id: true, content: true, role: true, createdAt: true },
        },
      },
    }),
    prisma.supportTicket.findMany({
      where: { status: { in: ["OPEN", "PENDING"] } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        visitorEmail: true,
        userId: true,
        updatedAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { id: true, content: true, sender: true, createdAt: true },
        },
      },
    }),
  ]);

  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Waiting for admin</h1>
            <p className="text-sm text-slate-600">
              Conversations requesting a human plus tickets waiting on admin.
            </p>
          </div>
          <Link
            href="/admin/support/conversations"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
          >
            View all conversations
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            <span>REQUESTED_HUMAN queue</span>
            <span>{conversations.length} waiting</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Conversation</th>
                <th className="px-4 py-3 text-left">Last message</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => (
                <tr key={c.id} className="border-t hover:bg-amber-50/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">#{c.id.slice(0, 8)}</div>
                    <div className="text-xs text-slate-500">
                      {c.email || c.visitorEmail || c.userId || "Visitor"}
                    </div>
                    {c.visitorName ? (
                      <div className="text-[11px] text-slate-400">{c.visitorName}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.messages[0]?.content?.slice(0, 80) ?? "No messages"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(c.lastMessageAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/support/conversations/${c.id}`}
                      className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {!conversations.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                    No conversations are waiting for admin right now.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            <span>Tickets waiting for admin</span>
            <span>{pendingTickets.length} open/pending</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Ticket</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Last message</th>
                <th className="px-4 py-3 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {pendingTickets.map((t) => (
                <tr key={t.id} className="border-t hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/support/tickets/${t.id}`}
                      className="font-semibold text-indigo-700 hover:text-indigo-800"
                    >
                      #{t.id}
                    </Link>
                    <div className="text-xs text-slate-500">{t.subject}</div>
                    <div className="text-xs text-slate-500">{t.visitorEmail || t.userId || "Visitor"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs">{t.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs">{t.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.messages[0]?.content?.slice(0, 80) ?? "No messages"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(t.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!pendingTickets.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    No open or pending tickets right now.
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
