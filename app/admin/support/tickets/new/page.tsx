import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import TopNav from "@/app/components/TopNav";

export default async function AdminNewTicketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return redirect("/dashboard");

  const userName =
    session.user.userId ?? (session.user as any).name ?? (session.user as any).email ?? "Admin";

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      <TopNav role={session.user.role} userName={userName} imageUrl={(session.user as any).imageUrl} />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Create support ticket</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Open a ticket on behalf of a user or guest.
            </p>
          </div>
          <Link
            href="/admin/support/tickets"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            Back to tickets
          </Link>
        </div>

        <form
          action="/api/support/tickets"
          method="post"
          encType="multipart/form-data"
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Subject</label>
            <input
              name="subject"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
              placeholder="Ticket subject"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Description</label>
            <textarea
              name="message"
              required
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
              placeholder="Describe the issue..."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">User/Contact name</label>
              <input
                name="name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                placeholder="User name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Email</label>
              <input
                name="email"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:ring-indigo-500/30"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Upload screenshots (images, max 5MB each)
            </label>
            <input
              name="attachments"
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800 dark:text-slate-200 dark:file:bg-white dark:file:text-slate-900"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optional; up to 5 images.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/support/tickets"
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 dark:focus-visible:ring-sky-300"
            >
              Create ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
