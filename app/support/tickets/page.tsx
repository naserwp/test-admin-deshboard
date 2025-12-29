import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";

export default async function UserTicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-4">
          <h1 className="text-2xl font-semibold">Your support tickets</h1>
          <p className="text-sm text-slate-600">Sign in to view your tickets.</p>
          <Link href="/auth/login" className="btn btn-primary w-fit">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      visitorEmail: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, sender: true, createdAt: true },
      },
    },
  });

  const userName = session.user.userId ?? (session.user as any).email ?? "User";

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} imageUrl={(session.user as any).imageUrl} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Your tickets</h1>
            <p className="text-sm text-slate-600">Track your support requests.</p>
          </div>
          <Link
            href="/support/ticket/new"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900"
          >
            New ticket
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
              {tickets.map((t) => (
                <tr key={t.id} className="border-t hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <Link href={`/support/tickets/${t.id}`} className="font-semibold text-indigo-700 hover:text-indigo-800">
                      #{t.id.slice(0, 8)}
                    </Link>
                    <div className="text-xs text-slate-500">{t.subject}</div>
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
              {!tickets.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    No tickets yet.
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
