import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";
import TicketForm from "./TicketForm";

export default async function AdminNewTicketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return redirect("/dashboard");

  const userName =
    session.user.userId ?? (session.user as any).name ?? (session.user as any).email ?? "Admin";
  const imageUrl = (session.user as any).imageUrl;
  const defaultName = session.user.userId ?? (session.user as any).name ?? "";
  const defaultEmail = (session.user as any).email ?? "";

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav role={session.user.role} userName={userName} imageUrl={imageUrl} />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Create support ticket</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Open a ticket on behalf of a user or guest.
            </p>
          </div>
          <a
            href="/admin/support/tickets"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            Back to tickets
          </a>
        </div>

        <TicketForm defaultName={defaultName} defaultEmail={defaultEmail} />
      </div>
    </div>
  );
}
