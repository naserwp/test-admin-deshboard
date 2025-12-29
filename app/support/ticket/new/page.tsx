import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Link from "next/link";
import TopNav from "@/app/components/TopNav";

export default async function NewSupportTicketPage() {
  const session = await getServerSession(authOptions);
  const userName =
    session?.user?.userId ??
    (session?.user as any)?.name ??
    (session?.user as any)?.email ??
    "Guest";
  const userEmail = (session?.user as any)?.email ?? "";
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100">
      {session?.user ? (
        <TopNav role={session.user.role} userName={userName} imageUrl={(session.user as any).imageUrl} />
      ) : null}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Create a support ticket</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Our team will notify you by email when we reply.
          </p>
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="What do you need help with?"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Description</label>
            <textarea
              name="message"
              required
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Describe your issue or request..."
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Your name</label>
              <input
                name="name"
                required
                defaultValue={userName}
                readOnly={isLoggedIn}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Email</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={userEmail}
                readOnly={isLoggedIn}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="you@example.com"
              />
            </div>
          </div>
          {!isLoggedIn ? (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Phone (optional)</label>
              <input
                name="phone"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="+1 555 123 4567"
              />
            </div>
          ) : null}

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
              You can add up to 5 images to help us reproduce the issue.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/support/tickets" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
              View my tickets
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900"
            >
              Submit ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
