import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";
import Link from "next/link";

export default async function AdminSupportTicketsPage({
  searchParams,
}: {
  searchParams?: { status?: string; priority?: string; search?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const status = searchParams?.status;
  const priority = searchParams?.priority;
  const search = searchParams?.search?.trim();

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(priority ? { priority: priority as any } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: "insensitive" } },
              { subject: { contains: search, mode: "insensitive" } },
              { visitorEmail: { contains: search, mode: "insensitive" } },
              { userId: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      visitorEmail: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, sender: true, createdAt: true },
      },
    },
  });

  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Support tickets</h1>
            <p className="text-sm text-slate-600">
              Admin-only view of support tickets.
            </p>
          </div>
          <Link
            href="/admin/support/tickets/new"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900"
          >
            + New ticket
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {["OPEN", "PENDING", "RESOLVED", "CLOSED"].map((s) => (
            <Link
              key={s}
              href={`/admin/support/tickets?status=${s}`}
              className={[
                "rounded-full border px-3 py-1",
                status === s ? "border-slate-900 text-slate-900" : "border-slate-200 text-slate-600",
              ].join(" ")}
            >
              {s}
            </Link>
          ))}
          <Link href={`/admin/support/tickets`} className="rounded-full border border-slate-200 px-3 py-1 text-slate-600">
            All
          </Link>
        </div>

        <form className="flex flex-wrap items-center gap-3 text-sm">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search ticket id, subject, email, user"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900"
          >
            Search
          </button>
        </form>

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
                    <Link href={`/admin/support/tickets/${t.id}`} className="font-semibold text-indigo-700 hover:text-indigo-800">
                      #{t.id.slice(0, 8)}
                    </Link>
                    <div className="text-xs text-slate-500">{t.subject}</div>
                    <div className="text-xs text-slate-500">{t.visitorEmail ?? t.userId ?? "Visitor"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs">
                      {t.priority}
                    </span>
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
                    No tickets found.
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
