import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";

const STATUS_LABEL: Record<string, { label: string; badge: string }> = {
  AI_ONLY: {
    label: "AI Assistant",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  REQUESTED_HUMAN: {
    label: "Waiting for admin",
    badge: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-100",
  },
  HUMAN_ACTIVE: {
    label: "Live chat",
    badge: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-900/50 dark:text-sky-100",
  },
  CLOSED: {
    label: "Closed",
    badge: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-200",
  },
};

function prettyRole(role?: string | null) {
  const normalized = (role || "").toUpperCase();
  if (normalized === "ASSISTANT") return "Assistant";
  if (normalized === "ADMIN") return "Admin";
  if (normalized === "SYSTEM") return "Assistant";
  return "User";
}

export default async function SupportHistoryPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-4">
          <h1 className="text-2xl font-semibold">Support history</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sign in to view your previous chat conversations.
          </p>
          <Link href="/auth/login" className="btn btn-primary w-fit">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId },
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
  });

  const userName = session.user.userId ?? session.user.email ?? "User";
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

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Support history</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Review your recent conversations with our team.
          </p>
        </div>

        <div className="grid gap-4">
          {conversations.map((conversation) => {
            const badge = STATUS_LABEL[conversation.status] ?? {
              label: conversation.status,
              badge: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-200",
            };
            const lastMessage = conversation.messages[0];
            const lastActivity = conversation.lastMessageAt ?? conversation.createdAt;
            return (
              <div
                key={conversation.id}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Conversation #{conversation.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Started {new Date(conversation.createdAt).toLocaleDateString()} · Last activity{" "}
                      {new Date(lastActivity).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${badge.badge}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                    {badge.label}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <p className="max-h-14 overflow-hidden">
                    {lastMessage?.content ?? "No messages yet."}
                  </p>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                    <span>{lastMessage ? prettyRole(lastMessage.role) : "Awaiting first message"}</span>
                    {lastMessage?.createdAt ? (
                      <span>
                        {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {!conversations.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              No conversations yet. Open the chat from the bottom-right button to start one.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
