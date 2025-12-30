import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";
import ConversationThread from "@/app/admin/support/conversations/ConversationThread";

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return redirect("/dashboard");
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      email: true,
      visitorEmail: true,
      visitorName: true,
      visitorPhone: true,
      userId: true,
      createdAt: true,
      lastMessageAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        take: 200,
        select: { id: true, role: true, sender: true, content: true, createdAt: true },
      },
    },
  });

  if (!conversation) return redirect("/admin/support/conversations");

  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} />
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <Link
                href="/admin/support/conversations"
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                ← Back to conversations
              </Link>
            </div>
            <h1 className="text-2xl font-semibold">Conversation #{conversation.id.slice(0, 8)}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {conversation.visitorName || "User/Guest"} · {conversation.email || conversation.visitorEmail || "No email"} ·{" "}
              {conversation.visitorPhone || "No phone"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
              {conversation.status}
            </span>
            <form action={`/api/admin/conversations/${conversation.id}/takeover`} method="post">
              <button
                className="rounded-full bg-slate-900 px-3 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-60 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
                type="submit"
              >
                Take Over Live
              </button>
            </form>
            <form action={`/api/admin/conversations/${conversation.id}/close`} method="post">
              <button
                className="rounded-full border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
                type="submit"
              >
                Close
              </button>
            </form>
          </div>
        </div>

        <ConversationThread
          conversationId={conversation.id}
          initialStatus={conversation.status}
          initialMessages={conversation.messages as any}
        />
      </div>
    </div>
  );
}
