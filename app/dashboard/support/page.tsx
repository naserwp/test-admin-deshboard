import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";

export default async function DashboardSupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return redirect("/auth/login");

  const userName =
    session.user.userId ?? (session.user as any).name ?? (session.user as any).email ?? "User";
  const imageUrl = (session.user as any).imageUrl;

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav role={session.user.role} userName={userName} imageUrl={imageUrl} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Support</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Access your chats and tickets from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href="/dashboard/support/chats"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
            >
              Chats
            </Link>
            <Link
              href="/dashboard/support/tickets"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
            >
              Tickets
            </Link>
            <Link
              href="/dashboard/support/waiting"
              className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:border-amber-300/60 dark:hover:bg-amber-500/20 dark:focus-visible:ring-amber-300/40"
            >
              Waiting
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Use the tabs above to review chat history or track ticket updates. Start a new chat with the
            bottom-right button or open a ticket for longer requests.
          </p>
        </div>
      </div>
    </div>
  );
}
