import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminSupportConversationsPage({
  searchParams,
}: {
  searchParams?: { status?: string; cursor?: string; search?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return redirect("/dashboard");
  const sp = await Promise.resolve(searchParams);
  const status = sp?.status;
  const cursor = sp?.cursor;
  const search = sp?.search?.trim();

  const conversations = await prisma.conversation.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { visitorEmail: { contains: search, mode: "insensitive" } },
              { visitorName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { lastMessageAt: "desc" },
    take: 21,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      email: true,
      visitorName: true,
      visitorEmail: true,
      userId: true,
      status: true,
      createdAt: true,
      lastMessageAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, role: true, createdAt: true },
      },
    },
  });

  const hasNext = conversations.length > 20;
  const items = conversations.slice(0, 20);

  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Support conversations</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Admin-only view of chat conversations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {["AI_ONLY", "REQUESTED_HUMAN", "HUMAN_ACTIVE", "CLOSED"].map((s) => (
            <Link
              key={s}
              href={`/admin/support/conversations?status=${s}`}
              className={[
                "rounded-full border px-3 py-1 transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                status === s
                  ? "border-slate-900 text-slate-900 dark:border-slate-300 dark:text-slate-100"
                  : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500",
              ].join(" ")}
            >
              {s}
            </Link>
          ))}
          <Link
            href={`/admin/support/conversations`}
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
          >
            All
          </Link>
        </div>

        <form className="flex flex-wrap items-center gap-3 text-sm">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search email or name"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300"
          >
            Search
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">Conversation</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Last message</th>
                <th className="px-4 py-3 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-slate-200 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/support/conversations/${c.id}`}
                      className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                    >
                      #{c.id.slice(0, 8)}
                    </Link>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {c.email || c.visitorEmail || c.userId || "Visitor"}
                    </div>
                    {c.visitorName ? (
                      <div className="text-[11px] text-slate-400 dark:text-slate-400">
                        {c.visitorName}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {c.messages[0]?.content?.slice(0, 80) ?? "No messages"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(c.lastMessageAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No conversations found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {hasNext ? (
          <div className="flex justify-end">
            <Link
              href={`/admin/support/conversations?${new URLSearchParams({
                ...(status ? { status } : {}),
                cursor: conversations[conversations.length - 1].id,
                ...(search ? { search } : {}),
              }).toString()}`}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Load more →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
