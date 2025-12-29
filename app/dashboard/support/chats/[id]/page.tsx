import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";

export default async function DashboardChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth/login");
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      createdAt: true,
      lastMessageAt: true,
      userId: true,
      messages: {
        orderBy: { createdAt: "asc" },
        take: 200,
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });

  if (!conversation || conversation.userId !== session.user.id) {
    return redirect("/dashboard/support/chats");
  }

  const userName =
    session.user.userId ?? (session.user as any).name ?? (session.user as any).email ?? "User";
  const imageUrl = (session.user as any).imageUrl;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav role={session.user.role} userName={userName} imageUrl={imageUrl} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/support/chats"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Back to chats
            </Link>
            <h1 className="text-2xl font-semibold mt-1">
              Conversation #{conversation.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-slate-600">
              Status: {conversation.status} · Updated{" "}
              {new Date(conversation.lastMessageAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            {conversation.messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {msg.role === "ADMIN" ? "Admin" : msg.role === "ASSISTANT" ? "Assistant" : "You"}
                  </span>
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                  {msg.content}
                </div>
              </div>
            ))}
            {!conversation.messages.length ? (
              <div className="text-sm text-slate-500">No messages yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
