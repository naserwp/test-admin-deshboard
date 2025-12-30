import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";

export default async function AdminSupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  const userName = session.user.userId ?? (session.user as any).email ?? "Admin";

  return (
    <div>
      <TopNav role={session.user.role} userName={userName} />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Support</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Manage user conversations and tickets.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/support/conversations"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
          >
            Conversations
          </Link>
          <Link
            href="/admin/support/tickets"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
          >
            Tickets
          </Link>
          <Link
            href="/admin/support/waiting"
            className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:border-amber-300/60 dark:hover:bg-amber-500/20 dark:focus-visible:ring-amber-300/40"
          >
            Waiting
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Choose a tab above to manage support conversations or tickets.
          </p>
        </div>
      </div>
    </div>
  );
}
