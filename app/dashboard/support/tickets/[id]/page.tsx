import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";

export default async function DashboardTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return redirect("/auth/login");
  }
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      userId: true,
      visitorEmail: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, sender: true, content: true, createdAt: true, metadata: true },
      },
    },
  });
  if (!ticket || ticket.userId !== session.user.id) {
    return redirect("/dashboard/support/tickets");
  }

  const userName = session.user.userId ?? (session.user as any).email ?? "User";

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav role={session.user.role} userName={userName} imageUrl={(session.user as any).imageUrl} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/support/tickets"
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Back to tickets
            </Link>
            <h1 className="text-2xl font-semibold mt-1">Ticket #{ticket.id}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">{ticket.subject}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-200 px-3 py-1 font-semibold dark:border-slate-700 dark:text-slate-200">
              {ticket.status}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 font-semibold dark:border-slate-700 dark:text-slate-200">
              {ticket.priority}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            {ticket.messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {msg.sender === "ADMIN" ? "Admin" : "You"}
                  </span>
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {msg.content}
                </div>
                {Array.isArray((msg as any).metadata?.attachments) &&
                (msg as any).metadata.attachments.length ? (
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                    {(msg as any).metadata.attachments.map((file: any, idx: number) => (
                      <a
                        key={`${msg.id}-att-${idx}`}
                        href={file.url}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-indigo-700 hover:text-indigo-800 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {!ticket.messages.length ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">No messages yet.</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form action={`/api/support/tickets/${ticket.id}/reply`} method="post" className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Reply</label>
              <textarea
                name="message"
                required
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
                placeholder="Type your reply..."
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900"
              >
                Send reply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
