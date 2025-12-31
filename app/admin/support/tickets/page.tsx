import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TopNav from "@/app/components/TopNav";
import Avatar from "@/app/components/Avatar";
import Link from "next/link";

export default async function AdminSupportTicketsPage({
  searchParams,
}: {
  searchParams?: {
    status?: string;
    priority?: string;
    search?: string;
    leadStatus?: string;
    leadSearch?: string;
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const status = searchParams?.status;
  const priority = searchParams?.priority;
  const search = searchParams?.search?.trim();
  const leadStatus = searchParams?.leadStatus;
  const leadSearch = searchParams?.leadSearch?.trim();

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
      user: { select: { userId: true, email: true, imageUrl: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, sender: true, createdAt: true },
      },
    },
  });

  const salesLeads = await prisma.talkToSalesLead.findMany({
    where: {
      ...(leadStatus ? { status: leadStatus as any } : {}),
      ...(leadSearch
        ? {
            OR: [
              { name: { contains: leadSearch, mode: "insensitive" } },
              { email: { contains: leadSearch, mode: "insensitive" } },
              { company: { contains: leadSearch, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  const imageUrl = (session.user as any).imageUrl;

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} imageUrl={imageUrl} />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Support tickets</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Admin-only view of support tickets.
          </p>
          </div>
          <Link
            href="/admin/support/tickets/new"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300"
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
            href={`/admin/support/tickets`}
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
          >
            All
          </Link>
        </div>

        <form className="flex flex-wrap items-center gap-3 text-sm">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search ticket id, subject, email, user"
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
                <th className="px-4 py-3 text-left">Ticket</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Last message</th>
                <th className="px-4 py-3 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-slate-200 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        label={t.visitorEmail || t.user?.userId || "Visitor"}
                        imageUrl={t.user?.imageUrl}
                        size={32}
                      />
                      <div>
                        <Link
                          href={`/admin/support/tickets/${t.id}`}
                          className="font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                        >
                          #{t.id.slice(0, 8)}
                        </Link>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t.subject}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t.visitorEmail ?? t.user?.email ?? t.userId ?? "Visitor"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
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
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No tickets found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Talk to Sales leads</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Recent inbound requests from the Talk to Sales form.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {["NEW", "CONTACTED", "CLOSED"].map((s) => (
              <Link
                key={s}
                href={`/admin/support/tickets?leadStatus=${s}`}
                className={[
                  "rounded-full border px-3 py-1 transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                  leadStatus === s
                    ? "border-slate-900 text-slate-900 dark:border-slate-300 dark:text-slate-100"
                    : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500",
                ].join(" ")}
              >
                {s}
              </Link>
            ))}
            <Link
              href={`/admin/support/tickets`}
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
            >
              All
            </Link>
          </div>

          <form className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <input
              name="leadSearch"
              defaultValue={leadSearch}
              placeholder="Search name, email, company"
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
            />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300"
            >
              Search
            </button>
          </form>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">Lead</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Message</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {salesLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-slate-200 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {lead.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {lead.email}
                        {lead.phone ? ` • ${lead.phone}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {lead.company || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {lead.message.slice(0, 80)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {!salesLeads.length ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No Talk to Sales leads found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
